import React from 'react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import memoryStore from '@/lib/memoryStore';
import { IProduct } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  let product: IProduct | null = null;

  try {
    const db = await connectToDatabase();
    if (db) {
      const p = await Product.findOne({ slug }).lean();
      if (p) product = JSON.parse(JSON.stringify(p));
    }
  } catch (e) {
    console.error(e);
  }

  if (!product) {
    product = memoryStore.products.find((p) => p.slug === slug || p._id === slug) || null;
  }

  if (!product) {
    return { title: 'Product Not Found — Palette Hubb' };
  }

  return {
    title: `${product.name} — Palette Hubb`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Palette Hubb`,
      description: product.description,
      images: [{ url: product.images[0] || '/images/hero/hero-card-exact.png' }],
    },
  };
}
export const instant = false;

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let product: IProduct | null = null;
  let relatedProducts: IProduct[] = [];

  try {
    const db = await connectToDatabase();
    if (db) {
      const p = await Product.findOne({ slug }).lean();
      if (p) {
        product = JSON.parse(JSON.stringify(p));
        const rel = await Product.find({
          category: product?.category,
          slug: { $ne: slug },
        })
          .limit(4)
          .lean();
        relatedProducts = JSON.parse(JSON.stringify(rel));
      }
    }
  } catch (e) {
    console.error(e);
  }

  if (!product) {
    product = memoryStore.products.find((p) => p.slug === slug || p._id === slug) || null;
    if (product) {
      relatedProducts = memoryStore.products
        .filter((p) => p.category === product?.category && p.slug !== slug)
        .slice(0, 4);
    }
  }

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
