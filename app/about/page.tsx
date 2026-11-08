import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Store,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { SITE_URL, getBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'About Us | PALETTE HUB Official Website',
  description:
    'Discover the story of PALETTE HUB – Dubai’s premier fashion dropshipping atelier. Learn about our curated fashion collections, verified suppliers, and worldwide customer dedication.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About Us | PALETTE HUB Official Website',
    description:
      'The story behind PALETTE HUB: Dubai’s premier online fashion dropshipping store providing curated women’s clothing, men’s garments, and luxury lifestyle accessories.',
    url: `${SITE_URL}/about`,
    siteName: 'PALETTE HUB',
    images: [
      {
        url: '/images/hero/hero-card-exact.png',
        width: 1200,
        height: 630,
        alt: 'About PALETTE HUB Official Website',
      },
    ],
    locale: 'en_AE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | PALETTE HUB Official Website',
    description:
      'The story behind PALETTE HUB: Dubai’s premier online fashion dropshipping store.',
    images: ['/images/hero/hero-card-exact.png'],
  },
};

export default function AboutPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' },
  ]);

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About PALETTE HUB',
    url: `${SITE_URL}/about`,
    description:
      'PALETTE HUB is the official fashion dropshipping marketplace based in Dubai, United Arab Emirates, offering curated men’s and women’s apparel and luxury accessories.',
    mainEntity: {
      '@type': 'Organization',
      name: 'PALETTE HUB',
      url: SITE_URL,
      logo: `${SITE_URL}/images/phlogo.jpeg`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dubai',
        addressCountry: 'AE',
      },
    },
  };

  return (
    <div className="bg-[#f7f5ee] min-h-screen py-12 sm:py-16 text-neutral-900 select-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-8">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">About Us</span>
        </div>

        {/* Hero Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-sm mb-10 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#985842]/10 text-[#985842] text-xs font-bold tracking-wider uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Brand Story</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight mb-4">
            About PALETTE HUB
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to the official online destination of <strong>PALETTE HUB</strong>. Headquartered in Dubai, United Arab Emirates, we curate modern apparel, oversized streetwear, tailored formalwear, and premium lifestyle accessories for fashion-forward individuals worldwide.
          </p>
        </div>

        {/* Core Brand Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-7 rounded-3xl border border-neutral-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#985842] flex items-center justify-center mb-5">
              <Store className="w-6 h-6 stroke-[2]" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">
              Curated Fashion Atelier
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Every garment at PALETTE HUB is hand-selected for contemporary fit, premium textile quality, and timeless aesthetic value. We bridge the gap between runway trends and everyday street style.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-neutral-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
              <Truck className="w-6 h-6 stroke-[2]" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">
              Direct Dropship Dispatch
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We partner directly with verified fashion manufacturing hubs and specialty suppliers. Orders are routed rapidly to source facilities, guaranteeing competitive prices without intermediary markups.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-neutral-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#003087] flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">
              Protected Buyer Experience
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Your security is paramount. We offer live PayPal encrypted transactions, real-time courier tracking milestones, and a customer-focused 3-Day Return Policy supported by video unboxing verification.
            </p>
          </div>
        </div>

        {/* Business Information Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-sm mb-12">
          <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#985842]" />
            <span>Official Business Details & Geographical Base</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-neutral-700">
            <div className="space-y-3">
              <div>
                <span className="font-bold text-neutral-900 block uppercase tracking-wider text-[11px]">Official Brand Name</span>
                <span>PALETTE HUB (also known as PaletteHub)</span>
              </div>
              <div>
                <span className="font-bold text-neutral-900 block uppercase tracking-wider text-[11px]">Business Model</span>
                <span>Direct-to-Consumer Fashion Dropshipping & Lifestyle Apparel</span>
              </div>
              <div>
                <span className="font-bold text-neutral-900 block uppercase tracking-wider text-[11px]">Headquarters & Primary Hub</span>
                <span>Dubai, United Arab Emirates (UAE)</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-bold text-neutral-900 block uppercase tracking-wider text-[11px]">Official Website Domain</span>
                <span className="font-mono text-[#985842] font-semibold">{SITE_URL}</span>
              </div>
              <div>
                <span className="font-bold text-neutral-900 block uppercase tracking-wider text-[11px]">Customer Support Email</span>
                <span>palettehubb@gmail.com</span>
              </div>
              <div>
                <span className="font-bold text-neutral-900 block uppercase tracking-wider text-[11px]">Primary Delivery Markets</span>
                <span>Dubai, Abu Dhabi, Sharjah, Ajman, All UAE Emirates & Worldwide</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA to Explore Catalog */}
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2.5 bg-black text-white text-xs sm:text-sm font-bold px-8 py-4 rounded-full hover:bg-neutral-800 transition-colors shadow-lg hover:shadow-xl"
          >
            <span>Explore PALETTE HUB Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

