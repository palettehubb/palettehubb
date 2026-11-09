'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ICartItem, ICoupon } from '@/types';

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
      deliveryChargeInsideDubai?: number;
      deliveryChargeOutsideDubai?: number;
      tax?: number;
    },
    quantity?: number,
    size?: string,
    color?: string,
    customImage?: string
  ) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ) => void;
  clearCart: () => void;
  appliedCoupon: ICoupon | null;
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<ICoupon | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('palette_cart');
      const savedCoupon = localStorage.getItem('palette_coupon');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch {
      // LocalStorage errors ignored in SSR/Private mode
    }
    setMounted(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('palette_cart', JSON.stringify(items));
      if (appliedCoupon) {
        localStorage.setItem('palette_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('palette_coupon');
      }
    } catch {
      // LocalStorage errors ignored
    }
  }, [items, appliedCoupon, mounted]);

  const addItem = (
    product: {
      _id: string;
      name: string;
      slug: string;
      price: number;
      originalPrice?: number;
      images: string[];
      stock: number;
      deliveryChargeInsideDubai?: number;
      deliveryChargeOutsideDubai?: number;
      tax?: number;
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
        if (product.deliveryChargeInsideDubai !== undefined) {
          updated[existingIndex].deliveryChargeInsideDubai = product.deliveryChargeInsideDubai;
        }
        if (product.deliveryChargeOutsideDubai !== undefined) {
          updated[existingIndex].deliveryChargeOutsideDubai = product.deliveryChargeOutsideDubai;
        }
        if (product.tax !== undefined) {
          updated[existingIndex].tax = product.tax;
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
          deliveryChargeInsideDubai: product.deliveryChargeInsideDubai || 0,
          deliveryChargeOutsideDubai: product.deliveryChargeOutsideDubai || 0,
          tax: product.tax || 0,
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
      localStorage.removeItem('palette_cart');
      localStorage.removeItem('palette_coupon');
    } catch {
      // ignore
    }
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: subtotal }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        return { success: true, message: data.message || 'Coupon applied successfully!' };
      }
      return { success: false, message: data.error || 'Invalid coupon code' };
    } catch {
      return { success: false, message: 'Could not validate coupon' };
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

  // Base shipping & tax at cart level (finalized at checkout based on address)
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
