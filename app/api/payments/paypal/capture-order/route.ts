import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { capturePayPalOrder } from '@/lib/paypal';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import Supplier from '@/models/Supplier';
import { IOrderItem } from '@/types';
import { notifyNewOrder } from '@/lib/realtime';
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

    if (!customer || !customer.fullName || !customer.email || !customer.phone || !customer.street) {
      return NextResponse.json(
        { success: false, error: 'Complete customer shipping address is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // 1. Capture the payment on PayPal REST API
    const captureData = await capturePayPalOrder(paypalOrderId);

    // Verify completion
    const isCompleted =
      captureData.status === 'COMPLETED' ||
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.status === 'COMPLETED';

    if (!isCompleted) {
      return NextResponse.json(
        {
          success: false,
          error: `PayPal payment not completed. Current status: ${captureData.status}`,
        },
        { status: 400 }
      );
    }

    const captureId =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      captureData.id ||
      paypalOrderId;

    // 2. Connect to Database and Validate Order Data
    await connectToDatabase();

    // Idempotency check: Return existing order if this PayPal payment was already processed
    const existingOrder = await Order.findOne({
      $or: [{ paypalOrderId }, { paypalCaptureId: captureId }],
    }).lean();

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        orderNumber: existingOrder.orderNumber,
        order: existingOrder,
        captureId,
        idempotent: true,
      });
    }

    // Determine destination: Inside Dubai vs Outside Dubai
    const country = (customer.country || 'United Arab Emirates').trim().toLowerCase();
    const state = (customer.state || 'Dubai').trim().toLowerCase();
    const isDubai =
      (country.includes('emirates') || country === 'uae' || country === 'united arab emirates') &&
      state === 'dubai';

    const verifiedItems: IOrderItem[] = [];
    let serverSubtotal = 0;
    let serverDelivery = 0;
    let serverTax = 0;

    for (const item of items) {
      const dbProduct = await Product.findOne({
        $or: [{ _id: item.productId }, { slug: item.slug }],
      }).lean();

      if (!dbProduct) {
        return NextResponse.json(
          { success: false, error: `Product not found in catalog: ${item.slug || item.productId}` },
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

      const itemDelivery = isDubai
        ? (Number(dbProduct.deliveryChargeInsideDubai) || 0)
        : (Number(dbProduct.deliveryChargeOutsideDubai) || 0);
      serverDelivery += itemDelivery * qty;

      const itemTax = Number(dbProduct.tax) || 0;
      serverTax += itemTax * qty;

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
        tax: itemTax,
      });

      serverSubtotal += actualPrice * qty;

      // Update product inventory & sales atomically with concurrency guard
      if (dbProduct) {
        await Product.updateOne(
          { _id: dbProduct._id, stock: { $gte: qty } },
          {
            $inc: {
              salesCount: qty,
              stock: -qty,
            },
          }
        );
      }
    }

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
      notes: `Paid via PayPal (${captureData.payer?.email_address || 'Verified'}). Capture ID: ${captureId}`,
    });

    // Notify connected admin and supplier dashboards in real time
    try {
      const orderPlain = JSON.parse(JSON.stringify(newOrder));
      notifyNewOrder(orderPlain);
      memoryStore.orders = [orderPlain, ...memoryStore.orders];
    } catch {}

    // Send instant customer confirmation email and supplier alerts
    try {
      sendOrderEmails(newOrder).catch((err) => {
        console.error('Failed to send order emails asynchronously:', err);
      });
    } catch {}

    return NextResponse.json({
      success: true,
      orderNumber,
      order: newOrder,
      captureId,
    });
  } catch (error: unknown) {
    console.error('Error capturing PayPal order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to finalize verified PayPal order',
      },
      { status: 500 }
    );
  }
}
