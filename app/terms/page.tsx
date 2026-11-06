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
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions & Return Policy | Palette Hubb',
  description:
    'Read Palette Hubb Terms and Conditions, 3-Day Return Window, and Mandatory Unboxing Video Proof guidelines.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f7f5ee] py-10 sm:py-16 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ded7ca]/70 shadow-sm mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4ebe1] text-[#8c674b] text-[11px] font-semibold tracking-widest uppercase mb-4">
            <FileText className="w-3.5 h-3.5" />
            <span>Store Policy & Legal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-3">
            Terms & Conditions
          </h1>
          <h2 className="text-lg sm:text-xl font-medium text-[#985842] mb-4">
            Return & Refund Policy
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-500 pt-3 border-t border-neutral-100">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-neutral-400" />
              Effective Date: <strong className="text-neutral-700">January 1, 2026</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Buyer Protection
            </span>
          </div>

          <p className="mt-5 text-sm sm:text-base text-neutral-600 leading-relaxed">
            Thank you for shopping with us! We strive to give you the best shopping experience. Please read our Return and Refund Policy carefully to understand your rights and our guidelines.
          </p>
        </div>

        {/* Policy Content Sections */}
        <div className="space-y-6">

          {/* 1. 3-Day Return Window */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded7ca]/70 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#f4ebe1] flex items-center justify-center text-[#985842] shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#985842] uppercase tracking-wider">Section 1</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  1. 3-Day Return Window
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-3">
                  You are eligible to request a return or refund within <strong className="text-neutral-900 font-semibold">3 days</strong> from the exact date of delivery.
                </p>
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Requests made after the 3-day window will unfortunately <strong>not be accepted or processed</strong> under any circumstances.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Mandatory Unboxing Video Proof */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#985842]/30 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#985842] text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-bl-xl">
              Mandatory Requirement
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <Video className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 pr-14 sm:pr-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Section 2</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  2. Mandatory Unboxing Video Proof (For Damages/Defects)
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  To be eligible for a return due to physical damage, missing items, or defects, a <strong className="text-neutral-900 font-semibold">continuous, unedited unboxing video is mandatory</strong>.
                </p>

                <div className="space-y-3 bg-neutral-50 rounded-2xl p-4 sm:p-5 border border-neutral-200/70">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                    <span>The video must start from the moment the sealed outer courier package/box is <strong>unopened</strong>.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                    <span>It must show the <strong>complete unboxing process clearly</strong> without any pause, cut, or video editing.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-red-700 font-medium pt-2 border-t border-neutral-200">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✕</span>
                    <span>Claims without a valid unboxing video or with only still photos will <strong>not be accepted</strong> for transit damages.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Conditions for Return */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded7ca]/70 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Section 3</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  3. Conditions for Return
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  To be accepted, the returned item must meet the following criteria:
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 shrink-0" />
                    <span>The product must be <strong>unused, unworn</strong> (in case of apparel), and in its original pristine condition.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-2 shrink-0" />
                    <span>It must include <strong>all original packaging, tags, labels, manuals</strong>, and freebies/accessories (if any).</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4. Non-Returnable Items */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded7ca]/70 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Section 4</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  4. Non-Returnable Items
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  The following items cannot be returned unless they arrive damaged/defective (verified strictly by your unboxing video):
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>Clearance or final sale items.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>Customized, engraved, or personalized products.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>Items that have been used, washed, or damaged due to misuse or mishandling by the customer.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 5. Refund Process */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded7ca]/70 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Section 5</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  5. Refund Process
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-3">
                  Once your return request is received and inspected (along with your continuous unboxing video/photos), we will notify you of the approval or rejection of your refund.
                </p>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs sm:text-sm text-emerald-900 leading-relaxed">
                  If approved, your refund will be processed within <strong className="font-bold">5-7 business days</strong>, and the amount will be credited back to your original payment method or issued as store credit.
                </div>
              </div>
            </div>
          </div>

          {/* Need Help / Contact Support Card */}
          <div className="bg-[#1a1512] text-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Customer Support</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-1">
                  Have questions about a return?
                </h4>
                <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-md">
                  Our support team is here to assist you with order inquiries, return requests, and unboxing video verification.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href="/track-order"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 font-semibold text-xs sm:text-sm transition-colors text-center"
                >
                  Track Order
                </Link>
                <a
                  href="mailto:support@palettehubb.com"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-colors border border-white/20 text-center"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

