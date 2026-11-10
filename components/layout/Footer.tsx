'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer className="bg-[#070b13] text-white border-t border-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        
        {/* Top Brand Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12 border-b border-neutral-800/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Logo variant="dark" size="md" />
            <div className="hidden sm:block h-6 w-px bg-neutral-800" />
            <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
              Official fashion dropshipping atelier. Curated women&apos;s apparel, men&apos;s streetwear, and luxury accessories across Dubai, the UAE, and worldwide.
            </p>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-3 text-neutral-400">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/palettehubb"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PALETTE HUB on Instagram"
              className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:text-white hover:border-neutral-700 hover:bg-neutral-800 transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@palette_hubb?_r=1&_t=ZS-9BHdgjBr5hk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PALETTE HUB on TikTok"
              className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:text-white hover:border-neutral-700 hover:bg-neutral-800 transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
              </svg>
            </a>
          </div>
        </div>

        {/* 4-Column Grid Structure matching attached reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 py-12">
          
          {/* Column 1: SHOP */}
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white mb-5">
              SHOP
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-neutral-400">
              <li>
                <Link href="/shop" prefetch={true} className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop" prefetch={true} className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/#featured-products" prefetch={true} className="hover:text-white transition-colors">
                  Featured Drops
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Men%27s%20Clothing" prefetch={true} className="hover:text-white transition-colors">
                  Men&apos;s Apparel
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Women%27s%20Clothing" prefetch={true} className="hover:text-white transition-colors">
                  Women&apos;s Fashion
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Accessories" prefetch={true} className="hover:text-white transition-colors">
                  Accessories & Chains
                </Link>
              </li>
              <li>
                <Link href="/#categories" prefetch={true} className="hover:text-white transition-colors">
                  Curated Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: VISIT US */}
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white mb-5">
              VISIT US
            </h3>
            <div className="space-y-4 text-xs sm:text-sm text-neutral-400">
              {/* Location Pin */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="block text-white font-medium">Dubai,</span>
                  <span className="text-neutral-400">United Arab Emirates</span>
                </div>
              </div>

              {/* Operating Schedule */}
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="block text-white font-medium">24/7 Online Store</span>
                  <span className="text-neutral-400">All Days (Mon – Sun)</span>
                </div>
              </div>

              {/* Direct Details Link */}
              <div className="pt-2">
                <Link
                  href="/about"
                  prefetch={true}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline transition-colors"
                >
                  <span>Store Details & FAQs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Column 3: TERMS AND CONDITIONS */}
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white mb-5">
              TERMS AND CONDITIONS
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-neutral-400">
              <li>
                <Link href="/privacy" prefetch={true} className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/track-order" prefetch={true} className="hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/terms" prefetch={true} className="hover:text-white transition-colors">
                  Return & Refund
                </Link>
              </li>
              <li>
                <Link href="/terms" prefetch={true} className="hover:text-white transition-colors">
                  Authenticity Guarantee
                </Link>
              </li>
              <li>
                <Link href="/terms" prefetch={true} className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/about" prefetch={true} className="hover:text-white transition-colors">
                  About PALETTE HUB
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: GET IN TOUCH */}
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white mb-5">
              GET IN TOUCH
            </h3>
            <div className="space-y-3.5 text-xs sm:text-sm text-neutral-400">
              {/* Customer Support */}
              <Link
                href="/contact"
                prefetch={true}
                className="flex items-center gap-3 hover:text-white transition-colors group cursor-pointer"
              >
                <Phone className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors shrink-0" />
                <span>Customer Support Helpdesk</span>
              </Link>

              {/* Email */}
              <a
                href="mailto:palettehubb@gmail.com"
                className="flex items-center gap-3 hover:text-white transition-colors truncate group cursor-pointer"
              >
                <Mail className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors shrink-0" />
                <span className="truncate">palettehubb@gmail.com</span>
              </a>

              {/* WhatsApp Message Us */}
              <a
                href="https://wa.me/971568181187?text=Hello%20PALETTE%20HUB"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with PALETTE HUB on WhatsApp"
                className="flex items-center gap-3 hover:text-white transition-colors group cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-neutral-400 group-hover:text-[#25D366] transition-colors shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Message Us</span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/palettehubb"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PALETTE HUB on Instagram"
                className="flex items-center gap-3 hover:text-white transition-colors group cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-neutral-400 group-hover:text-white transition-colors shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>@palettehubb</span>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@palette_hubb?_r=1&_t=ZS-9BHdgjBr5hk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PALETTE HUB on TikTok"
                className="flex items-center gap-3 hover:text-white transition-colors group cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-neutral-400 group-hover:text-white transition-colors shrink-0" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
                <span>@palette_hubb</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Legal, Returns & Copyright Row */}
        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
            <span>&copy; 2026 PALETTE HUB. Official Online Store. All rights reserved.</span>
            <span className="hidden sm:inline text-neutral-700">•</span>
            <span className="text-neutral-500">Dubai, United Arab Emirates</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SSL Protected Checkout</span>
            </span>
            <Link
              href="/admin"
              rel="nofollow"
              prefetch={false}
              className="hover:text-neutral-300 transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
