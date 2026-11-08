import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import memoryStore from '@/lib/memoryStore';
import { IProduct } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// React 19 request deduplication cache: generateMetadata and ProductDetailPage share a single DB roundtrip
const getProductData = cache(async (slug: string) => {
  let product: IProduct | null = null;
  let relatedProducts: IProduct[] = [];

  try {
    const db = await connectToDatabase();
    if (db) {
      const query = mongoose.isValidObjectId(slug)
        ? { $or: [{ slug }, { _id: slug }] }
        : { slug };

      const p = await Product.findOne(query).lean();
      if (p) {
        product = JSON.parse(JSON.stringify(p));
        const rel = await Product.find({
          category: product?.category,
          slug: { $ne: product?.slug },
          isAvailable: true,
        })
          .select('name slug price originalPrice images rating reviewsCount isFeatured')
          .limit(4)
          .lean();
        relatedProducts = JSON.parse(JSON.stringify(rel));
      }
    }
  } catch (e) {
    console.error('Error fetching cached product data:', e);
  }

  if (!product) {
    product = memoryStore.products.find((p) => p.slug === slug || p._id === slug) || null;
    if (product) {
      relatedProducts = memoryStore.products
        .filter((p) => p.category === product?.category && p.slug !== slug)
        .slice(0, 4);
    }
  }

  return { product, relatedProducts };
});

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { product } = await getProductData(slug);

  if (!product) {
    return { title: 'Product Not Found — Palette Hubb' };
  }

  return {
    title: `${product.name} — Palette Hubb`,
    description: product.description || `Buy ${product.name} at Palette Hubb. Fast dropship delivery.`,
    openGraph: {
      title: `${product.name} | Palette Hubb`,
      description: product.description || `Buy ${product.name} at Palette Hubb. Fast dropship delivery.`,
      images: [{ url: product.images[0] || '/images/hero/hero-card-exact.png' }],
    },
  };
}

export const instant = false;

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { product, relatedProducts } = await getProductData(slug);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
