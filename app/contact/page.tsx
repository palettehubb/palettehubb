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

