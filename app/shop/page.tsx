import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ShopClient from '@/components/shop/ShopClient';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import memoryStore from '@/lib/memoryStore';
import { IProduct, ICategory } from '@/types';
import { SITE_URL, getBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Shop Fashion Collections, Garments & Accessories | PALETTE HUB Dubai',
  description:
    'Explore trending women’s clothing, men’s garments, tailored blazers, oversized tees, and luxury fashion accessories at PALETTE HUB. Fast dropshipping across Dubai, the UAE, and worldwide.',
  alternates: {
    canonical: `${SITE_URL}/shop`,
  },
  openGraph: {
    title: 'Shop Fashion Collections & Garments | PALETTE HUB Dubai',
    description:
      'Curated women’s fashion, men’s garments, and trending fashion accessories with dropshipping across Dubai, UAE & worldwide.',
    url: `${SITE_URL}/shop`,
    siteName: 'PALETTE HUB',
    images: [
      {
        url: '/images/hero/hero-card-exact.png',
        width: 1200,
        height: 630,
        alt: 'PALETTE HUB Fashion Collections',
      },
    ],
    locale: 'en_AE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Fashion Collections & Garments | PALETTE HUB Dubai',
    description:
      'Curated women’s fashion, men’s garments, and trending fashion accessories with dropshipping across Dubai, UAE & worldwide.',
    images: ['/images/hero/hero-card-exact.png'],
  },
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

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Shop All Collections', url: '/shop' },
  ]);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Fashion Collections & Garments | PALETTE HUB Dubai',
    url: `${SITE_URL}/shop`,
    description:
      'Browse complete catalog of curated fashion, women’s and men’s garments, and lifestyle accessories available for dropshipping in Dubai, the UAE, and worldwide.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.slice(0, 24).map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}/products/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-[#f7f5ee]" />}>
        <ShopClient
          initialProducts={products}
          categories={categories}
          categoriesData={categoriesData}
        />
      </Suspense>
    </>
  );
}
