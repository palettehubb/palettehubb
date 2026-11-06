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
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/shop" className="hover:text-white transition-colors">
              Shop
            </Link>
            <Link href="/track-order" className="hover:text-white transition-colors">
              Track Order
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
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
              <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
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
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
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
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#0b0c0d"/>
              </svg>
            </a>

            {/* X / Twitter */}
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

        {/* Secondary Info & Dropshipping Notice */}
        <div className="py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400 border-b border-neutral-800/60">
          <p className="max-w-xl leading-relaxed">
            Palette Hubb is a premier fashion and lifestyle marketplace operating a supplier-fulfilled dropshipping model. All orders are sourced from verified manufacturers and delivered with express tracked shipping.
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Verified Dropshipping</span>
            <span>•</span>
            <span>100% Buyer Protection</span>
            <span>•</span>
            <span>Stripe Secure</span>
          </div>
        </div>

        {/* Bottom Row matching reference */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex flex-wrap items-center gap-3">
            <p>© 2026 Palette Hubb. All rights reserved.</p>
            <span>•</span>
            <Link href="/terms" className="hover:text-neutral-300 transition-colors underline underline-offset-4">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-neutral-300 transition-colors underline underline-offset-4">
              Privacy Policy
            </Link>
          </div>
          <p className="tracking-wider uppercase font-medium text-neutral-400">
            Fashion &nbsp;|&nbsp; Accessories &nbsp;|&nbsp; Lifestyle
          </p>
        </div>

      </div>
    </footer>
  );
}
