import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Coupon from '@/models/Coupon';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const orderSubtotal = Number(subtotal) || 0;

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unreachable' }, { status: 503 });
    }

    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true }).lean();

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid or inactive coupon code' },
        { status: 404 }
      );
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This coupon has expired' },
        { status: 400 }
      );
    }

    if (coupon.minOrderAmount && orderSubtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount for coupon ${coupon.code} is $${coupon.minOrderAmount}`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderSubtotal * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    discount = Math.min(discount, orderSubtotal);

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        calculatedDiscount: Math.round(discount * 100) / 100,
      },
    });
  } catch (error: unknown) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
