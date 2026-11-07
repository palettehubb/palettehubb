import React, { Suspense } from 'react';
import ShopClient from '@/components/shop/ShopClient';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import memoryStore from '@/lib/memoryStore';
import { IProduct, ICategory } from '@/types';

export const metadata = {
  title: 'Shop All Collections — Palette Hubb Fashion & Accessories',
  description:
    'Browse our complete catalog of oversized streetwear tees, formal blazers, caps, luxury watches, and cuban chains.',
};

// Pre-rendered with cacheComponents for instant page load

async function getShopData(): Promise<{
  products: IProduct[];
  categories: string[];
  categoriesData: ICategory[];
}> {
  let categoriesData: ICategory[] = [];
  let products: IProduct[] = [];

  try {
    const db = await connectToDatabase();
    if (db) {
      const [dbCats, dbProds] = await Promise.all([
        Category.find({ isActive: true }).sort({ order: 1 }).lean(),
        Product.find({ isAvailable: true }).sort({ createdAt: -1 }).lean(),
      ]);

      if (dbCats && dbCats.length > 0) {
        categoriesData = JSON.parse(JSON.stringify(dbCats));
      }
      if (dbProds && dbProds.length > 0) {
        products = JSON.parse(JSON.stringify(dbProds));
      }
    }
  } catch (e) {
    console.warn('Error fetching shop data from DB, using fallback:', e);
  }

  if (categoriesData.length === 0 && memoryStore.categories.length > 0) {
    categoriesData = memoryStore.categories;
  }
  if (products.length === 0 && memoryStore.products.length > 0) {
    products = memoryStore.products;
  }

  const categories = Array.from(new Set(products.map((p) => p.category)));
  return { products, categories, categoriesData };
}

export const instant = false;

export default async function ShopPage() {
  const { products, categories, categoriesData } = await getShopData();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f5ee]" />}>
      <ShopClient
        initialProducts={products}
        categories={categories}
        categoriesData={categoriesData}
      />
    </Suspense>
  );
}
