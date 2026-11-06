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
  AlertCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Palette Hubb',
  description:
    'Learn how Palette Hubb collects, protects, and handles your personal information, including our Stripe-secured payment processing and dropship fulfillment.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f7f5ee] py-10 sm:py-16 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ded7ca]/70 shadow-sm mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4ebe1] text-[#8c674b] text-[11px] font-semibold tracking-widest uppercase mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-[#985842] font-medium mb-4">
            How we protect your data, fulfill orders, and process payments securely via Stripe.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-500 pt-3 border-t border-neutral-100">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-neutral-400" />
              Effective Date: <strong className="text-neutral-700">January 1, 2026</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              256-bit SSL Encrypted
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Stripe PCI-DSS Level 1 Certified
            </span>
          </div>

          <p className="mt-5 text-sm sm:text-base text-neutral-600 leading-relaxed">
            Welcome to <strong>Palette Hubb</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy outlines what information we collect, how it is used, and the security measures we take to safeguard your purchases and personal details.
          </p>
        </div>

        {/* Highlight Card: Stripe Payment Security */}
        <div className="bg-gradient-to-br from-[#1a1714] to-[#29221c] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-800 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#635BFF] text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
            Stripe Verified
          </div>

          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/10">
              <CreditCard className="w-6 h-6 text-[#7a73ff]" />
            </div>
            <div className="flex-1 pr-14 sm:pr-0">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1">
                <span>Secure Financial Processing</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Payment Security Powered by Stripe
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4 font-light">
                All digital transactions on Palette Hubb are handled directly through <strong>Stripe, Inc.</strong>, a global leader in payment processing with the highest grade of payment security (PCI-DSS Level 1 compliance).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-200">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Card Storage:</strong> Palette Hubb never stores or accesses your full credit card number, CVV, or banking credentials.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>End-to-End Encryption:</strong> Financial details are tokenized and sent straight to Stripe via TLS 1.3 / 256-bit SSL encryption.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">

          {/* Section 1: Information We Collect */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded7ca]/70 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#f4ebe1] flex items-center justify-center text-[#985842] shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-[#985842] uppercase tracking-wider">Section 1</span>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  1. Information We Collect
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  We collect information necessary to fulfill your fashion orders and offer an exceptional shopping experience:
                </p>

                <ul className="space-y-3 text-xs sm:text-sm text-neutral-700">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 shrink-0" />
                    <div>
                      <strong>Contact & Shipping Data:</strong> Full name, shipping address, city, state, postal code, phone number, and email address for order delivery and tracking notifications.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 shrink-0" />
                    <div>
                      <strong>Order & Transaction Records:</strong> Purchased products, sizes, quantities, order date, order reference numbers, and payment status (provided by Stripe).
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 shrink-0" />
                    <div>
                      <strong>Return & Verification Evidence:</strong> Continuous unboxing video files or links submitted for transit damage or defective item claims under our 3-Day Return Policy.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 shrink-0" />
                    <div>
                      <strong>Account Credentials:</strong> Hashed passwords protected by salt-hashed bcrypt algorithms. We cannot read or view your plaintext password.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: How We Use Your Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded7ca]/70 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Section 2</span>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  2. How We Use Your Information
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  Your data is used strictly for legitimate commercial and customer service purposes:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-neutral-700">
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Order Fulfillment:</strong> Routing purchase orders to verified suppliers and dispatching parcels to your doorstep.</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Payment Authentication:</strong> Securely initiating, authenticating, and confirming transactions with Stripe.</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Real-time Tracking:</strong> Providing live delivery updates via our Track Order portal and email/SMS confirmations.</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Fraud Prevention & Support:</strong> Inspecting unboxing videos to honor legitimate return/refund claims and protect against fraudulent chargebacks.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dropshipping & Third-Party Sharing */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded7ca]/70 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Section 3</span>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  3. Dropshipping Model & Third-Party Sharing
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  Palette Hubb operates a curated supplier-fulfilled dropshipping marketplace. To deliver your items, we share strictly necessary details with trusted partners:
                </p>

                <div className="space-y-3 bg-neutral-50 rounded-2xl p-4 sm:p-5 border border-neutral-200/70 text-xs sm:text-sm text-neutral-700">
                  <p>
                    <strong>Fulfillment Suppliers & Logistics Couriers:</strong> When you place an order, your recipient name, delivery address, and contact number are passed to the designated supplier and shipping courier (e.g. Delhivery, BlueDart, DTDC, India Post) solely for dispatching and delivering your parcel.
                  </p>
                  <p>
                    <strong>Payment Service Provider (Stripe):</strong> Stripe processes and evaluates payments for fraud prevention under its own independent privacy policy (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#985842] underline underline-offset-2 hover:text-[#834633]">stripe.com/privacy</a>).
                  </p>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                    ✦ <strong>We never sell your data:</strong> We do not sell, rent, monetize, or lease your personal contact information to any third-party advertisers or data brokers.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Local Storage & Cookies */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded7ca]/70 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                <Cookie className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Section 4</span>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  4. Cookies & Browser Local Storage
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                  We use cookies and HTML5 browser local storage to provide essential storefront functionality:
                </p>

                <ul className="space-y-2 text-xs sm:text-sm text-neutral-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 shrink-0" />
                    <span><strong>Shopping Bag & Wishlist:</strong> Items added to your cart or saved to your wishlist are preserved in your local browser storage so your selection is remembered across page visits.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 shrink-0" />
                    <span><strong>Coupon Memory:</strong> Validated promotional discount codes are temporarily retained during your checkout session.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 shrink-0" />
                    <span><strong>Security & Session Tokens:</strong> Secure HTTP cookies are used to verify authenticated customer and supplier sessions.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 5: Data Retention & Security */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded7ca]/70 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700 shrink-0">
                <Database className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Section 5</span>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  5. Data Retention & Safeguards
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                  We retain order records for accounting, legal taxation, and return-warranty validation requirements. All stored data is shielded by multi-layered technical protections:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-700 pt-2">
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <strong className="block text-neutral-900 mb-1">Encrypted Transit</strong>
                    <span>100% of network traffic is encrypted via HTTPS / TLS certificates.</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <strong className="block text-neutral-900 mb-1">Stripe Shield</strong>
                    <span>PCI Level 1 certified vaulting for payment credentials.</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <strong className="block text-neutral-900 mb-1">Access Controls</strong>
                    <span>Restricted database access limited strictly to authorized operational personnel.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Customer Rights & Contact */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded7ca]/70 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-700 shrink-0">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Section 6</span>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  6. Your Privacy Rights & Contact
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  You have the right to request access to the personal data we hold about you, request corrections to your delivery details, or request account closure.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-0.5">
                      Privacy & Data Requests
                    </span>
                    <p className="text-sm font-semibold text-neutral-900">
                      privacy@palettehubb.com
                    </p>
                  </div>
                  <a
                    href="mailto:privacy@palettehubb.com"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Privacy Team</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

