'use client';

import React from 'react';
import Image from 'next/image';
import { Diamond, ShieldCheck, Tag, Headphones } from 'lucide-react';

export default function TrustBenefits() {
  const benefits = [
    {
      icon: Diamond,
      title: 'Worldwide Dropshipping',
      description: 'Get your favorite styles anywhere in the world.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payments',
      description: 'Shop with confidence and peace of mind.',
    },
    {
      icon: Tag,
      title: 'Trendy & Premium',
      description: 'Latest trends, best quality products.',
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      description: "We're here to help, anytime.",
    },
  ];

  return (
    <section id="why-choose-us" className="bg-[#f7f5ee] py-10 sm:py-16 select-none">
      {/* 1. Laptop & Desktop View (md and up): Exact Panoramic Banner Graphic */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full rounded-2xl sm:rounded-3xl lg:rounded-[2rem] overflow-hidden bg-[#faf6f3] shadow-md border border-[#ede5db]/80 group">
          <Image
            src="/images/why-choose-us/why-choose-us-banner-2x.jpg"
            alt="Why Choose PALETTE HUB — Premier Fashion Dropshipping Dubai UAE"
            width={2048}
            height={818}
            className="w-full h-auto object-cover transform scale-[1.002] transition-transform duration-700 group-hover:scale-[1.008]"
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>
      </div>

      {/* 2. Mobile View (< md): Clean layout with header and the four benefit cards (no image) */}
      <div className="block md:hidden max-w-lg mx-auto px-4 sm:px-6">
        <div className="bg-[#faf6f3] rounded-3xl p-5 sm:p-7 shadow-md border border-[#ede5db]/80">
          
          {/* Header with Pill Badge, Serif Headline, Subtitle, and Divider */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2.5 mb-3">
              <span className="w-5 h-[1px] bg-[#d9c8b7]" />
              <span className="px-3.5 py-1 rounded-full bg-[#f4ebe1] text-[#8c674b] text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase">
                Why Choose Us
              </span>
              <span className="w-5 h-[1px] bg-[#d9c8b7]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-neutral-900 leading-[1.18] mb-2">
              More Than Just{' '}
              <span className="italic text-[#a47856] font-serif">Fashion</span>
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed max-w-xs mx-auto mb-3">
              Discover a better shopping experience with quality, style and care.
            </p>

            <div className="flex items-center justify-center gap-1.5">
              <span className="w-6 h-[1.5px] bg-[#c5ab94]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5ab94]" />
              <span className="w-3 h-[1.5px] bg-[#c5ab94]" />
            </div>
          </div>

          {/* 4 Benefit Cards in 2x2 grid without image */}
          <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center shadow-xs border border-[#ede5db]/70 transition-transform active:scale-[0.98]"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#f3e7dc] flex items-center justify-center mb-2.5 text-[#6b4f3b] shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-500 font-light leading-relaxed mb-3">
                    {item.description}
                  </p>
                  <div className="w-6 h-0.5 bg-[#cbb39e] rounded-full mt-auto" />
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
