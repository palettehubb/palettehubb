import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { notifyOrderUpdated } from '@/lib/realtime';
import memoryStore from '@/lib/memoryStore';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = await connectToDatabase();

    if (db) {
      const query = mongoose.isValidObjectId(id)
        ? { $or: [{ orderNumber: id }, { _id: id }] }
        : { orderNumber: id };

      const order = await Order.findOne(query).lean();
      if (order) {
        return NextResponse.json({ success: true, order });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Order not found' },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error('Error fetching order by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Security check: Only verified admin session can update orders
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    const allowedFields = [
      'orderStatus',
      'paymentStatus',
      'supplierOrderRef',
      'trackingNumber',
      'trackingCarrier',
      'notes',
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const db = await connectToDatabase();
    if (db) {
      const query = mongoose.isValidObjectId(id)
        ? { $or: [{ orderNumber: id }, { _id: id }] }
        : { orderNumber: id };

      const updated = await Order.findOneAndUpdate(
        query,
        { $set: updates },
        { new: true }
      ).lean();

      if (updated) {
        notifyOrderUpdated(updated);
        return NextResponse.json({
          success: true,
          order: updated,
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Order not found or database unavailable' },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Security check: Only verified admin session can delete orders
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unreachable' },
        { status: 503 }
      );
    }

    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { orderNumber: id }] }
      : { orderNumber: id };

    const deleted = await Order.findOneAndDelete(query).lean();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    try {
      memoryStore.orders = memoryStore.orders.filter(
        (o) => o._id !== id && o.orderNumber !== id && o._id?.toString() !== deleted._id?.toString()
      );
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
