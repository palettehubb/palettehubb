'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer className="bg-[#0b0c0d] text-white border-t border-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        
        {/* Main Row matching reference */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-neutral-800">
          
          {/* Official Brand Logo */}
          <div className="flex items-center">
            <Logo variant="dark" size="md" />
          </div>

          {/* Navigation Links matching reference */}
          <nav className="flex items-center gap-6 sm:gap-8 text-sm font-medium text-neutral-300 flex-wrap justify-center">
            <Link href="/" prefetch={true} className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/shop" prefetch={true} className="hover:text-white transition-colors">
              Shop
            </Link>
            <Link href="/track-order" prefetch={true} className="hover:text-white transition-colors">
              Track Order
            </Link>
            <Link href="/terms" prefetch={true} className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" prefetch={true} className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/admin" prefetch={true} className="hover:text-white transition-colors">
              Admin
            </Link>
          </nav>

          {/* Social Media Icons matching reference */}
          <div className="flex items-center gap-5 text-neutral-400">
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Palette Hubb on Instagram"
              className="hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Palette Hubb on Facebook"
              className="hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.595 0 9 1.582 9 4.615V8z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Palette Hubb on YouTube"
              className="hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* Twitter / X */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Palette Hubb on X"
              className="hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>

        </div>

        {/* Legal, Returns & Copyright Row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          
          <div className="flex items-center gap-2">
            <span>&copy; 2026 Palette Hubb Inc. All rights reserved.</span>
            <span className="text-neutral-600">•</span>
            <span className="text-emerald-500 font-medium">SSL Encrypted Checkout</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-neutral-500">
              3-Day Return Window (Requires Unboxing Video)
            </span>
            <Link href="/terms" prefetch={true} className="hover:text-neutral-300 transition-colors underline underline-offset-4">
              Terms & Conditions
            </Link>
            <Link href="/privacy" prefetch={true} className="hover:text-neutral-300 transition-colors underline underline-offset-4">
              Privacy Policy
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
