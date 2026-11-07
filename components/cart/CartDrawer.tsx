'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight, Tag, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    shipping,
    tax,
    total,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!isOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponMessage(null);

    const result = await applyCoupon(couponCode);
    setApplying(false);
    if (result.success) {
      setCouponMessage({ text: result.message });
      setCouponCode('');
    } else {
      setCouponMessage({ text: result.message, error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h2 className="text-base font-bold text-neutral-900">
                Your Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mb-6">
                  Explore our curated fashion, suits, accessories, watches, and chains to elevate your style.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-[#985842] text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-[#834633] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="pt-4 first:pt-0 flex gap-4"
                >
                  {/* Item Image */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200/60">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="font-semibold text-sm text-neutral-900 hover:underline truncate"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          className="text-neutral-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.size && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Size: <span className="text-neutral-800 font-medium">{item.size}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-neutral-200 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1, item.size, item.color)
                          }
                          className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, item.size, item.color)
                          }
                          className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="font-bold text-sm text-neutral-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {items.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/50 space-y-4">
              
              {/* Coupon Code Input */}
              <div className="space-y-1.5">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs text-emerald-800">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Tag className="w-3.5 h-3.5" />
                      {appliedCoupon.code} (-${discount.toFixed(2)})
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon Code (e.g. WELCOME10)"
                      className="flex-1 uppercase bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs placeholder:text-neutral-400 focus:outline-none focus:border-black"
                    />
                    <button
                      type="submit"
                      disabled={applying || !couponCode.trim()}
                      className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {applying ? 'Applying...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <p
                    className={`text-[11px] font-medium ${
                      couponMessage.error ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Order Calculations */}
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>- ${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Dropship Delivery</span>
                  <span className="font-semibold text-neutral-900">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-extrabold text-neutral-900">
                  <span>Final Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#985842] text-white text-sm font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#834633] transition-colors shadow-md active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-center text-[11px] text-neutral-400">
                Free standard delivery on orders above $50. Sourced from verified suppliers.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
