'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  Lock,
  Tag,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { IShippingAddress, IOrder } from '@/types';
import PayPalButton from '@/components/checkout/PayPalButton';
import { convertInrToUsd } from '@/lib/paypal';

export default function CheckoutClient() {
  const router = useRouter();
  const {
    items,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    appliedCoupon,
    clearCart,
  } = useCart();

  const [address, setAddress] = useState<IShippingAddress>({
    fullName: 'Faiz Khan',
    email: 'faizk@example.com',
    phone: '+91 98765 43210',
    street: '104, Royal Crest, Linking Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400052',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'test_pay' | 'paypal'>('paypal');
  const [agreedToReturnPolicy, setAgreedToReturnPolicy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Add items to checkout.');
      return;
    }

    if (!address.fullName || !address.email || !address.phone || !address.street || !address.city || !address.pincode) {
      setErrorMessage('Please fill in all required shipping address fields.');
      return;
    }

    if (!agreedToReturnPolicy) {
      setErrorMessage('Please agree to the 3-Day Return Policy and mandatory unboxing video requirement to place your order.');
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Request Payment Order from server
      const paymentOrderRes = await fetch('/api/payments/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      const paymentOrderData = await paymentOrderRes.json();
      if (!paymentOrderData.success) {
        throw new Error(paymentOrderData.error || 'Payment gateway initialization failed');
      }

      // Step 2: Handle Razorpay modal (if live keys) or Sandbox instant verification
      let verifiedPaymentId = `pay_sim_${Date.now()}`;

      if (paymentOrderData.isLive && typeof window !== 'undefined' && (window as unknown as { Razorpay: unknown }).Razorpay) {
        // Live Razorpay popup flow
        throw new Error('Live Razorpay credentials configured, please test in sandbox mode or fill secrets.');
      } else {
        // Step 2b: Server-side signature verification call
        const verifyRes = await fetch('/api/payments/verify-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: paymentOrderData.orderId,
            razorpay_payment_id: verifiedPaymentId,
            razorpay_signature: 'sandbox_verified_signature',
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          throw new Error('Payment signature verification failed.');
        }
        verifiedPaymentId = verifyData.paymentId;
      }

      // Step 3: Create Verified Order on server (with server-side re-pricing)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: address,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            slug: i.slug,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          couponCode: appliedCoupon?.code,
          paymentMethod,
          razorpayOrderId: paymentOrderData.orderId,
          razorpayPaymentId: verifiedPaymentId,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Order creation failed.');
      }

      handleOrderSuccess(orderData.order);
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred during checkout. Please try again.'
      );
      setProcessing(false);
    }
  };

  const handleOrderSuccess = (order: IOrder) => {
    try {
      const existing = JSON.parse(localStorage.getItem('palette_device_orders') || '[]');
      const updatedDeviceOrders = [
        {
          orderNumber: order.orderNumber,
          date: new Date().toISOString(),
          total: order.total,
          itemsCount: order.items?.length || 1,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...existing.filter((o: any) => o.orderNumber !== order.orderNumber),
      ].slice(0, 10);
      localStorage.setItem('palette_device_orders', JSON.stringify(updatedDeviceOrders));
    } catch (e) {
      // storage error
    }
    clearCart();
    router.push(`/order-confirmation/${order.orderNumber}`);
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#f7f5ee] min-h-screen py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-white p-8 rounded-3xl shadow-sm text-center border border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Your Bag is Empty</h2>
          <p className="text-xs text-neutral-500 mb-6">
            You cannot proceed to checkout without adding products to your bag.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-black text-white text-xs font-semibold px-6 py-3 rounded-full hover:bg-neutral-800"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f5ee] min-h-screen py-10 sm:py-14 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black">
              Shop
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">Secure Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-emerald-700" />
            <span>Express Dropship Checkout</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            256-Bit SSL Encrypted. Direct dispatch from verified supplier hubs.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-xs font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Customer & Shipping Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Customer & Address Info */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100 flex items-center justify-between">
                <span>1. Shipping & Customer Details</span>
                <span className="text-xs font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Step 1 of 2
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={address.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={address.phone}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                  Email Address (for Order Updates & Tracking) *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={address.email}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                  Street Address / Flat / Landmark *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={address.street}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={address.city}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={address.state}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={address.pincode}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Gateway Selection */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100 flex items-center justify-between">
                <span>2. Payment Method</span>
                <span className="text-xs font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Step 2 of 2
                </span>
              </h2>

              <div className="space-y-3">
                {/* PayPal Payment Option */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'paypal'
                      ? 'border-[#0070ba] bg-sky-50/50 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                    className="mt-1 accent-[#0070ba]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-2">
                        <span>PayPal / Cards</span>
                        <span className="text-[10px] bg-[#0070ba] text-white font-bold px-2 py-0.5 rounded">
                          GLOBAL & CARDS
                        </span>
                      </span>
                      <span className="text-xs font-black tracking-tight text-[#003087]">
                        PayPal
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Pay securely with Debit/Credit card (Visa, MasterCard, Amex) or PayPal account in USD.
                    </p>
                  </div>
                </label>

                {/* Instant Sandbox / Test Pay Option */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'test_pay'
                      ? 'border-black bg-neutral-50/70 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="test_pay"
                    checked={paymentMethod === 'test_pay'}
                    onChange={() => setPaymentMethod('test_pay')}
                    className="mt-1 accent-black"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-neutral-900">
                        Online Test Payment (Pre-configured Evaluation)
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        RECOMMENDED
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Simulates complete Razorpay payment verification on server, generates real tracking ID and dropshipping workflow immediately without test cards.
                    </p>
                  </div>
                </label>

                {/* Razorpay Gateway Option */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'razorpay'
                      ? 'border-black bg-neutral-50/70 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="mt-1 accent-black"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-neutral-900">
                        Razorpay Gateway (UPI / Cards / NetBanking)
                      </span>
                      <CreditCard className="w-4 h-4 text-neutral-400" />
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Supports Indian UPI (Google Pay, PhonePe, Paytm), debit/credit cards, and net banking.
                    </p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Placement */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-md sticky top-28 space-y-6">
              <h2 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
                Order Review ({items.length} items)
              </h2>

              {/* Items preview list */}
              <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-neutral-100 pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="pt-3 first:pt-0 flex items-center gap-3"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-neutral-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-neutral-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="border-t border-neutral-100 pt-4 space-y-2 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Coupon Discount ({appliedCoupon?.code})
                    </span>
                    <span>- ${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Dropship Fulfillment</span>
                  <span className="font-semibold text-neutral-900">
                    {shipping === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Applicable Tax (5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-neutral-200 pt-3 flex justify-between text-base font-extrabold text-neutral-900">
                  <span>Total Amount</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Mandatory Policy Agreement Checkbox */}
              <div className="pt-1">
                <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-colors ${
                  !agreedToReturnPolicy && errorMessage?.includes('Return Policy')
                    ? 'bg-red-50/60 border-red-300'
                    : 'bg-neutral-50 hover:bg-neutral-100/70 border-neutral-200/80'
                }`}>
                  <input
                    type="checkbox"
                    checked={agreedToReturnPolicy}
                    onChange={(e) => {
                      setAgreedToReturnPolicy(e.target.checked);
                      if (errorMessage?.includes('Return Policy')) {
                        setErrorMessage(null);
                      }
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-[#985842] focus:ring-[#985842] accent-[#985842] cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-neutral-600 leading-snug">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="font-semibold text-neutral-900 underline underline-offset-2 hover:text-[#985842]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      3-Day Return Policy
                    </Link>{' '}
                    and the mandatory unboxing video requirement for damages.
                  </span>
                </label>
              </div>

              {/* Payment Action: PayPal Smart Buttons OR Traditional Checkout CTA */}
              {paymentMethod === 'paypal' ? (
                <div className="pt-1">
                  <PayPalButton
                    customer={address}
                    items={items}
                    couponCode={appliedCoupon?.code}
                    totalINR={total}
                    disabled={!agreedToReturnPolicy}
                    onSuccess={(confirmedOrder) => {
                      handleOrderSuccess(confirmedOrder);
                    }}
                    onError={(err) => {
                      setErrorMessage(err);
                    }}
                  />
                  {!agreedToReturnPolicy && (
                    <p className="text-[11px] text-amber-700 text-center mt-2">
                      Please check the Return Policy agreement above to activate PayPal checkout.
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-[#985842] text-white text-sm font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#834633] transition-all shadow-lg active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Secure Payment...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Pay ${total.toFixed(2)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              <div className="space-y-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2 text-neutral-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Server-validated pricing & Stripe secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Truck className="w-4 h-4 text-neutral-800" />
                  <span>Automated dropship order routing to supplier</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <Lock className="w-4 h-4 text-neutral-400" />
                  <span>256-bit SSL encrypted • View our <Link href="/privacy" target="_blank" className="underline hover:text-neutral-800">Privacy Policy</Link></span>
                </div>
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
