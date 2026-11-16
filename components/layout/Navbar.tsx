'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ICategory } from '@/types';
import Logo from '@/components/ui/Logo';

const DEFAULT_NAV_CATEGORIES: ICategory[] = [
  {
    _id: 'cat-1',
    name: 'Limited Drops',
    slug: 'chain',
    order: 0,
    isActive: true,
    image: '/images/hero/hero-card-exact.png',
    subcategories: ['Seasonal capsules', 'Numbered Editions', "Designer's Cut", 'Flash Releases', 'Artist Collaboration'],
  },
  {
    _id: 'cat-2',
    name: 'Outerwear',
    slug: 'outerwear',
    order: 1,
    isActive: true,
    image: '/images/hero/hero-card-exact.png',
    subcategories: ['Jackets & Windbreakers', 'Oversized Hoodies', 'Denim Jackets', 'Puffer Jackets &vests'],
  },
  {
    _id: 'cat-3',
    name: "Men's Tops & Tees",
    slug: 'men-s-tops-tees',
    order: 2,
    isActive: true,
    image: '/images/hero/hero-card-exact.png',
    subcategories: ['Graphic & Print Tees', 'Oversized Heavyweight Tees', 'Acid Wash & Vintage Tops', 'Long Sleeve Shirts & Polos'],
  },
  {
    _id: 'cat-4',
    name: 'Men’s Bottoms',
    slug: 'men-s-bottoms',
    order: 3,
    isActive: true,
    image: '/images/hero/hero-card-exact.png',
    subcategories: ['Cargo & Utility Pants', 'Wide-Leg & Straight Denim', 'Fleece Sweatpants & Joggers', 'Utility & Casual Shorts'],
  },
  {
    _id: 'cat-5',
    name: 'Ribbed Knit Lounge sets',
    slug: 'men-s-accessories-jewelry',
    order: 4,
    isActive: true,
    image: '/images/hero/hero-card-exact.png',
    subcategories: ['Kint & Lounge Sete', 'streetwear& Sweat Sete', 'Linen & Resort set'],
  },
  {
    _id: 'cat-6',
    name: 'Women’s Tops & Crops',
    slug: 'women-s-tops-crops',
    order: 5,
    isActive: true,
    image: '/images/hero/hero-card-exact.png',
    subcategories: ['Cropped Graphic Tees', 'Boxy & Oversized Tees', 'Fitted Tops & Corset Tops', 'Ribbed Tanks & Long Sleeves'],
  },
  {
    _id: 'cat-7',
    name: 'Women’s Outerwear',
    slug: 'women-s-outerwear',
    order: 6,
    isActive: true,
    image: '/images/hero/hero-card-exact.png',
    subcategories: ['Cropped Fleece & Sherpa Jackets', 'Oversized Hoodies & Zip-Ups', 'Cropped Denim & Puffer Jackets', 'Trench & Lightweight Layers'],
  },
  {
    _id: 'cat-8',
    name: "Women's bottoms",
    slug: 'women-s-bottoms',
    order: 7,
    isActive: true,
    image: '/images/hero/hero-card-exact.png',
    subcategories: ['Trousers', 'Skirts', 'Shorts', 'Jeans'],
  },
  {
    _id: 'cat-9',
    name: 'Footwear',
    slug: 'footwear',
    order: 8,
    isActive: true,
    image: '/images/hero/hero-card-exact.png',
    subcategories: ["Men's Footwear", "Women's Footwear"],
  },
  {
    _id: 'cat-10',
    name: 'Accessories',
    slug: 'accessories',
    order: 9,
    isActive: true,
    image: '/images/hero/hero-card-exact.png',
    subcategories: ["Men's Accessories", "Women's Accessories"],
  },
  {
    _id: 'cat-11',
    name: 'Skincare & Beauty',
    slug: 'skincare-beauty',
    order: 10,
    isActive: true,
    image: '/images/hero/hero-card-exact.png',
    subcategories: ['All Skincare', "Women's Beauty", "Men's Grooming", 'Hair care'],
  },
  {
    _id: 'cat-12',
    name: 'Fragrance',
    slug: 'fragrance',
    order: 11,
    isActive: true,
    image: '/images/hero/hero-card-exact.png',
    subcategories: ['Signature Scents', 'Warm & Bold', 'Pocket & Travel', 'For Her', 'For Him'],
  },
];

