'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Truck, Clock, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Package } from 'lucide-react';
import { IOrder } from '@/types';

export default function TrackOrderClient() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderQuery, setOrderQuery] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<IOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceOrders, setDeviceOrders] = useState<Array<{ orderNumber: string; total: number; date: string }>>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('palette_device_orders');
      if (stored) {
        setDeviceOrders(JSON.parse(stored));
      }
    } catch (e) {
      // storage
    }
  }, []);

  const fetchOrder = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
        setError('Order not found. Please verify your Order Number (e.g., PH-98241).');
      }
    } catch {
      setError('Failed to fetch order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderQuery);
  };

  return (
    <div className="bg-[#f7f5ee] min-h-screen py-10 sm:py-16 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-widest uppercase text-neutral-500">
            Real-Time Courier Tracking
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-1 mb-3">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Enter your Palette Hubb order number to view live supplier dispatch milestones and courier tracking.
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-md mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. PH-10294)"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-3 pl-12 pr-4 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black uppercase font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm py-3 px-8 rounded-2xl transition-colors shadow-md disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Searching...' : 'Track Package'}
            </button>
          </form>

          {/* Orders Placed On This Device */}
          {deviceOrders.length > 0 && (
            <div className="mt-5 pt-4 border-t border-neutral-100">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2.5">
                Orders Placed On This Device:
              </span>
              <div className="flex flex-wrap gap-2">
                {deviceOrders.map((doItem) => (
                  <button
                    key={doItem.orderNumber}
                    onClick={() => {
                      setOrderQuery(doItem.orderNumber);
                      fetchOrder(doItem.orderNumber);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f7f5ee] hover:bg-neutral-200/80 border border-neutral-200 rounded-xl text-xs font-mono font-bold text-neutral-800 transition-colors cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{doItem.orderNumber}</span>
                    {doItem.total && (
                      <span className="text-[10px] text-neutral-500 font-sans font-medium">
                        (${doItem.total})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900 text-xs font-medium mb-8">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Result Card */}
        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-md space-y-8 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black text-neutral-900">{order.orderNumber}</h2>
                  <span className="bg-black text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    {order.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  • Recipient: {order.customer.fullName}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-neutral-400">Total Order Value</span>
                <p className="text-lg font-black text-neutral-900">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Courier Tracking Badge */}
            <div className="p-5 rounded-2xl bg-[#f7f5ee] border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900">
                    {order.trackingCarrier || 'Bluedart Express Courier'}
                  </h4>
                  <p className="text-xs text-neutral-600 font-mono">
                    AWB Tracking:{' '}
                    <span className="font-bold text-black">
                      {order.trackingNumber || 'Pending Dispatch Label'}
                    </span>
                  </p>
                </div>
              </div>

              {order.supplierOrderRef && (
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider block">
                    Supplier Fulfillment Ref
                  </span>
                  <span className="text-xs font-bold text-neutral-800">{order.supplierOrderRef}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
                Products in this shipment
              </h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-200 flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-bold text-xs sm:text-sm text-neutral-900 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] text-neutral-500">
                          Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-neutral-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="border-t border-neutral-100 pt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                Shipping Destination
              </span>
              <p className="text-xs text-neutral-700 leading-relaxed">
                {order.customer.fullName} • {order.customer.phone}
                <br />
                {order.customer.street}, {order.customer.city}, {order.customer.state} -{' '}
                {order.customer.pincode}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
