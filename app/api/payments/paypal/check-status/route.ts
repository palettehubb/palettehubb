import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getPayPalOrderDetails, capturePayPalOrder } from '@/lib/paypal';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import Supplier from '@/models/Supplier';
import { IOrderItem } from '@/types';
import { notifyNewOrder, notifyProductUpdated } from '@/lib/realtime';
import memoryStore from '@/lib/memoryStore';
import { sendOrderEmails } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paypalOrderId, customer, items, couponCode } = body;

    if (!paypalOrderId) {
      return NextResponse.json(
        { success: false, error: 'PayPal Order ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Check if order was already recorded for this PayPal order ID
    const existingOrder = await Order.findOne({ paypalOrderId }).lean();
    if (existingOrder) {
      return NextResponse.json({
        success: true,
        paid: true,
        orderNumber: existingOrder.orderNumber,
        order: existingOrder,
      });
    }

    // 2. Query PayPal API for live order status
    const orderDetails = await getPayPalOrderDetails(paypalOrderId);
    const orderStatus = orderDetails.status;

    // If buyer has not approved yet
    if (orderStatus === 'CREATED' || orderStatus === 'SAVED') {
      return NextResponse.json({
        success: true,
        paid: false,
        status: orderStatus,
      });
    }

    let captureData = orderDetails;
    let captureId = paypalOrderId;

    // 3. If approved by customer, capture the payment immediately
    if (orderStatus === 'APPROVED') {
      captureData = await capturePayPalOrder(paypalOrderId);
    }

    const isCompleted =
      captureData.status === 'COMPLETED' ||
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.status === 'COMPLETED';

    if (!isCompleted) {
      return NextResponse.json({
        success: true,
        paid: false,
        status: captureData.status || orderStatus,
      });
    }

    captureId =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      captureData.id ||
      paypalOrderId;

    // 4. Validate order items and calculate genuine server prices
    if (!customer || !customer.fullName || !customer.email || !customer.street) {
      return NextResponse.json(
        { success: false, error: 'Customer details are required to complete order' },
        { status: 400 }
      );
    }

    // Destination determination: Dubai vs Outside Dubai
    const country = (customer.country || 'United Arab Emirates').trim().toLowerCase();
    const state = (customer.state || 'Dubai').trim().toLowerCase();
    const isDubai =
      (country.includes('emirates') || country === 'uae' || country === 'united arab emirates') &&
      state === 'dubai';

    const verifiedItems: IOrderItem[] = [];
    let serverSubtotal = 0;
    let serverDelivery = 0;
    let serverTax = 0;
    const productDeliveryMap = new Map<string, number>();

    for (const item of items || []) {
      const dbProduct = await Product.findOne({
        $or: [{ _id: item.productId }, { slug: item.slug }],
      }).lean();

      if (!dbProduct) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.slug || item.productId}` },
          { status: 404 }
        );
      }

      const actualPrice = Number(dbProduct.price) || 0;
      const qty = Math.max(1, Number(item.quantity) || 1);
      const supplierId = dbProduct?.supplierId || item.supplierId;

      let supplierName: string | undefined = undefined;
      if (supplierId && mongoose.isValidObjectId(supplierId)) {
        const supp = await Supplier.findById(supplierId).lean();
        if (supp) supplierName = supp.name;
      } else if (supplierId) {
        const supp = await Supplier.findOne({ $or: [{ name: supplierId }, { email: supplierId }] }).lean();
        if (supp) supplierName = supp.name;
      }

      if (dbProduct && (dbProduct.stock ?? 0) < qty) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} left in stock.`,
          },
          { status: 400 }
        );
      }

      // Real-world logic: Delivery charge applies per unique product item to destination, not multiplied by count
      const prodKey = String(dbProduct._id || dbProduct.slug);
      if (!productDeliveryMap.has(prodKey)) {
        const itemDelivery = isDubai
          ? (Number(dbProduct.deliveryChargeInsideDubai) || 0)
          : (Number(dbProduct.deliveryChargeOutsideDubai) || 0);
        productDeliveryMap.set(prodKey, itemDelivery);
      }

      // Tax entered in admin as percentage rate (e.g. 5 = 5% of product line amount)
      const taxRatePercent = Number(dbProduct.tax) || 0;
      const lineTax = (actualPrice * qty * taxRatePercent) / 100;
      serverTax += lineTax;

      verifiedItems.push({
        productId: dbProduct?._id?.toString() || item.productId,
        name: dbProduct?.name || item.name,
        slug: dbProduct?.slug || item.slug,
        image: (dbProduct?.images && dbProduct.images[0]) || item.image,
        price: actualPrice,
        quantity: qty,
        size: item.size,
        color: item.color,
        supplierId: supplierId ? String(supplierId) : undefined,
        supplierName,
        itemStatus: 'Pending',
        deliveryChargeInsideDubai: dbProduct.deliveryChargeInsideDubai || 0,
        deliveryChargeOutsideDubai: dbProduct.deliveryChargeOutsideDubai || 0,
        tax: (actualPrice * taxRatePercent) / 100,
      });

      serverSubtotal += actualPrice * qty;

      // Update product inventory & sales atomically
      if (dbProduct) {
        await Product.updateOne(
          { _id: dbProduct._id },
          {
            $inc: {
              salesCount: qty,
              stock: -qty,
            },
          }
        );
        await Product.updateOne(
          { _id: dbProduct._id, stock: { $lt: 0 } },
          { $set: { stock: 0 } }
        );
      }
    }

    serverDelivery = Array.from(productDeliveryMap.values()).reduce((sum, v) => sum + v, 0);

    // Coupon discount verification
    let discount = 0;
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      if (coupon) {
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
        const meetsMin = !coupon.minOrderAmount || serverSubtotal >= coupon.minOrderAmount;

        if (notExpired && meetsMin) {
          if (coupon.discountType === 'percentage') {
            discount = (serverSubtotal * coupon.value) / 100;
          } else {
            discount = coupon.value;
          }
          discount = Math.min(discount, serverSubtotal);
          await Coupon.updateOne({ _id: coupon._id }, { $inc: { timesUsed: 1 } });
        }
      }
    }

    // Total Amount = Product Price (subtotal - discount) + Delivery Charge + Tax
    const finalTotal = Math.max(
      0,
      Math.round((serverSubtotal - discount + serverDelivery + serverTax) * 100) / 100
    );

    const orderNumber = `PH-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = await Order.create({
      orderNumber,
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        street: customer.street.trim(),
        city: customer.city.trim(),
        state: customer.state ? customer.state.trim() : 'Dubai',
        pincode: customer.pincode ? customer.pincode.trim() : '',
        country: customer.country || 'United Arab Emirates',
      },
      items: verifiedItems,
      subtotal: serverSubtotal,
      discount: Math.round(discount * 100) / 100,
      couponCode: discount > 0 ? couponCode : undefined,
      shipping: serverDelivery,
      tax: serverTax,
      total: finalTotal,
      paymentMethod: 'paypal',
      paymentStatus: 'paid',
      paypalOrderId,
      paypalCaptureId: captureId,
      orderStatus: 'Paid',
      supplierOrderRef: `SUP-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingCarrier: 'Bluedart Express',
      notes: `Paid via PayPal. Capture ID: ${captureId}`,
    });

    const plainOrder = typeof newOrder.toObject === 'function' ? newOrder.toObject() : newOrder;

    // Notify connected admin and supplier dashboards in real time
    try {
      notifyNewOrder(plainOrder);
      memoryStore.orders = [plainOrder, ...memoryStore.orders.filter((o) => o._id !== plainOrder._id)];
      for (const it of verifiedItems) {
        const prod = memoryStore.products.find((p) => p.slug === it.slug || p._id === it.productId);
        if (prod) {
          prod.stock = Math.max(0, (prod.stock ?? 0) - it.quantity);
          prod.salesCount = (prod.salesCount || 0) + it.quantity;
          notifyProductUpdated(prod);
        }
      }
    } catch (e) {
      console.warn('Realtime notify warning:', e);
    }

    // Send emails to Admin, Supplier, Customer
    try {
      sendOrderEmails(plainOrder).catch((err) => {
        console.error('Failed to send order emails asynchronously:', err);
      });
    } catch {}

    return NextResponse.json({
      success: true,
      paid: true,
      orderNumber: newOrder.orderNumber,
      order: plainOrder,
      captureId,
    });
  } catch (error: unknown) {
    console.error('Error in check-status endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal error processing payment status',
      },
      { status: 500 }
    );
  }
}
