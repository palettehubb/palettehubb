import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({
  variant = 'auto',
  className = '',
  showText = true,
  size = 'md',
}: LogoProps) {
  const isDarkBg = variant === 'dark';
  const textColor = isDarkBg
    ? 'text-white'
    : variant === 'light'
    ? 'text-neutral-900'
    : 'text-neutral-900 dark:text-white';

  const badgeSize =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const imgPixelSize = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  const fontSize =
    size === 'sm'
      ? 'text-xs'
      : size === 'lg'
      ? 'text-lg tracking-wider'
      : 'text-sm tracking-wide';

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight select-none group ${className}`}
    >
      {/* Official Palette Hubb Logo */}
      <div
        className={`${badgeSize} rounded-xl overflow-hidden shadow-sm flex items-center justify-center border border-neutral-200/40 transition-transform duration-200 group-hover:scale-105 shrink-0 bg-white`}
      >
        <Image
          src="/images/phlogo.jpeg"
          alt="PALETTE HUB — Fashion Dropshipping Dubai UAE"
          width={imgPixelSize}
          height={imgPixelSize}
          priority
          className="w-full h-full object-cover"
        />
      </div>

      {showText && (
        <div className={`flex flex-col leading-none ${textColor}`}>
          <span className={`font-black uppercase tracking-widest ${fontSize}`}>
            PALETTE
          </span>
          <span className={`font-black uppercase tracking-widest ${fontSize}`}>
            HUBB
          </span>
        </div>
      )}
    </Link>
  );
}
