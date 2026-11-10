import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Package,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';
import WhatsAppQuickLink from '@/components/contact/WhatsAppQuickLink';
import { SITE_URL, getBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contact Us | PALETTE HUB Official Customer Support',
  description:
    'Contact PALETTE HUB official customer support. Inquire about orders, dropshipping dispatch, returns, and fashion product sizing across Dubai, the UAE, and worldwide.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: 'Contact Us | PALETTE HUB Official Customer Support',
    description:
      'Official contact channels and concierge helpdesk for PALETTE HUB Dubai. Reach our support team for order inquiries and fashion sizing assistance.',
    url: `${SITE_URL}/contact`,
    siteName: 'PALETTE HUB',
    images: [
      {
        url: '/images/hero/hero-card-exact.png',
        width: 1200,
        height: 630,
        alt: 'Contact PALETTE HUB Official Website',
      },
    ],
    locale: 'en_AE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | PALETTE HUB Official Customer Support',
    description:
      'Official customer support channels for PALETTE HUB Dubai & UAE.',
    images: ['/images/hero/hero-card-exact.png'],
  },
};

export default function ContactPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' },
  ]);

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact PALETTE HUB',
    url: `${SITE_URL}/contact`,
    description:
      'Official contact portal for PALETTE HUB fashion dropshipping inquiries, customer support, and order status.',
    mainEntity: {
      '@type': 'Organization',
      name: 'PALETTE HUB',
      url: SITE_URL,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'palettehubb@gmail.com',
        areaServed: ['AE', 'Worldwide'],
        availableLanguage: ['English', 'Arabic'],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-8">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">Contact Us</span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-sm mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#985842]/10 text-[#985842] text-xs font-bold tracking-wider uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Helpdesk & Inquiries</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight mb-4">
            Get in Touch with PALETTE HUB
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Have questions about an existing dropshipping order, garment sizing, or returns? Our dedicated support team is here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column: Direct Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#985842] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Official Email</span>
                  <a
                    href="mailto:palettehubb@gmail.com"
                    className="text-sm font-bold text-neutral-900 hover:text-[#985842] transition-colors"
                  >
                    palettehubb@gmail.com
                  </a>
                  <p className="text-[11px] text-neutral-500 mt-1">Average response within 12–24 business hours.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Headquarters & Operating Hub</span>
                  <p className="text-sm font-bold text-neutral-900">Dubai, United Arab Emirates (UAE)</p>
                  <p className="text-[11px] text-neutral-500 mt-1">Supplying UAE Emirates & International Destinations.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#003087] flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Live Order Tracking</span>
                  <p className="text-xs text-neutral-600 mt-1 mb-2">Check the current milestone of your garment shipment directly.</p>
                  <Link
                    href="/track-order"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#985842] hover:underline"
                  >
                    <span>Open Live Order Tracker →</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Operational Schedule</span>
                  <p className="text-sm font-bold text-neutral-900">Monday – Sunday</p>
                  <p className="text-[11px] text-neutral-500 mt-1">Online storefront open 24/7. Orders dispatched automatically to suppliers.</p>
                </div>
              </div>
            </div>

            {/* Official Social Media & Direct Chat Channels */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-3">Official Direct Channels</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <WhatsAppQuickLink />

                <a
                  href="https://www.instagram.com/palettehubb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 text-xs font-bold text-neutral-900 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram</span>
                </a>

                <a
                  href="https://www.tiktok.com/@palette_hubb?_r=1&_t=ZS-9BHdgjBr5hk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 text-xs font-bold text-neutral-900 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                  </svg>
                  <span>TikTok</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 pb-3 mb-5 border-b border-neutral-100 flex items-center justify-between">
                <span>Send Us a Direct Message</span>
                <span className="text-xs text-neutral-400 font-normal">All inquiries answered</span>
              </h2>

              <ContactForm />
            </div>
          </div>
        </div>

        {/* Quick Help Guide */}
        <div className="bg-neutral-100/70 rounded-3xl p-6 sm:p-8 border border-neutral-200 text-xs text-neutral-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-neutral-900 mb-1 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Important Returns & Claims Guideline:</span>
          </div>
          <p className="leading-relaxed">
            Per PALETTE HUB&apos;s transparent <strong>3-Day Return Policy</strong>, all damaged or incorrect delivery claims must be accompanied by an uninterrupted unboxing video recorded prior to breaking the outer parcel seal. Please reference your order number when contacting support.
          </p>
        </div>
      </div>
    </div>
  );
}

