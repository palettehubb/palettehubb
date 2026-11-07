import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder, convertInrToUsd } from '@/lib/paypal';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, couponCode, clientTotal } = body;

    let totalINR = 0;

    // Optional: Calculate server-side verified total if items provided
    if (items && Array.isArray(items) && items.length > 0) {
      await connectToDatabase();
      let serverSubtotal = 0;

      for (const item of items) {
        const dbProduct = await Product.findOne({
          $or: [{ _id: item.productId }, { slug: item.slug }],
        }).lean();
        const price = dbProduct ? dbProduct.price : item.price;
        const qty = Math.max(1, Number(item.quantity) || 1);
        serverSubtotal += price * qty;
      }

      let discount = 0;
      if (couponCode) {
        const cleanCode = couponCode.trim().toUpperCase();
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

      const shipping = serverSubtotal >= 50 ? 0 : 5.99;
      const tax = Math.round((serverSubtotal - discount) * 0.05 * 100) / 100;
      totalINR = Math.round((serverSubtotal - discount + shipping + tax) * 100) / 100;
    } else if (clientTotal && Number(clientTotal) > 0) {
      totalINR = Number(clientTotal);
    } else {
      return NextResponse.json(
        { success: false, error: 'Valid items or order amount required' },
        { status: 400 }
      );
    }

    // Direct USD total
    const totalUSD = Math.round(totalINR * 100) / 100;

    const paypalOrder = await createPayPalOrder({
      amount: totalUSD,
      currency: 'USD',
      description: 'Palette Hubb Fashion Dropship Order',
      referenceId: `ph_cart_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      orderId: paypalOrder.id,
      amountUSD: totalUSD,
      amountINR: totalINR,
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
