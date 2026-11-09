import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import mongoose from 'mongoose';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import memoryStore from '@/lib/memoryStore';
import { IProduct } from '@/types';
import { SITE_URL, SITE_METADATA, getProductSchema, getBreadcrumbSchema } from '@/lib/seo';

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
          .select('name slug price originalPrice images rating reviewsCount isFeatured deliveryChargeInsideDubai deliveryChargeOutsideDubai tax')
          .limit(4)
          .lean();
        relatedProducts = JSON.parse(JSON.stringify(rel));
      }
    }
  } catch (e) {
    console.error('Error fetching product data:', e);
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProductData(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.name} — Fashion Dropshipping Dubai | PALETTE HUB`;
  const description =
    product.description ||
    `Order ${product.name} at PALETTE HUB. Fast, reliable fashion dropshipping across Dubai, Abu Dhabi, Sharjah, the UAE, and worldwide.`;
  const canonicalUrl = `${SITE_URL}/products/${product.slug}`;
  const imageUrl = product.images?.[0] || '/images/hero/hero-card-exact.png';
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | PALETTE HUB Dubai`,
      description,
      url: canonicalUrl,
      siteName: SITE_METADATA.name,
      images: [
        {
          url: fullImageUrl,
          width: 800,
          height: 800,
          alt: `${product.name} - PALETTE HUB Fashion UAE`,
        },
      ],
      locale: 'en_AE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | PALETTE HUB Dubai`,
      description,
      images: [fullImageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { product, relatedProducts } = await getProductData(slug);

  if (!product) {
    notFound();
  }

  const productSchema = getProductSchema(product);
  const breadcrumbsSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    {
      name: product.category || 'Fashion',
      url: `/shop?category=${encodeURIComponent(product.category || 'all')}`,
    },
    { name: product.name, url: `/products/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
