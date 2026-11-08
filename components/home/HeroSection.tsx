'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    headline: 'Unveil Your Beauty with Every Wear',
    subtitle: 'Curated fashion, tailored silhouettes & timeless lifestyle accessories.',
    image: '/images/hero/hero-slide-1.jpg',
    ctaText: 'See Collections',
    ctaLink: '/shop',
  },
  {
    id: 2,
    headline: 'Your Style, Our Priority',
    subtitle: 'Quiet luxury tailoring, structured blazers & fine minimalist chronographs.',
    image: '/images/hero/hero-slide-2.jpg',
    ctaText: 'Explore New Drops',
    ctaLink: '/shop?category=Costume',
  },
  {
    id: 3,
    headline: 'Upgrade Your Daily Aesthetic',
    subtitle: 'Bespoke floral dresses, handcrafted leather bags & timeless silhouettes.',
    image: '/images/hero/hero-slide-3.jpg',
    ctaText: 'Shop New Arrivals',
    ctaLink: '/shop',
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <section className="bg-[#f7f5ee] pt-4 pb-10 sm:py-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Floating Rounded Hero Card */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl lg:rounded-[2.25rem] overflow-hidden bg-[#985842] shadow-2xl min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] flex items-center group">
          
          {/* Background images crossfade */}
          {SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                currentSlide === idx ? 'opacity-100 z-0' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.headline}
                fill
                priority
                loading="eager"
                className="object-cover object-[38%_0%] sm:object-[45%_0%] md:object-[center_0%] lg:object-[center_0%] transform scale-[1.01]"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
              {/* Soft dark-terracotta gradient on left to guarantee headline readability across all displays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#884732]/95 via-[#884732]/75 sm:via-[#884732]/60 to-transparent w-full md:w-3/5" />
            </div>
          ))}

          {/* Foreground Editorial Content */}
          <div className="relative z-10 w-full px-5 sm:px-10 md:px-14 lg:px-16 py-8 sm:py-12 flex flex-col justify-between h-full">
            <div className="max-w-lg lg:max-w-xl">
              {/* Category / Subtitle Badge */}
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                <span className="text-white/90 text-xs sm:text-sm font-medium tracking-widest uppercase">
                  PALETTE HUB Atelier 2026
                </span>
              </div>

              {/* Bold Editorial Headline */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.12] mb-5">
                {SLIDES[currentSlide].headline}
              </h1>

              {/* Supporting Editorial Text */}
              <p className="text-sm sm:text-base text-white/90 font-light leading-relaxed max-w-md mb-8">
                {SLIDES[currentSlide].subtitle}
              </p>

              {/* White Pill CTA Button matching reference */}
              <div className="flex items-center gap-4 flex-wrap">
                <Link
                  href={SLIDES[currentSlide].ctaLink}
                  className="inline-flex items-center gap-2.5 bg-white text-neutral-900 hover:bg-neutral-100 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]"
                >
                  <span>{SLIDES[currentSlide].ctaText}</span>
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                <Link
                  href="/#featured-products"
                  className="inline-flex items-center text-sm font-medium text-white/90 hover:text-white underline underline-offset-4 px-2 py-1"
                >
                  View Top Picks
                </Link>
              </div>
            </div>

            {/* Bottom Indicator Dots & Prev/Next Arrows */}
            <div className="flex items-center gap-3 pt-10 sm:pt-14">
              <div className="flex items-center gap-2">
                {SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${
                      currentSlide === idx
                        ? 'w-7 bg-white shadow-sm'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/35 text-white/90 hover:text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/35 text-white/90 hover:text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
