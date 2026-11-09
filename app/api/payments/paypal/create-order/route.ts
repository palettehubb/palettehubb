import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, couponCode, customer } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid items are required for checkout' },
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
    const country = (customer?.country || 'United Arab Emirates').trim().toLowerCase();
    const state = (customer?.state || 'Dubai').trim().toLowerCase();
    const isDubai =
      (country.includes('emirates') || country === 'uae' || country === 'united arab emirates') &&
      state === 'dubai';

    let serverSubtotal = 0;
    let serverDelivery = 0;
    let serverTax = 0;
    const productDeliveryMap = new Map<string, number>();

    // STRICT SERVER-SIDE & DATABASE CALCULATION (Prevents any client price manipulation)
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

      const qty = Math.max(1, Number(item.quantity) || 1);
      const actualPrice = Number(dbProduct.price) || 0;
      serverSubtotal += actualPrice * qty;

      // Real-world logic: Delivery charge applies per unique product item to destination, not multiplied by quantity
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
    }

    serverDelivery = Array.from(productDeliveryMap.values()).reduce((sum, v) => sum + v, 0);

    // Server-side genuine coupon verification
    let discount = 0;
    if (couponCode) {
      const cleanCode = String(couponCode).trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      if (coupon) {
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
        const meetsMin = !coupon.minOrderAmount || serverSubtotal >= coupon.minOrderAmount;
        if (notExpired && meetsMin) {
          discount =
            coupon.discountType === 'percentage'
              ? (serverSubtotal * coupon.value) / 100
              : coupon.value;
          discount = Math.min(discount, serverSubtotal);
        }
      }
    }

    // Total Amount = Product Price (subtotal - discount) + Delivery Charge + Tax
    const finalTotalUSD = Math.max(
      0,
      Math.round((serverSubtotal - discount + serverDelivery + serverTax) * 100) / 100
    );

    if (finalTotalUSD <= 0) {
      return NextResponse.json(
        { success: false, error: 'Calculated order total must be greater than zero' },
        { status: 400 }
      );
    }

    const paypalOrder = await createPayPalOrder({
      amount: finalTotalUSD,
      currency: 'USD',
      description: `PALETTE HUB - ${items.length} items (${isDubai ? 'Dubai' : 'Standard'} Delivery)`,
      referenceId: `ph_cart_${Date.now()}`,
    });

    const approveLink =
      paypalOrder.links?.find((l: { rel: string; href: string }) => l.rel === 'approve' || l.rel === 'payer-action')?.href ||
      `https://www.paypal.com/checkoutnow?token=${paypalOrder.id}`;

    return NextResponse.json({
      success: true,
      orderId: paypalOrder.id,
      approvalUrl: approveLink,
      amountUSD: finalTotalUSD,
      breakdown: {
        subtotal: serverSubtotal,
        discount,
        shipping: serverDelivery,
        tax: serverTax,
        total: finalTotalUSD,
        isDubai,
      },
      status: paypalOrder.status,
    });
  } catch (error: unknown) {
    console.error('Error initiating PayPal order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate PayPal payment order',
      },
      { status: 500 }
    );
  }
}
