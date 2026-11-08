import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found | PALETTE HUB',
  description: 'The requested page could not be found on the official PALETTE HUB website.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-[#f7f5ee] flex flex-col items-center justify-center px-4 text-center select-none py-16">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-sm max-w-md w-full">
        <span className="text-4xl sm:text-5xl font-black text-[#985842] block mb-2 font-mono">
          404
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-xs text-neutral-600 mb-8 leading-relaxed">
          The page you are looking for may have moved, been renamed, or is temporarily unavailable. Explore our official collections below.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-neutral-800 transition-colors shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-neutral-900 border border-neutral-200 text-xs font-bold px-6 py-3 rounded-full hover:bg-neutral-50 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Explore Shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

