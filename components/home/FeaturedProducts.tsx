'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { IProduct } from '@/types';

interface FeaturedProductsProps {
  initialProducts?: IProduct[];
}

export default function FeaturedProducts({ initialProducts = [] }: FeaturedProductsProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleBuyNow = (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const selectedSize = product.variants?.sizes?.[0] || 'Standard';
    addItem(product, 1, selectedSize);
    router.push('/checkout');
  };

  const handleAddToCart = (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const selectedSize = product.variants?.sizes?.[0] || 'Standard';
    addItem(product, 1, selectedSize);

    setAddedIds((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product._id]: false }));
    }, 1500);
  };

  const [products, setProducts] = useState<IProduct[]>(initialProducts);

  React.useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events/products');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'PRODUCT_CREATED' && payload.product?.isFeatured) {
            setProducts((prev) => [
              payload.product,
              ...prev.filter(
                (p) => p.slug !== payload.product.slug && p._id !== payload.product._id
              ),
            ]);
          } else if (payload.type === 'PRODUCT_UPDATED' && payload.product) {
            setProducts((prev) =>
              prev.map((p) =>
                p.slug === payload.product.slug || p._id === payload.product._id
                  ? payload.product
                  : p
              )
            );
          } else if (payload.type === 'PRODUCT_DELETED' && payload.data) {
            setProducts((prev) =>
              prev.filter(
                (p) => p.slug !== payload.data.slug && p._id !== payload.data.id
              )
            );
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  if (products.length === 0) {
    return (
      <section id="featured" className="bg-[#f7f5ee] py-12 border-b border-[#e5dfd3]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#985842] uppercase">
            Curated Drops
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mt-1 mb-4">
            Featured Products
          </h2>
          <div className="bg-white/60 rounded-3xl p-8 border border-dashed border-[#ded7ca] max-w-md mx-auto">
            <Sparkles className="w-8 h-8 text-[#985842] mx-auto mb-2" />
            <p className="text-xs text-neutral-500">
              Featured products will be displayed here as marked in the Admin Dashboard.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="bg-[#f7f5ee] py-12 sm:py-16 border-b border-[#e5dfd3]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#985842] uppercase">
              Curated Drops
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            href="/shop"
            className="mt-3 sm:mt-0 text-xs sm:text-sm font-bold text-neutral-900 hover:text-[#985842] underline underline-offset-4 transition-colors"
          >
            Explore Full Catalog &rarr;
          </Link>
        </div>

        {/* 5-Column Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {products.map((product) => {
            const hasDiscount = product.originalPrice && product.originalPrice > product.price;
            const discountPct = hasDiscount
              ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
              : 0;

            const isItemInWishlist = isInWishlist(product._id);
            const isAdded = addedIds[product._id];
            const displayImage = (product.images && product.images[0]) || '/images/products/oversized-tshirt.png';

            return (
              <div
                key={product._id}
                className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-[#ded7ca]/70 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300"
              >
                {/* Image Container */}
                <Link
                  href={`/products/${product.slug}`}
                  className="relative aspect-square w-full bg-[#fbf9f4] overflow-hidden flex items-center justify-center p-3 sm:p-4"
                >
                  <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <span className="absolute top-2.5 left-2.5 bg-black text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      -{discountPct}%
                    </span>
                  )}

                  {/* Wishlist Heart */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product._id);
                    }}
                    className={`absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                      isItemInWishlist
                        ? 'bg-red-50 text-red-500 shadow-sm'
                        : 'bg-white/90 text-neutral-600 hover:text-black shadow-2xs'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isItemInWishlist ? 'fill-current' : ''}`} />
                  </button>
                </Link>

                {/* Content */}
                <div className="flex flex-col flex-1 p-3 sm:p-4">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#985842] uppercase tracking-wider mb-1 truncate">
                    {product.category}
                  </span>

                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-1 group-hover:text-black">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-black text-sm sm:text-base text-neutral-900">
                      ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {hasDiscount && (
                      <span className="text-[11px] sm:text-xs text-neutral-400 line-through">
                        ${product.originalPrice!.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">Add</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => handleBuyNow(product, e)}
                      className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-[#985842] text-white hover:bg-[#834633] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
