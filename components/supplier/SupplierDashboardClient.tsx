'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  LogOut,
  Bell,
  RefreshCw,
  Search,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Lock,
  Mail,
} from 'lucide-react';
import { IOrder, IOrderItem } from '@/types';
import { requestNotificationPermission, showDeviceNotification } from '@/lib/clientNotification';

interface SupplierInfo {
  id: string;
  name: string;
  email: string;
  contactName?: string;
  phone?: string;
}

interface SupplierOrderItem extends IOrderItem {
  assignedItems?: IOrderItem[];
}

export default function SupplierDashboardClient() {
  const [supplier, setSupplier] = useState<SupplierInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Orders & State
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<
    Record<string, { status: string; trackingNumber: string; carrier: string }>
  >({});
  const [notifGranted, setNotifGranted] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  // Check auth session on load
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/supplier/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.supplier) {
          setSupplier(data.supplier);
        } else {
          setSupplier(null);
        }
      } else {
        setSupplier(null);
      }
    } catch (e) {
      setSupplier(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifGranted(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) {
      showDeviceNotification(
        'Notifications Enabled!',
        'You will receive instant alerts on this device whenever a client orders your products.',
        '/supplier-dashboard'
      );
    }
  };

  // Fetch supplier orders
  const fetchOrders = useCallback(async () => {
    if (!supplier) return;
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/supplier/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (e) {
      console.error('Error loading supplier orders:', e);
    } finally {
      setOrdersLoading(false);
    }
  }, [supplier]);

  useEffect(() => {
    if (supplier) {
      fetchOrders();
    }
  }, [supplier, fetchOrders]);

  // Real-time EventSource listener for instant orders
  useEffect(() => {
    if (!supplier) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events/orders');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_ORDER' && payload.order) {
            const newOrd: IOrder = payload.order;
            // Check if order has items assigned to this supplier
            const hasMyItems = newOrd.items.some(
              (it) => it.supplierId === supplier.id || it.supplierName === supplier.name || !it.supplierId
            );

            if (hasMyItems) {
              setOrders((prev) => [newOrd, ...prev.filter((o) => o._id !== newOrd._id)]);
              showDeviceNotification(
                `🔔 New Order Received #${newOrd.orderNumber}`,
                `Customer: ${newOrd.customer.fullName} — Amount: $${newOrd.total.toFixed(2)}`,
                '/supplier-dashboard'
              );
            }
          } else if (payload.type === 'ORDER_UPDATED' && payload.order) {
            const updated: IOrder = payload.order;
            setOrders((prev) =>
              prev.map((o) => (o._id === updated._id || o.orderNumber === updated.orderNumber ? updated : o))
            );
          }
        } catch (e) {
          // ignore heartbeat / comments
        }
      };
    } catch (e) {
      console.warn('Real-time connection error:', e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [supplier]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSubmittingLogin(true);

    try {
      const res = await fetch('/api/supplier/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Login failed. Please verify your credentials.');
      } else {
        setSupplier(data.supplier);
        // Prompt for notifications on login
        requestNotificationPermission().then((g) => setNotifGranted(g));
      }
    } catch (err) {
      setLoginError('Network error. Please try again.');
    } finally {
      setSubmittingLogin(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/supplier/auth/logout', { method: 'POST' });
      setSupplier(null);
      setOrders([]);
    } catch (e) {
      setSupplier(null);
    }
  };

  // Handle draft changes for item status & tracking
  const handleDraftChange = (orderId: string, field: 'status' | 'trackingNumber' | 'carrier', value: string) => {
    setStatusDrafts((prev) => {
      const current = prev[orderId] || {
        status: 'Processing',
        trackingNumber: '',
        carrier: 'Bluedart Express',
      };
      return {
        ...prev,
        [orderId]: { ...current, [field]: value },
      };
    });
  };

  // Update fulfillment state
  const handleUpdateStatus = async (order: IOrder) => {
    const draft = statusDrafts[order._id] || {
      status: 'Dispatched',
      trackingNumber: order.trackingNumber || '',
      carrier: order.trackingCarrier || 'Bluedart Express',
    };

    setUpdatingOrderId(order._id);
    setUpdateFeedback(null);

    try {
      const res = await fetch('/api/supplier/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          itemStatus: draft.status,
          trackingNumber: draft.trackingNumber,
          trackingCarrier: draft.carrier,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUpdateFeedback(`Status for order #${order.orderNumber} successfully updated to ${draft.status}.`);
        fetchOrders();
      } else {
        alert(data.error || 'Failed to update order state');
      }
    } catch (err) {
      alert('Network error while updating order status');
    } finally {
      setUpdatingOrderId(null);
      setTimeout(() => setUpdateFeedback(null), 4000);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== 'all') {
      const matchesItemStatus = o.items.some((it) => it.itemStatus === selectedStatus);
      const matchesOrderStatus = o.orderStatus === selectedStatus;
      if (!matchesItemStatus && !matchesOrderStatus) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCust = o.customer.fullName.toLowerCase().includes(q);
      const matchItem = o.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchNum && !matchCust && !matchItem) return false;
    }
    return true;
  });

  // Calculate metrics
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) =>
    o.items.some((i) => !i.itemStatus || i.itemStatus === 'Pending')
  ).length;
  const inProgressCount = orders.filter((o) =>
    o.items.some((i) => i.itemStatus === 'Processing' || i.itemStatus === 'Dispatched')
  ).length;
  const deliveredCount = orders.filter((o) =>
    o.items.every((i) => i.itemStatus === 'Delivered')
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5ee] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // LOGIN SCREEN
  // --------------------------------------------------------------------------
  if (!supplier) {
    return (
      <div className="min-h-screen bg-[#f7f5ee] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-black text-white rounded-2xl mb-4 shadow-lg">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            Supplier Portal Login
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-600">
            Palette Hubb fulfillment partner authentication & real-time dispatch dashboard.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white py-6 sm:py-8 px-5 sm:px-10 shadow-xl rounded-2xl sm:rounded-3xl border border-[#ded7ca]/60">
            <form className="space-y-5" onSubmit={handleLogin}>
              {loginError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Supplier Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="partner@supplier.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Credentials provided by Palette Hubb Administrator.
                </p>
              </div>

              <button
                type="submit"
                disabled={submittingLogin}
                className="w-full bg-black text-white hover:bg-neutral-800 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingLogin ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Access Fulfillment Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED DASHBOARD
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#f7f5ee] pb-16">
      {/* Top Bar */}
      <header className="bg-white border-b border-[#e5dfd3]/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black text-white rounded-xl flex items-center justify-center font-black text-sm shrink-0">
              PH
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-neutral-900 truncate">
                  {supplier.name}
                </h1>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-bold rounded-full uppercase shrink-0">
                  Verified Partner
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-500 font-medium truncate">
                {supplier.email} {supplier.contactName ? `• Rep: ${supplier.contactName}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!notifGranted ? (
              <button
                onClick={handleEnableNotifications}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs"
              >
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span>Enable Notifications</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Notifications Active</span>
              </span>
            )}

            <button
              onClick={fetchOrders}
              disabled={ordersLoading}
              title="Refresh Orders"
              className="p-2 border border-neutral-200 bg-neutral-50 hover:bg-white rounded-xl text-neutral-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6">
        {updateFeedback && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{updateFeedback}</span>
          </div>
        )}

        {/* Real-time ticker badge */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Order Fulfillment Console
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Real-time synchronization for orders assigned to {supplier.name}.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-neutral-200 text-xs font-bold text-neutral-700 shadow-2xs">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            <span>Real-Time Stream Active</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ded7ca]/60 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              <Package className="w-4 h-4 text-neutral-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900">{totalOrdersCount}</div>
            <div className="text-[11px] text-neutral-400 mt-1">Assigned to your facility</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ded7ca]/60 shadow-2xs">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Action</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">{pendingCount}</div>
            <div className="text-[11px] text-neutral-400 mt-1">Requires immediate packing</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ded7ca]/60 shadow-2xs">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">In Transit</span>
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600">{inProgressCount}</div>
            <div className="text-[11px] text-neutral-400 mt-1">Dispatched to courier</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ded7ca]/60 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Delivered</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{deliveredCount}</div>
            <div className="text-[11px] text-neutral-400 mt-1">Confirmed customer receipt</div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#ded7ca]/60 shadow-2xs mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer, item..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-black focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer shrink-0 ${
                  selectedStatus === st
                    ? 'bg-black text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Order Cards List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#ded7ca]/60 shadow-2xs">
            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-800">No Orders Found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria or status filter.'
                : 'When customers place orders with items assigned to your supply chain, they will populate here instantaneously.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((ord) => {
              const draft = statusDrafts[ord._id] || {
                status: ord.orderStatus || 'Processing',
                trackingNumber: ord.trackingNumber || '',
                carrier: ord.trackingCarrier || 'Bluedart Express',
              };

              return (
                <div
                  key={ord._id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#ded7ca]/70 shadow-2xs transition-all hover:border-black/30 overflow-hidden"
                >
                  {/* Top Bar of Order Card */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm sm:text-base font-black text-neutral-900 bg-neutral-100 px-3 py-1 rounded-xl">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-500">Order Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'Shipped' || ord.orderStatus === 'Ordered from Supplier'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Items & Shipping Address Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
                    {/* Items column */}
                    <div className="lg:col-span-2 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Assigned Line Items ({ord.items.length})
                      </h4>
                      <div className="space-y-2.5">
                        {ord.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80"
                          >
                            <div className="relative w-14 h-14 bg-white rounded-xl overflow-hidden border border-neutral-200 shrink-0">
                              <Image
                                src={it.image || '/images/products/oversized-tshirt.png'}
                                alt={it.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                                {it.name}
                              </h5>
                              <div className="text-[11px] text-neutral-500 flex flex-wrap gap-2 mt-0.5">
                                {it.size && <span>Size: <b>{it.size}</b></span>}
                                {it.color && <span>Color: <b>{it.color}</b></span>}
                                <span>Qty: <b>{it.quantity}</b></span>
                                <span>Unit: ${it.price.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-bold text-xs sm:text-sm text-neutral-900">
                                ${(it.price * it.quantity).toFixed(2)}
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-200 rounded-md text-neutral-700">
                                {it.itemStatus || 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Destination Column */}
                    <div className="bg-[#fcfbf7] p-4 rounded-2xl border border-[#ded7ca]/60 text-xs space-y-2">
                      <h4 className="font-bold uppercase tracking-wider text-neutral-500">
                        Shipping Address
                      </h4>
                      <div className="font-bold text-neutral-900 text-sm">{ord.customer.fullName}</div>
                      <div className="text-neutral-600 leading-relaxed">
                        {ord.customer.street}<br />
                        {ord.customer.city}, {ord.customer.state} - {ord.customer.pincode}<br />
                        {ord.customer.country}
                      </div>
                      <div className="pt-2 text-neutral-600 border-t border-neutral-200">
                        <div><b>Phone:</b> {ord.customer.phone}</div>
                        <div><b>Email:</b> {ord.customer.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Fulfillment Action Form */}
                  <div className="border-t border-neutral-100 pt-4 bg-neutral-50/50 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-2xl sm:rounded-b-3xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="w-full sm:flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                            Delivery Status
                          </label>
                          <select
                            value={draft.status}
                            onChange={(e) => handleDraftChange(ord._id, 'status', e.target.value)}
                            className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-black"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing / Packed</option>
                            <option value="Dispatched">Dispatched / In Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                            Courier Carrier
                          </label>
                          <input
                            type="text"
                            value={draft.carrier}
                            onChange={(e) => handleDraftChange(ord._id, 'carrier', e.target.value)}
                            placeholder="e.g. Bluedart, Delhivery"
                            className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-black"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                            Tracking Number (AWB)
                          </label>
                          <input
                            type="text"
                            value={draft.trackingNumber}
                            onChange={(e) => handleDraftChange(ord._id, 'trackingNumber', e.target.value)}
                            placeholder="e.g. BD-8924190"
                            className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleUpdateStatus(ord)}
                        disabled={updatingOrderId === ord._id}
                        className="w-full sm:w-auto bg-black text-white hover:bg-neutral-800 px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {updatingOrderId === ord._id ? 'Updating...' : 'Update Fulfillment'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
