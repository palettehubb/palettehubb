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

export default function Navbar() {
  const router = useRouter();
  const { totalItemsCount, setIsOpen } = useCart();
  const { wishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Official Brand Logo */}
          <div className="flex-shrink-0">
            <Logo variant="light" size="md" />
          </div>

          {/* Center-Left: Desktop Navigation with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-neutral-800 text-[14px] font-medium">
            <Link
              href="/"
              prefetch={true}
              className="hover:text-black transition-colors hover:underline underline-offset-8"
            >
              Home
            </Link>
            <Link
              href="/shop"
              prefetch={true}
              className="hover:text-black transition-colors hover:underline underline-offset-8"
            >
              Shop
            </Link>

            {/* Dynamic Categories & Subcategories added from Admin */}
            {categories.map((cat) => {
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
                    className="flex items-center gap-1 hover:text-black transition-colors"
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

            <Link
              href="/track-order"
              prefetch={true}
              className="hover:text-black transition-colors hover:underline underline-offset-8"
            >
              Track Order
            </Link>
          </nav>

          {/* Center-Right: Search Input Pill */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative max-w-xs xl:max-w-sm w-full"
          >
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              aria-label="Search fashion collections"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#ece8de]/70 hover:bg-[#ece8de] focus:bg-white text-xs text-neutral-900 placeholder:text-neutral-500 rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-neutral-300 transition-all outline-none"
            />
          </form>

          {/* Right: Wishlist, Shopping Bag Icon & Mobile Toggle */}
          <div className="flex items-center gap-3">
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
        <div className="lg:hidden bg-[#f7f5ee] border-b border-[#e5dfd3] px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-200">
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
