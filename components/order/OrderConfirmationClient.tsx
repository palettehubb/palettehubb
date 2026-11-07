'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Package,
  Truck,
  ArrowRight,
  Printer,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { IOrder } from '@/types';

interface OrderConfirmationClientProps {
  order: IOrder;
}

export default function OrderConfirmationClient({
  order,
}: OrderConfirmationClientProps) {
  useEffect(() => {
    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c5a880', '#985842', '#111111', '#10b981'],
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const statusSteps = [
    { title: 'Payment Confirmed', desc: 'Securely verified via server', done: true },
    {
      title: 'Routed to Supplier',
      desc: order.supplierOrderRef ? `Ref: ${order.supplierOrderRef}` : 'Awaiting automated dispatch',
      done: true,
    },
    {
      title: 'Dispatched & Tracking',
      desc: order.trackingNumber
        ? `${order.trackingCarrier || 'Bluedart'}: ${order.trackingNumber}`
        : 'Shipment label pending',
      done: Boolean(order.trackingNumber),
    },
    { title: 'Delivered', desc: 'Arriving in 3-5 business days', done: order.orderStatus === 'Delivered' },
  ];

  return (
    <div className="bg-[#f7f5ee] min-h-screen py-10 sm:py-16 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-md text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 border-2 border-emerald-100 shadow-sm animate-in zoom-in-75 duration-300">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <span className="text-xs font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Payment Verified & Order Placed
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-2">
            Thank You, {order.customer.fullName.split(' ')[0]}!
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Your dropship fashion order <span className="font-bold text-black">{order.orderNumber}</span> has been confirmed and routed to our verified manufacturer fulfillment hub.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <Link
              href={`/track-order?orderId=${order.orderNumber}`}
              className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Truck className="w-4 h-4" />
              <span>Live Order Tracking</span>
            </Link>
          </div>
        </div>

        {/* Dropshipping Fulfillment Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" />
            <span>Dropship Fulfillment Lifecycle</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {statusSteps.map((step, idx) => (
              <div key={step.title} className="flex sm:flex-col items-start gap-3 sm:gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    step.done
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                  }`}
                >
                  {step.done ? '✓' : idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">{step.title}</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {order.trackingNumber && (
            <div className="mt-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-neutral-500">Carrier Partner: </span>
                <span className="font-bold text-neutral-900">{order.trackingCarrier}</span>
              </div>
              <div>
                <span className="text-neutral-500">AWB Tracking Code: </span>
                <span className="font-mono font-bold text-black bg-white px-2.5 py-1 rounded-md border border-neutral-200">
                  {order.trackingNumber}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Order Details & Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Delivery Address
            </h3>
            <p className="font-bold text-sm text-neutral-900">{order.customer.fullName}</p>
            <p className="text-xs text-neutral-600 mt-1">{order.customer.street}</p>
            <p className="text-xs text-neutral-600">
              {order.customer.city}, {order.customer.state} - {order.customer.pincode}
            </p>
            <p className="text-xs text-neutral-600 mt-2">
              <span className="text-neutral-400">Phone: </span>
              {order.customer.phone}
            </p>
            <p className="text-xs text-neutral-600">
              <span className="text-neutral-400">Email: </span>
              {order.customer.email}
            </p>
          </div>

          {/* Payment & Financial Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm space-y-2 text-xs text-neutral-600">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Payment Summary
            </h3>
            <div className="flex justify-between">
              <span>Payment Mode</span>
              <span className="font-bold uppercase text-neutral-900">
                {order.paymentMethod === 'paypal'
                  ? 'PayPal'
                  : order.paymentMethod === 'test_pay'
                  ? 'Verified Online'
                  : 'Razorpay'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900">
                ${order.subtotal.toFixed(2)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount</span>
                <span>- ${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-semibold text-neutral-900">
                {order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5%)</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-neutral-200 pt-2 flex justify-between text-sm font-black text-black">
              <span>Total Paid</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* Ordered Items Preview */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm mb-10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
            Items in this Shipment ({order.items.length})
          </h3>
          <div className="space-y-4 divide-y divide-neutral-100">
            {order.items.map((item) => (
              <div key={item.productId} className="pt-4 first:pt-0 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-neutral-900 truncate">{item.name}</h4>
                  <p className="text-xs text-neutral-500">
                    Quantity: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}
                  </p>
                </div>
                <span className="font-black text-sm text-neutral-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Return to shop */}
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-black text-white text-xs sm:text-sm font-bold px-8 py-3.5 rounded-2xl hover:bg-neutral-800 transition-colors shadow-lg"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
