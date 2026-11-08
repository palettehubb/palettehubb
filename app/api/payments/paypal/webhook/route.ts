import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { sendOrderEmails } from '@/lib/email';
import { notifyNewOrder, notifyOrderUpdated } from '@/lib/realtime';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    const eventType = event.event_type;
    console.log(`[PayPal Webhook Received] Event: ${eventType}, ID: ${event.id}`);

    await connectToDatabase();

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;
      const captureId = resource.id;
      const customId = resource.custom_id;
      const parentPayment = resource.parent_payment;

      // Find order by captureId or orderNumber or notes
      const order = await Order.findOne({
        $or: [
          { paypalCaptureId: captureId },
          { orderNumber: customId },
          { notes: { $regex: captureId, $options: 'i' } },
        ],
      });

      if (order) {
        if (order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          if (order.orderStatus === 'Pending') {
            order.orderStatus = 'Paid';
          }
          order.paypalCaptureId = captureId;
          await order.save();

          const plainOrder = order.toObject();
          try {
            notifyOrderUpdated(plainOrder);
          } catch {}

          sendOrderEmails(plainOrder).catch((err) => {
            console.error('[Webhook] Email dispatch error:', err);
          });
        }
      }
    } else if (eventType === 'PAYMENT.CAPTURE.DENIED') {
      const resource = event.resource;
      const captureId = resource.id;

      const order = await Order.findOne({
        $or: [{ paypalCaptureId: captureId }, { notes: { $regex: captureId, $options: 'i' } }],
      });

      if (order) {
        order.paymentStatus = 'failed';
        await order.save();
        try {
          notifyOrderUpdated(order.toObject());
        } catch {}
      }
    } else if (eventType === 'PAYMENT.CAPTURE.REFUNDED') {
      const resource = event.resource;
      const captureId = resource.parent_payment || resource.id;

      const order = await Order.findOne({
        $or: [{ paypalCaptureId: captureId }, { notes: { $regex: captureId, $options: 'i' } }],
      });

      if (order) {
        order.paymentStatus = 'refunded';
        order.orderStatus = 'Cancelled';
        await order.save();
        try {
          notifyOrderUpdated(order.toObject());
        } catch {}
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: unknown) {
    console.error('[PayPal Webhook Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}
