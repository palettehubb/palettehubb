import React from 'react';
import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TrustBenefits from '@/components/home/TrustBenefits';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import memoryStore from '@/lib/memoryStore';
import { IProduct, ICategory } from '@/types';
import { SITE_URL, getBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'PALETTE HUB | Official Website',
  description:
    'Welcome to PALETTE HUB – Explore our products, discover our collections and shop with us. Visit our official website.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'PALETTE HUB | Official Website',
    description:
      'Welcome to PALETTE HUB – Explore our products, discover our collections and shop with us. Visit our official website.',
    url: SITE_URL,
    siteName: 'PALETTE HUB',
    images: [
      {
        url: '/images/hero/hero-card-exact.png',
        width: 1200,
        height: 630,
        alt: 'PALETTE HUB Official Website',
      },
    ],
    locale: 'en_AE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PALETTE HUB | Official Website',
    description:
      'Welcome to PALETTE HUB – Explore our products, discover our collections and shop with us. Visit our official website.',
    images: ['/images/hero/hero-card-exact.png'],
  },
};

// Pre-rendered statically with cacheComponents: eliminates loading spinner buffer for visitors

export const instant = false;

async function getHomePageData(): Promise<{
  featuredProducts: IProduct[];
  categories: ICategory[];
}> {
  let featuredProducts: IProduct[] = [];
  let categories: ICategory[] = [];

  try {
    const db = await connectToDatabase();
    if (db) {
      const [prods, cats] = await Promise.all([
        Product.find({ isFeatured: true, isAvailable: true })
          .select('name slug price originalPrice discountPercent images rating category stock isFeatured deliveryChargeInsideDubai deliveryChargeOutsideDubai tax')
          .limit(8)
          .lean(),
        Category.find({ isActive: true })
          .select('name slug description image itemCount order')
          .sort({ order: 1 })
          .lean(),
      ]);

      if (prods && prods.length > 0) {
        featuredProducts = JSON.parse(JSON.stringify(prods));
      }
      if (cats && cats.length > 0) {
        categories = JSON.parse(JSON.stringify(cats));
      }
    }
  } catch (e) {
    console.warn('DB fetch in homepage, falling back to memoryStore:', e);
  }

  // Graceful fallback from memoryStore if DB is temporarily connecting
  if (categories.length === 0 && memoryStore.categories.length > 0) {
    categories = memoryStore.categories;
  }
  if (featuredProducts.length === 0 && memoryStore.products.length > 0) {
    featuredProducts = memoryStore.products.filter((p) => p.isFeatured).slice(0, 8);
  }

  return { featuredProducts, categories };
}


export default async function HomePage() {
  const { featuredProducts, categories } = await getHomePageData();

  const homeBreadcrumb = getBreadcrumbSchema([{ name: 'Home', url: '/' }]);

  return (
    <div className="w-full">
      {/* Search Engine Breadcrumb Schema (Invisible) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeBreadcrumb) }}
      />
      {/* 1. Hero Section - Renders instantly */}
      <HeroSection />

      {/* 2. Shop By Category */}
      <CategoryGrid initialCategories={categories} />

      {/* 3. Featured Products */}
      <FeaturedProducts initialProducts={featuredProducts} />

      {/* 4. Why Choose Us */}
      <TrustBenefits />
    </div>
  );
}
