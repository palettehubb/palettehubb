'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  CreditCard,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { IOrder } from '@/types';

interface IDeviceOrder {
  orderNumber: string;
  total: number;
  date: string;
  itemsCount?: number;
}

export default function TrackOrderClient() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderNumber') || searchParams.get('orderId') || '';

  const [orderQuery, setOrderQuery] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<IOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceOrders, setDeviceOrders] = useState<IDeviceOrder[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('palette_device_orders');
      if (stored) {
        const parsed: IDeviceOrder[] = JSON.parse(stored);
        // Sort latest on top by date
        parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setDeviceOrders(parsed);
      }
    } catch {
      // storage error
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
        setError('Order not found. Please verify your Order Number (e.g., PH-10294).');
      }
    } catch {
      setError('Failed to fetch order status. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setOrderQuery(initialOrderId);
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderQuery);
  };

  // Milestone helpers
  const getStepStatus = (step: string, currentStatus: string) => {
    const steps = ['Paid', 'Processing', 'In Transit', 'Delivered'];
    const currentIdx = steps.indexOf(currentStatus);
    const stepIdx = steps.indexOf(step);

    if (currentStatus === 'Cancelled') {
      return 'cancelled';
    }
    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-[#f7f5ee] min-h-screen py-10 sm:py-16 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
            Live Dropship Fulfillment Tracking
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-2">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            View real-time supplier milestones, tracking numbers, and delivery dispatch updates.
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200/80 shadow-sm mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. PH-10294)"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-3 pl-12 pr-4 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black uppercase font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm py-3 px-8 rounded-2xl transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Searching...' : 'Track Package'}
            </button>
          </form>

          {/* Orders Placed On This Device - Sorted Latest First */}
          {deviceOrders.length > 0 && (
            <div className="mt-5 pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Recent Orders on this device (Latest on top):
                </span>
                <span className="text-[10px] text-neutral-400 font-medium">Click to view</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {deviceOrders.map((doItem) => {
                  const isSelected = order?.orderNumber === doItem.orderNumber;
                  return (
                    <button
                      key={doItem.orderNumber}
                      type="button"
                      onClick={() => {
                        setOrderQuery(doItem.orderNumber);
                        fetchOrder(doItem.orderNumber);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                          : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200/80 text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Package className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-neutral-500'}`} />
                        <div>
                          <span className="font-mono font-bold text-xs block">{doItem.orderNumber}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                            {new Date(doItem.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs">${doItem.total.toFixed(2)}</span>
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`} />
                      </div>
                    </button>
                  );
                })}
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

        {/* Order Details Display */}
        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-md space-y-8 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 font-mono">
                    #{order.orderNumber}
                  </h2>
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      order.orderStatus === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-black text-white'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0070ba] border border-sky-200">
                    PayPal Paid
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1.5 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-neutral-400 block">Total Order Amount</span>
                <p className="text-xl font-black text-neutral-900">
                  ${order.total.toFixed(2)} <span className="text-xs font-semibold text-neutral-500">USD</span>
                </p>
              </div>
            </div>

            {/* Delivery Progress Bar */}
            <div className="py-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-4">
                Milestones & Status
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                {['Paid', 'Processing', 'In Transit', 'Delivered'].map((step, idx) => {
                  const status = getStepStatus(step, order.orderStatus);
                  const isDone = status === 'completed' || status === 'current';
                  const isCurrent = status === 'current';

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                          isDone
                            ? isCurrent
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                              : 'bg-black text-white'
                            : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${
                          isDone ? 'text-neutral-900' : 'text-neutral-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier Tracking Badge */}
            <div className="p-5 rounded-2xl bg-[#f7f5ee] border border-neutral-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900">
                    {order.trackingCarrier || 'Global Express Courier'}
                  </h4>
                  <p className="text-xs text-neutral-600 font-mono mt-0.5">
                    AWB Tracking:{' '}
                    <span className="font-bold text-black">
                      {order.trackingNumber || 'Pending Dispatch Assignment'}
                    </span>
                  </p>
                </div>
              </div>

              {order.supplierOrderRef && (
                <div className="sm:text-right">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                    Fulfillment Reference
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-800">
                    {order.supplierOrderRef}
                  </span>
                </div>
              )}
            </div>

            {/* Products in this shipment */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                Shipment Contents ({order.items.length} items)
              </h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-200 flex-shrink-0 border border-neutral-200">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-bold text-xs sm:text-sm text-neutral-900 hover:underline block"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Qty: <strong>{item.quantity}</strong>{' '}
                          {item.size ? `• Size: ${item.size}` : ''}{' '}
                          {item.color ? `• Color: ${item.color}` : ''}
                        </p>
                        {item.supplierName && (
                          <span className="text-[10px] text-neutral-400">
                            Supplier: {item.supplierName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs sm:text-sm text-neutral-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary & Shipping Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-neutral-100 pt-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Shipping Address</span>
                </span>
                <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                  <strong className="text-neutral-900">{order.customer.fullName}</strong>
                  <br />
                  {order.customer.street}
                  <br />
                  {order.customer.city}, {order.customer.state} {order.customer.pincode}
                  <br />
                  <span className="font-bold text-black">{order.customer.country || 'United States'}</span>
                  <br />
                  Phone: {order.customer.phone}
                  <br />
                  Email: {order.customer.email}
                </p>
              </div>

              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-1.5 text-xs text-neutral-600">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-2">
                  Payment Summary
                </span>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">${order.subtotal.toFixed(2)}</span>
                </div>
                {order.discount ? (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-${order.discount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%)</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-neutral-900 text-sm">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
