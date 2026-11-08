import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
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

    const verifiedItems: IOrderItem[] = [];
    let serverSubtotal = 0;

    for (const item of items) {
      const dbProduct = await Product.findOne({
        $or: [{ _id: item.productId }, { slug: item.slug }],
      }).lean();

      const actualPrice = dbProduct ? dbProduct.price : item.price;
      const qty = Math.max(1, Number(item.quantity) || 1);
      const supplierId = dbProduct?.supplierId || item.supplierId;

      let supplierName: string | undefined = undefined;
      if (supplierId) {
        const supp = await Supplier.findById(supplierId).lean();
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

    const shipping = serverSubtotal >= 50 ? 0 : 5.99;
    const tax = Math.round((serverSubtotal - discount) * 0.05 * 100) / 100;
    const finalTotal = Math.round((serverSubtotal - discount + shipping + tax) * 100) / 100;

    const orderNumber = `PH-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = await Order.create({
      orderNumber,
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        street: customer.street.trim(),
        city: customer.city.trim(),
        state: customer.state.trim(),
        pincode: customer.pincode.trim(),
        country: customer.country || 'India',
      },
      items: verifiedItems,
      subtotal: serverSubtotal,
      discount: Math.round(discount * 100) / 100,
      couponCode: discount > 0 ? couponCode : undefined,
      shipping,
      tax,
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
      const plainOrder = typeof newOrder.toObject === 'function' ? newOrder.toObject() : newOrder;
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

      // Asynchronously trigger customer, supplier, and admin email dispatch
      sendOrderEmails(plainOrder).catch((err) => {
        console.error('Async order email dispatch error:', err);
      });
    } catch (e) {
      console.warn('Realtime notify warning:', e);
    }

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.orderNumber,
      order: newOrder,
      captureId,
    });
  } catch (error: unknown) {
    console.error('Error capturing PayPal payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process PayPal order',
      },
      { status: 500 }
    );
  }
}
