import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Shield,
  Lock,
  CreditCard,
  Truck,
  Eye,
  FileText,
  Database,
  UserCheck,
  Cookie,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

import { SITE_URL, getBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Security | PALETTE HUB Dubai',
  description:
    'Learn how PALETTE HUB handles and protects customer information, secure payment processing, and order routing across Dubai, the UAE, and worldwide.',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Privacy Policy', url: '/privacy' },
  ]);

  return (
    <div className="min-h-screen bg-white py-12 sm:py-16 text-neutral-900 select-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Storefront</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="border-b border-neutral-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-bold tracking-wider uppercase mb-4 border border-neutral-200">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Data Protection & Privacy Standards</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 font-medium">
            How Palette Hubb safeguards your personal data, handles dropship fulfillment, and ensures encrypted financial transactions via PayPal.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mt-5 pt-4 border-t border-neutral-100 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-neutral-400" />
              Effective Date: <strong>November 2026</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              256-Bit SSL Encryption
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#0070ba]">
              <CreditCard className="w-4 h-4" />
              PayPal Verified Live Integration
            </span>
          </div>
        </div>

        {/* Highlight Card: PayPal Financial Protection */}
        <div className="bg-sky-50/60 rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm mb-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0070ba] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0070ba] block mb-1">
                Official Gateway Compliance
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mb-2">
                100% Secure Payments via PayPal
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed mb-4">
                All financial payments on <strong>Palette Hubb</strong> (including debit cards, credit cards, and PayPal accounts) are processed directly through <strong>PayPal Holdings, Inc.</strong> via TLS 1.3 / 256-bit SSL encrypted tokenization.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-800">
                <div className="p-3.5 rounded-2xl bg-white border border-sky-200/60 flex items-start gap-2.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Card Storage:</strong> Palette Hubb never receives, stores, or sees your credit card number, CVV, or bank login details.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-sky-200/60 flex items-start gap-2.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Buyer Protection:</strong> Transactions are covered under PayPal Buyer Protection policies against unauthorized charges.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8 text-neutral-700 text-sm leading-relaxed">
          
          {/* Section 1 */}
          <div className="border border-neutral-200 rounded-3xl p-6 sm:p-8 bg-neutral-50/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-neutral-700" />
              <span>Section 1</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">1. Information We Collect</h3>
            <p>
              When you purchase garments, accessories, or collectibles from Palette Hubb, we collect the necessary information required to process and dispatch your parcel:
            </p>
            <ul className="space-y-2 list-disc list-inside pl-2 text-xs sm:text-sm text-neutral-600">
              <li><strong>Customer Contact Details:</strong> Full Name, Email Address, and Phone Number for order status and tracking milestones.</li>
              <li><strong>Shipping Destination:</strong> Street address, Apartment/Suite, City, State/Province, Postal Code, and Country.</li>
              <li><strong>Order History:</strong> Product items, selected sizes, quantities, order date, order reference numbers, and payment status.</li>
              <li><strong>Return Verification Media:</strong> Continuous unboxing video files or links submitted for transit damage or defective item claims under our 3-Day Return Policy.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="border border-neutral-200 rounded-3xl p-6 sm:p-8 bg-neutral-50/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <Truck className="w-4 h-4 text-neutral-700" />
              <span>Section 2</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">2. Dropship Fulfillment & Supplier Data Sharing</h3>
            <p>
              Palette Hubb operates a curated direct-to-consumer dropshipping model. In order to dispatch your order directly from our manufacturing partner hubs:
            </p>
            <ul className="space-y-2 list-disc list-inside pl-2 text-xs sm:text-sm text-neutral-600">
              <li>Your recipient name, delivery address, and phone number are passed securely to the verified manufacturing facility assigned to print and pack your order.</li>
              <li>Logistics couriers (e.g. Bluedart, FedEx, DHL, Delhivery) receive your delivery address solely for shipping and tracking services.</li>
              <li><strong>We NEVER sell or monetize your data:</strong> Palette Hubb never sells, rents, leases, or trades your personal information to third-party marketing brokers or advertising networks.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="border border-neutral-200 rounded-3xl p-6 sm:p-8 bg-neutral-50/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <Cookie className="w-4 h-4 text-neutral-700" />
              <span>Section 3</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">3. Cookies & Local Browser Storage</h3>
            <p>
              We utilize essential browser cookies and local storage tokens to deliver a frictionless shopping experience:
            </p>
            <ul className="space-y-2 list-disc list-inside pl-2 text-xs sm:text-sm text-neutral-600">
              <li><strong>Cart & Wishlist Persistence:</strong> Products saved in your bag or wishlist remain in your local browser memory across sessions.</li>
              <li><strong>Device Order Tracking:</strong> Recent order numbers placed on your device are saved locally so you can check live milestones on the Track Order page with one click.</li>
              <li><strong>Authentication Tokens:</strong> Secure HTTP-only cookies are used to verify authenticated administrative and supplier operations.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="border border-neutral-200 rounded-3xl p-6 sm:p-8 bg-neutral-50/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <Database className="w-4 h-4 text-neutral-700" />
              <span>Section 4</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">4. Data Retention & Cryptographic Safeguards</h3>
            <p>
              We maintain order records for accounting, legal taxation, and warranty validation. All stored information is protected using industry-standard technical measures:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-neutral-200">
                <strong className="block text-neutral-900 mb-1">Encrypted Transit</strong>
                <span>100% of network traffic is encrypted via HTTPS / TLS 1.3 certificates.</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-neutral-200">
                <strong className="block text-neutral-900 mb-1">Password Hashing</strong>
                <span>All account credentials are protected using salted bcrypt hash algorithms.</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-neutral-200">
                <strong className="block text-neutral-900 mb-1">Session Invalidation</strong>
                <span>Immediate multi-device token revocation upon password modification.</span>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="border border-neutral-200 rounded-3xl p-6 sm:p-8 bg-neutral-50/30 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-neutral-700" />
              <span>Section 5</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">5. Your Consumer Rights & Contact</h3>
            <p>
              You have the right to request access to the personal data we maintain regarding your purchases, request delivery detail corrections, or request data deletion under applicable global privacy regulations (including GDPR and CCPA).
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Official Privacy & Compliance Support
                </span>
                <span className="text-sm font-bold text-neutral-900">palettehubb@gmail.com</span>
              </div>
              <a
                href="mailto:palettehubb@gmail.com?subject=Privacy%20Data%20Request"
                className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Privacy Team</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
