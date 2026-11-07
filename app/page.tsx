import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TrustBenefits from '@/components/home/TrustBenefits';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import memoryStore from '@/lib/memoryStore';
import { IProduct, ICategory } from '@/types';

// Pre-rendered statically with cacheComponents: eliminates loading spinner buffer for visitors

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
        Product.find({ isFeatured: true, isAvailable: true }).limit(5).lean(),
        Category.find({ isActive: true }).sort({ order: 1 }).lean(),
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
    featuredProducts = memoryStore.products.filter((p) => p.isFeatured).slice(0, 5);
  }

  return { featuredProducts, categories };
}

export default async function HomePage() {
  const { featuredProducts, categories } = await getHomePageData();

  return (
    <div className="w-full">
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