export default function Navbar() {
  const router = useRouter();
  const { totalItemsCount, setIsOpen } = useCart();
  const { wishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<ICategory[]>(DEFAULT_NAV_CATEGORIES);

  useEffect(() => {
    // Keep categories in sync dynamically from API with 0-delay initial paint
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f7f5ee] border-b border-[#e5dfd3]/60 transition-colors backdrop-blur-md bg-[#f7f5ee]/95">
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 xl:gap-6">
          {/* Left: Official Brand Logo & Main Navigation Links */}
          <div className="flex items-center gap-5 xl:gap-7 shrink-0">
            <Logo variant="light" size="md" />

            {/* Desktop Navigation Links with Dropdowns */}
            <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 text-neutral-800 text-[13px] xl:text-[14px] font-medium">
              <Link
                href="/"
                prefetch={true}
                className="hover:text-black transition-colors hover:underline underline-offset-8 whitespace-nowrap"
              >
                Home
              </Link>
              <Link
                href="/shop"
                prefetch={true}
                className="hover:text-black transition-colors hover:underline underline-offset-8 whitespace-nowrap"
              >
                Shop
              </Link>

              {/* Top 4 Dynamic Categories */}
              {categories.slice(0, 4).map((cat) => {
                const catName = cat.name;
                const catSlug = cat.slug || cat.name;
                const subcategories = cat.subcategories || [];

                return (
                  <div
                    key={cat._id || catSlug}
                    className="relative group py-2"
                    onMouseEnter={() => setActiveDropdown(catName)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={`/shop?category=${encodeURIComponent(catSlug)}`}
                      prefetch={true}
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-1 hover:text-black transition-colors whitespace-nowrap"
                    >
                      <span>{catName}</span>
                      {subcategories.length > 0 && (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 group-hover:rotate-180" />
                      )}
                    </Link>

                    {/* Dropdown Menu showing subcategories on hover */}
                    {activeDropdown === catName && subcategories.length > 0 && (
                      <div className="absolute top-full left-0 w-60 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-100 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Subcategories
                        </div>

                        <Link
                          href={`/shop?category=${encodeURIComponent(catSlug)}`}
                          prefetch={true}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center justify-between px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
                        >
                          <span>All {catName}</span>
                          <span className="text-[10px] text-neutral-400 font-semibold">View All →</span>
                        </Link>

                        <div className="h-px bg-neutral-100 my-1" />

                        {subcategories.map((sub) => (
                          <Link
                            key={sub}
                            href={`/shop?category=${encodeURIComponent(catSlug)}&subcategory=${encodeURIComponent(sub)}`}
                            prefetch={true}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-xl transition-colors"
                          >
                            <span>{sub}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Show More Dropdown for remaining categories (including Ribbed Knit Lounge sets) */}
              {categories.length > 4 && (
                <div
                  className="relative group py-2"
                  onMouseEnter={() => setActiveDropdown('__more__')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown(activeDropdown === '__more__' ? null : '__more__')
                    }
                    className="flex items-center gap-1 text-neutral-800 hover:text-black font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>More</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
                        activeDropdown === '__more__' ? 'rotate-180' : ''
                      } group-hover:rotate-180`}
                    />
                  </button>

                  {activeDropdown === '__more__' && (
                    <div className="absolute top-full left-0 w-64 max-h-[420px] overflow-y-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-100 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        More Categories
                      </div>

                      {categories.slice(4).map((cat) => {
                        const catName = cat.name;
                        const catSlug = cat.slug || cat.name;
                        const subcategories = cat.subcategories || [];

                        return (
                          <div key={cat._id || catSlug} className="py-1">
                            <Link
                              href={`/shop?category=${encodeURIComponent(catSlug)}`}
                              prefetch={true}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center justify-between px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"
                            >
                              <span>{catName}</span>
                              {subcategories.length > 0 && (
                                <span className="text-[10px] text-neutral-400 font-medium">
                                  ({subcategories.length})
                                </span>
                              )}
                            </Link>

                            {subcategories.length > 0 && (
                              <div className="pl-4 pr-1 py-1 space-y-0.5">
                                {subcategories.map((sub) => (
                                  <Link
                                    key={sub}
                                    href={`/shop?category=${encodeURIComponent(catSlug)}&subcategory=${encodeURIComponent(sub)}`}
                                    prefetch={true}
                                    onClick={() => setActiveDropdown(null)}
                                    className="block px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:text-black hover:bg-neutral-100/80 rounded-lg transition-colors"
                                  >
                                    {sub}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <Link
                href="/track-order"
                prefetch={true}
                className="hover:text-black transition-colors hover:underline underline-offset-8 whitespace-nowrap"
              >
                Track Order
              </Link>
            </nav>
          </div>

          {/* Right: Search Pill, Wishlist, Shopping Bag Icon & Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Desktop Search Input Pill - Clean, compact size */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center relative w-36 lg:w-44 xl:w-52"
            >
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                aria-label="Search fashion collections"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#ece8de]/70 hover:bg-[#ece8de] focus:bg-white text-xs text-neutral-900 placeholder:text-neutral-500 rounded-full pl-8 pr-3 py-1.5 border border-transparent focus:border-neutral-300 transition-all outline-none"
              />
            </form>

            {/* Wishlist Icon */}
            <Link
              href="/shop?wishlist=true"
              prefetch={true}
              aria-label="Saved items wishlist"
              className="relative p-2 rounded-full hover:bg-[#ece8de] text-neutral-800 transition-colors"
              title="Saved items"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#985842] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag Button (triggering slide-over) */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open Shopping Bag"
              className="relative p-2 rounded-full hover:bg-[#ece8de] text-neutral-800 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-[#ece8de] text-neutral-800 lg:hidden transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#f7f5ee] border-b border-[#e5dfd3] px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-200">
          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              aria-label="Search collections"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-xs text-neutral-900 rounded-full pl-9 pr-4 py-2.5 border border-neutral-200 outline-none"
            />
          </form>

          <nav className="flex flex-col gap-1 text-sm font-semibold text-neutral-800">
            <Link
              href="/"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-[#ece8de] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/shop"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-[#ece8de] transition-colors"
            >
              Shop
            </Link>

            {/* Mobile Categories Accordion */}
            {categories.map((cat) => {
              const catName = cat.name;
              const catSlug = cat.slug || cat.name;
              const subcategories = cat.subcategories || [];
              const isCatOpen = mobileCategoryOpen === catName;

              return (
                <div key={cat._id || catSlug} className="border-t border-neutral-200/60 pt-1">
                  {subcategories.length > 0 ? (
                    <div>
                      <button
                        onClick={() =>
                          setMobileCategoryOpen(isCatOpen ? null : catName)
                        }
                        className="w-full py-2 px-3 rounded-xl hover:bg-[#ece8de] flex items-center justify-between text-left transition-colors"
                      >
                        <span>{catName}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isCatOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isCatOpen && (
                        <div className="pl-5 pr-2 py-1 space-y-1 bg-[#ece8de]/40 rounded-xl my-1 animate-in slide-in-from-top-1">
                          <Link
                            href={`/shop?category=${encodeURIComponent(catSlug)}`}
                            prefetch={true}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1.5 text-xs font-bold text-neutral-900"
                          >
                            All {catName} →
                          </Link>
                          {subcategories.map((sub) => (
                            <Link
                              key={sub}
                              href={`/shop?category=${encodeURIComponent(catSlug)}&subcategory=${encodeURIComponent(sub)}`}
                              prefetch={true}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block py-1.5 text-xs text-neutral-600 hover:text-black font-normal"
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={`/shop?category=${encodeURIComponent(catSlug)}`}
                      prefetch={true}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 px-3 rounded-xl hover:bg-[#ece8de] transition-colors"
                    >
                      {catName}
                    </Link>
                  )}
                </div>
              );
            })}

            <Link
              href="/about"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-[#ece8de] transition-colors border-t border-neutral-200/60"
            >
              About Us
            </Link>

            <Link
              href="/contact"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-[#ece8de] transition-colors"
            >
              Contact Us
            </Link>

            <Link
              href="/track-order"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-[#ece8de] transition-colors"
            >
              Track Order
            </Link>

            <Link
              href="/shop?wishlist=true"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-[#ece8de] transition-colors"
            >
              Wishlist ({wishlist.length})
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
