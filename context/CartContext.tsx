'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ICartItem } from '@/types';

interface CartContextType {
  items: ICartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (
    product: {
      _id: string;
      name: string;
      slug: string;
      price: number;
      originalPrice?: number;
      images: string[];
      stock: number;
    },
    quantity?: number,
    size?: string,
    color?: string,
    customImage?: string
  ) => void;
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
        const parsedCart = JSON.parse(savedCart);
        queueMicrotask(() => setItems(parsedCart));
      }
      const savedCoupon = localStorage.getItem('palette_hubb_coupon');
      if (savedCoupon) {
        const parsedCoupon = JSON.parse(savedCoupon);
        queueMicrotask(() => setAppliedCoupon(parsedCoupon));
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
    color?: string,
    customImage?: string
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
        if (customImage) {
          updated[existingIndex].image = customImage;
        }
        return updated;
      }

      const chosenImage = customImage || (product.images && product.images[0]) || '/images/products/oversized-tshirt.png';

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          image: chosenImage,
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
    try {
      localStorage.removeItem('palette_hubb_cart');
      localStorage.removeItem('palette_hubb_coupon');
    } catch {}
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        const rawSubtotal = items.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );

        let calcDiscount = 0;
        if (data.coupon.discountType === 'percentage') {
          calcDiscount = (rawSubtotal * data.coupon.value) / 100;
        } else {
          calcDiscount = data.coupon.value;
        }
        calcDiscount = Math.min(calcDiscount, rawSubtotal);

        setAppliedCoupon({
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          value: data.coupon.value,
          calculatedDiscount: calcDiscount,
        });
        return { success: true, message: `Coupon ${data.coupon.code} applied successfully!` };
      }
      return { success: false, message: data.error || 'Invalid coupon code' };
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : 'Coupon validation failed' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discount = appliedCoupon.value;
    }
    discount = Math.min(discount, subtotal);
  }

  // No extra shipping or tax charges — strictly product price
  const shipping = 0;
  const tax = 0;
  const total = Math.max(0, subtotal - discount);
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
        discount,
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
