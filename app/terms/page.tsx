import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Clock,
  Video,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  FileText,
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  Mail,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions & Return Policy — Palette Hubb',
  description:
    'Review the official Terms of Service, 3-Day Return Policy, Mandatory Unboxing Video Proof requirements, and dropshipping fulfillment guidelines for Palette Hubb.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16 text-neutral-900 select-none">
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
            <FileText className="w-3.5 h-3.5 text-neutral-700" />
            <span>Store Policy & Terms of Purchase</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-900 mb-3">
            Terms & Conditions
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 font-medium">
            Clear, transparent guidelines on orders, global dropshipping, the 3-day return policy, and our mandatory unboxing video requirement.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mt-5 pt-4 border-t border-neutral-100 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-neutral-400" />
              Effective Date: <strong>November 2026</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              3-Day Return Window
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-indigo-700">
              <CreditCard className="w-4 h-4" />
              PayPal Live Payment Protection
            </span>
          </div>
        </div>

        {/* Crucial Notice: Mandatory Unboxing Video Proof */}
        <div className="bg-amber-50/70 rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm mb-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 block mb-1">
                Mandatory Verification Policy
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mb-2">
                Mandatory Unboxing Video for Damaged or Missing Items
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed mb-4">
                To guarantee fair resolution and prevent fraudulent claims, <strong>a single, continuous, unedited unboxing video is mandatory</strong> for any refund, return, or replacement request involving damaged, defective, or missing merchandise.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-800">
                <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 flex items-start gap-2.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Start Before Opening:</strong> The video recording must begin showing the sealed outer package and courier shipping label clearly before tape is cut.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 flex items-start gap-2.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>No Pauses or Cuts:</strong> The recording must be continuous from unboxing to item inspection without cuts, edits, or filter alterations.</span>
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
              <Clock className="w-4 h-4 text-neutral-700" />
              <span>Section 1</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">1. 3-Day Return & Replacement Policy</h3>
            <p>
              You are eligible to request a return or replacement within <strong className="text-neutral-900 font-bold">3 calendar days</strong> from the official courier delivery confirmation timestamp.
            </p>
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Return or damage claims submitted after the 3-day window has expired will not be accepted.</span>
            </div>
          </div>

          {/* Section 2 */}
          <div className="border border-neutral-200 rounded-3xl p-6 sm:p-8 bg-neutral-50/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <Truck className="w-4 h-4 text-neutral-700" />
              <span>Section 2</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">2. Dropshipping Dispatch & Shipping Timelines</h3>
            <p>
              Palette Hubb partners directly with verified garment and printing facilities. Once your order payment is verified by PayPal:
            </p>
            <ul className="space-y-2 list-disc list-inside pl-2 text-xs sm:text-sm text-neutral-600">
              <li><strong>Fulfillment Lead Time:</strong> Our manufacturing partners prepare, inspect, and package orders within <strong>2 to 4 business days</strong>.</li>
              <li><strong>Courier Dispatch:</strong> Upon dispatch, an automated AWB tracking code is assigned and visible in our Track Order portal.</li>
              <li><strong>Delivery Transit:</strong> Delivery times vary by geographic destination (typically 3 to 7 business days depending on domestic or international routes).</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="border border-neutral-200 rounded-3xl p-6 sm:p-8 bg-neutral-50/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-neutral-700" />
              <span>Section 3</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">3. Payment & Pricing Integrity</h3>
            <p>
              All customer payments are completed in full at checkout via PayPal Live Express or major credit/debit cards:
            </p>
            <ul className="space-y-2 list-disc list-inside pl-2 text-xs sm:text-sm text-neutral-600">
              <li>Orders are only confirmed and routed to suppliers after PayPal issues a verified <code>COMPLETED</code> capture status.</li>
              <li>Prices and discounts (including promotional coupon codes) are cryptographically validated on the server. Manipulation of client-side payloads will be automatically rejected.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="border border-neutral-200 rounded-3xl p-6 sm:p-8 bg-neutral-50/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <RefreshCw className="w-4 h-4 text-neutral-700" />
              <span>Section 4</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">4. Cancellations & Modifications</h3>
            <p>
              Due to our automated dropship routing, orders begin processing rapidly:
            </p>
            <ul className="space-y-2 list-disc list-inside pl-2 text-xs sm:text-sm text-neutral-600">
              <li><strong>Before Printing / Dispatch:</strong> You may request a cancellation by emailing our support desk before the order status transitions to &quot;In Transit&quot;.</li>
              <li><strong>After Dispatch:</strong> Once a shipping label is created and handed to the courier, the package cannot be cancelled in transit and must follow the standard 3-Day Return guidelines.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="border border-neutral-200 rounded-3xl p-6 sm:p-8 bg-neutral-50/30 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <Mail className="w-4 h-4 text-neutral-700" />
              <span>Section 5</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">5. Customer Support & Claims Submission</h3>
            <p>
              To submit an unboxing video, report a shipment delay, or request return assistance, contact our dedicated support team with your <strong>Order Number (e.g. #PH-10294)</strong>:
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Palette Hubb Support Desk
                </span>
                <span className="text-sm font-bold text-neutral-900">palettehubb@gmail.com</span>
              </div>
              <a
                href="mailto:palettehubb@gmail.com?subject=Order%20Support%20Claim"
                className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Submit Support Ticket</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
