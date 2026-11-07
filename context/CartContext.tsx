'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ICartItem, ICoupon } from '@/types';

interface CartContextType {
  items: ICartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    images: string[];
    stock: number;
  }, quantity?: number, size?: string, color?: string) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  appliedCoupon: { code: string; discountType: string; value: number; calculatedDiscount: number } | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ICartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    value: number;
    calculatedDiscount: number;
  } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('palette_hubb_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem('palette_hubb_coupon');
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Failed to parse cart storage', e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('palette_hubb_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart storage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('palette_hubb_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('palette_hubb_coupon');
      }
    } catch (e) {
      console.error('Failed to save coupon storage', e);
    }
  }, [appliedCoupon]);

  const addItem = (
    product: {
      _id: string;
      name: string;
      slug: string;
      price: number;
      originalPrice?: number;
      images: string[];
      stock: number;
    },
    quantity = 1,
    size?: string,
    color?: string
  ) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === product._id &&
          i.size === (size || undefined) &&
          i.color === (color || undefined)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(
          updated[existingIndex].quantity + quantity,
          product.stock || 99
        );
        updated[existingIndex].quantity = newQty;
        return updated;
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images[0] || '/images/products/oversized-tshirt.png',
          quantity: Math.min(quantity, product.stock || 99),
          size,
          color,
          stock: product.stock,
        },
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string, size?: string, color?: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.productId === productId &&
            i.size === (size || undefined) &&
            i.color === (color || undefined)
          )
      )
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (
          i.productId === productId &&
          i.size === (size || undefined) &&
          i.color === (color || undefined)
        ) {
          return { ...i, quantity: Math.min(quantity, i.stock || 99) };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        return { success: true, message: `Coupon ${data.coupon.code} applied!` };
      }
      return { success: false, message: data.error || 'Invalid coupon code' };
    } catch {
      return { success: false, message: 'Failed to apply coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discount = appliedCoupon.value;
    }
    discount = Math.min(discount, subtotal);
  }

  const shipping = subtotal === 0 || subtotal >= 50 ? 0 : 5.99;
  const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100;
  const total = Math.max(0, Math.round((subtotal - discount + shipping + tax) * 100) / 100);
  const totalItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount: Math.round(discount * 100) / 100,
        shipping,
        tax,
        total,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
