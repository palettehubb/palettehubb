'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import CartDrawer from '@/components/cart/CartDrawer';

function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Prevent browser scroll jump glitch to footer on page transitions
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ScrollRestoration />
          {children}
          <CartDrawer />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
