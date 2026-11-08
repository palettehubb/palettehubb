'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Heart,
  ShoppingCart,
  Check,
  Share2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { IProduct } from '@/types';

interface ProductDetailClientProps {
  product: IProduct;
  relatedProducts: IProduct[];
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Combine product images and colorImages into a unified gallery
  const allImages = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && typeof img === 'string' && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    if (product.variants?.colorImages && Array.isArray(product.variants.colorImages)) {
      product.variants.colorImages.forEach((ci) => {
        if (ci.image && !list.includes(ci.image)) {
          list.push(ci.image);
        }
      });
    }
    return list.length > 0 ? list : ['/images/products/oversized-tshirt.png'];
  }, [product.images, product.variants?.colorImages]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const activeImage = allImages[currentIndex] || allImages[0];

  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants?.sizes?.[0] || 'Standard'
  );

  // Available colors: check colorImages first or fallback to colors array
  const colorOptions = useMemo(() => {
    const fromMapping = (product.variants?.colorImages || [])
      .map((ci) => ci.color?.trim())
      .filter(Boolean);
    const fromList = (product.variants?.colors || []).map((c) => c?.trim()).filter(Boolean);
    return Array.from(new Set([...fromMapping, ...fromList]));
  }, [product.variants?.colorImages, product.variants?.colors]);

  const [selectedColor, setSelectedColor] = useState<string>(
    colorOptions[0] || ''
  );

  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    touchStartX.current = null;
  };

  const handlePrevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const handleSelectColor = (col: string) => {
    setSelectedColor(col);
    const matched = product.variants?.colorImages?.find(
      (ci) => ci.color.toLowerCase() === col.toLowerCase()
    );
    if (matched && matched.image) {
      const idx = allImages.indexOf(matched.image);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  };

  const isWishlisted = isInWishlist(product._id);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor, activeImage);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedSize, selectedColor, activeImage);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="bg-[#f7f5ee] min-h-screen py-6 sm:py-12 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-neutral-500 mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <Link href="/shop" className="hover:text-black">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-black"
          >
            {product.category}
          </Link>
          {product.subcategory && (
            <>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`}
                className="hover:text-black"
              >
                {product.subcategory}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="text-black font-semibold truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-4 sm:p-8 lg:p-10 border border-neutral-200/80 shadow-md">
          
          {/* Left Column: Image Gallery Carousel (Well-fitted & fully responsive) */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full max-w-xl mx-auto lg:mx-0">
            
            {/* Thumbnails list (scrollable & responsive) */}
            {allImages.length > 1 && (
              <div className="flex sm:flex-col gap-2 sm:gap-3 overflow-x-auto sm:overflow-y-auto max-h-[460px] pb-2 sm:pb-0 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-neutral-100 cursor-pointer ${
                      currentIndex === idx ? 'border-[#985842] shadow-md scale-[1.02]' : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`View ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 56px, 80px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Featured Photo & Carousel Controls */}
            <div
              className="relative flex-1 aspect-square max-h-[380px] sm:max-h-[440px] md:max-h-[480px] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-100/90 border border-neutral-200/60 shadow-inner group touch-pan-y flex items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-contain p-2 sm:p-4 transition-all duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
              />

              {/* Prev / Next Carousel Arrow Controls */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-black shadow-md hover:scale-110 active:scale-95 transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-black shadow-md hover:scale-110 active:scale-95 transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                    title="Next photo"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Carousel Page Counter Badge */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold tracking-wider z-10">
                    {currentIndex + 1} / {allImages.length}
                  </div>
                </>
              )}

              {/* Wishlist button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product._id)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 sm:p-3 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md transition-transform active:scale-95 cursor-pointer z-10"
                title="Save to Wishlist"
              >
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-700'
                  }`}
                />
              </button>

              {/* Discount Tag */}
              {product.discountPercent && product.discountPercent > 0 ? (
                <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow z-10">
                  {product.discountPercent}% OFF
                </span>
              ) : null}
            </div>

          </div>

          {/* Right Column: Product Meta & Purchasing Controls (Sticky on Desktop) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6 lg:sticky lg:top-28">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#985842]">
                  <span>{product.category}</span>
                  {product.subcategory && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-800">{product.subcategory}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-700 font-semibold bg-neutral-100 px-2.5 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating || 4.9}</span>
                  <span className="text-neutral-400">({product.reviewsCount || 34})</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight mb-3">
                {product.name}
              </h1>

              {/* Pricing in USD */}
              <div className="flex items-baseline gap-2.5 sm:gap-3 mb-4 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-black">
                  ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm sm:text-base text-neutral-400 line-through">
                    ${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Tax Included
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal mb-6">
                {product.description}
              </p>

              {/* Size Variant Selector */}
              {product.variants?.sizes && product.variants.sizes.length > 0 && (
                <div className="mb-5">
                  <div className="flex justify-between items-center text-xs font-bold text-neutral-800 mb-2">
                    <span>SELECT SIZE / VARIANT</span>
                    <span className="text-neutral-500 font-normal">Standard Fit</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'bg-black text-white border-black shadow-xs'
                            : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Variant Selector with Instant Image Mapping */}
              {colorOptions.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-bold text-neutral-800 mb-2">
                    SELECT COLOR: <span className="font-semibold text-[#985842]">{selectedColor || colorOptions[0]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((col) => {
                      const matched = product.variants?.colorImages?.find(
                        (ci) => ci.color.toLowerCase() === col.toLowerCase()
                      );
                      const isSelected = selectedColor === col;
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => handleSelectColor(col)}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-black text-white border-black shadow-sm'
                              : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                          }`}
                        >
                          {matched?.image && (
                            <span className="relative w-4 h-4 rounded-full overflow-hidden border border-neutral-300 shrink-0 inline-block">
                              <Image src={matched.image} alt={col} fill className="object-cover" sizes="16px" />
                            </span>
                          )}
                          <span>{col}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Stock Indicator */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-neutral-300 rounded-xl bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-black font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-black">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-black font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs">
                  {product.stock > 0 ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock ({product.stock} units available)
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* CTAs: Add to Cart & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98] cursor-pointer ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-black border border-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold bg-[#985842] text-white hover:bg-[#834633] flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                >
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Share button */}
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-black underline underline-offset-4 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Share this piece'}</span>
              </button>
            </div>

            {/* Dropshipping & Trust Guarantees */}
            <div className="border-t border-neutral-100 pt-6 space-y-3.5">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-[#985842] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    Direct Supplier-Fulfilled Dispatch
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Shipped straight from certified manufacturing ateliers. Full end-to-end courier tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    100% Quality & Payment Protection
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Bank-grade encrypted checkout with comprehensive buyer satisfaction assurance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#985842] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    Verified Quality & Craftsmanship
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Every piece is inspected for silhouette, seams, and fabric integrity before being sealed and dispatched.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-14 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-6">
              Complete the Look
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel._id}
                  href={`/products/${rel.slug}`}
                  className="group bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 mb-2">
                    <Image
                      src={(rel.images && rel.images[0]) || '/images/products/oversized-tshirt.png'}
                      alt={rel.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 260px"
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                    {rel.name}
                  </h3>
                  <div className="text-xs font-black text-black mt-1">
                    ${rel.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
