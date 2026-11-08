import React from 'react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import OrderConfirmationClient from '@/components/order/OrderConfirmationClient';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import memoryStore from '@/lib/memoryStore';
import { IOrder } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Order Confirmed — PALETTE HUB',
  description: 'Your dropshipping order has been confirmed.',
  robots: {
    index: false,
    follow: false,
  },
};

export const instant = false;

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { id } = await params;
  let order: IOrder | null = null;

  try {
    await connection();
    const db = await connectToDatabase();
    if (db) {
      const o = await Order.findOne({
        $or: [{ orderNumber: id }, { _id: id }],
      }).lean();
      if (o) order = JSON.parse(JSON.stringify(o));
    }
  } catch (e) {
    console.error(e);
  }

  if (!order) {
    order = memoryStore.orders.find((o) => o.orderNumber === id || o._id === id) || null;
  }

  if (!order) {
    notFound();
  }

  return <OrderConfirmationClient order={order} />;
}
