import { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import memoryStore from '@/lib/memoryStore';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  let productEntries: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = [];
  let categoryEntries: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = [];

  try {
    const db = await connectToDatabase();
    if (db) {
      const [dbProds, dbCats] = await Promise.all([
        Product.find({ isAvailable: true }).select('slug updatedAt').lean(),
        Category.find({ isActive: true }).select('name slug updatedAt').lean(),
      ]);

      if (dbProds && dbProds.length > 0) {
        productEntries = dbProds.map((p) => ({
          url: `${baseUrl}/products/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      }

      if (dbCats && dbCats.length > 0) {
        categoryEntries = dbCats.map((c) => ({
          url: `${baseUrl}/shop?category=${encodeURIComponent(c.slug || c.name)}`,
          lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      }
    }
  } catch (err) {
    console.warn('Sitemap DB query error, using fallback:', err);
  }

  // Graceful fallback from memoryStore if DB is temporarily empty
  if (productEntries.length === 0 && memoryStore.products.length > 0) {
    productEntries = memoryStore.products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  }

  if (categoryEntries.length === 0 && memoryStore.categories.length > 0) {
    categoryEntries = memoryStore.categories.map((c) => ({
      url: `${baseUrl}/shop?category=${encodeURIComponent(c.slug || c.name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...categoryEntries,
    ...productEntries,
  ];
}
