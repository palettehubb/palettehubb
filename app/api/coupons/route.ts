import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Coupon from '@/models/Coupon';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, coupons });
    }

    return NextResponse.json({ success: true, coupons: [] });
  } catch (error: unknown) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve coupons' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Security check: Only verified admin session can create coupons
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body.code || body.value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Coupon code and value are required' },
        { status: 400 }
      );
    }

    const code = String(body.code).trim().toUpperCase();
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unreachable' }, { status: 503 });
    }

    const couponData = {
      code,
      discountType: body.discountType === 'fixed' ? 'fixed' : 'percentage',
      value: Number(body.value),
      minOrderAmount: Number(body.minOrderAmount) || 0,
      isActive: body.isActive !== false,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    };

    const coupon = await Coupon.findOneAndUpdate(
      { code },
      { $set: couponData },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save coupon' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Security check: Only verified admin session can update coupons
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body.code) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    const code = String(body.code).trim().toUpperCase();
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unreachable' }, { status: 503 });
    }

    const coupon = await Coupon.findOneAndUpdate({ code }, { $set: body }, { new: true }).lean();
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error: unknown) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Security check: Only verified admin session can delete coupons
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.toUpperCase();
    if (!code) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      await Coupon.findOneAndDelete({ code });
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
