import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import Supplier from '@/models/Supplier';
import { IOrderItem } from '@/types';
import { notifyNewOrder } from '@/lib/realtime';
import memoryStore from '@/lib/memoryStore';
import { sendOrderEmails } from '@/lib/email';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
    const page = Math.max(1, Number(searchParams.get('page')) || 1);

    // Security threat fix: Listing all orders requires verified admin authentication
    if (!email) {
      const adminSession = await getAdminSession();
      if (!adminSession) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Admin credentials required to view full order repository.' },
          { status: 401 }
        );
      }
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: true, count: 0, orders: [] });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (email) query['customer.email'] = email.toLowerCase().trim();
    if (status && status !== 'all') query.orderStatus = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      count: orders.length,
      total,
      page,
      orders,
    });
  } catch (error: unknown) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, couponCode, paymentMethod } = body;

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

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unreachable' },
        { status: 503 }
      );
    }

    // Determine destination: Inside Dubai vs Outside Dubai
    const country = (customer.country || 'United Arab Emirates').trim().toLowerCase();
    const state = (customer.state || 'Dubai').trim().toLowerCase();
    const isDubai =
      (country.includes('emirates') || country === 'uae' || country === 'united arab emirates') &&
      state === 'dubai';

    // SERVER-SIDE PRICE, DELIVERY & INVENTORY VALIDATION
    const verifiedItems: IOrderItem[] = [];
    let serverSubtotal = 0;
    let serverDelivery = 0;
    let serverTax = 0;

    for (const item of items) {
      // Find genuine product in database
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

      // Find supplier name if assigned
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
            error: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} units available.`,
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

      // Increment product sales count and decrement stock atomically in DB
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

    // Server-side genuine discount calculation
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
          // Increment coupon usage
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
      paymentMethod: paymentMethod || 'test_pay',
      paymentStatus: 'paid',
      razorpayOrderId: body.razorpayOrderId || `order_${Math.random().toString(36).substring(2, 10)}`,
      razorpayPaymentId: body.razorpayPaymentId || `pay_${Math.random().toString(36).substring(2, 10)}`,
      orderStatus: 'Paid',
      supplierOrderRef: `SUP-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingNumber: `EXP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      trackingCarrier: 'Bluedart Express',
    });

    try {
      const orderPlain = JSON.parse(JSON.stringify(newOrder));
      notifyNewOrder(orderPlain);
      memoryStore.orders = [orderPlain, ...memoryStore.orders];
    } catch {}

    try {
      sendOrderEmails(newOrder).catch((err) => {
        console.error('Failed to send order emails asynchronously:', err);
      });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        orderNumber: newOrder.orderNumber,
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
