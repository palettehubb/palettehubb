import { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import memoryStore from '@/lib/memoryStore';
import { SITE_URL } from '@/lib/seo';

// Default categories fallback to ensure Google ALWAYS indexes all categories even if DB connection is cold
const FALLBACK_CATEGORIES = [
  'Limited Drops',
  'Outerwear',
  "Men's Tops & Tees",
  'Men’s Bottoms',
  'Ribbed Knit Lounge sets',
  'Women’s Tops & Crops',
  'Costume',
  'Accessories',
  'Caps',
  'Hoodies',
  'Watches',
  'Chains',
];

// Default flagship products fallback
const FALLBACK_PRODUCTS = [
  { slug: 'formal-blazer', image: '/images/products/formal-blazer.png' },
  { slug: 'mens-watch', image: '/images/products/mens-watch.png' },
  { slug: 'oversized-tshirt', image: '/images/products/oversized-tshirt.png' },
  { slug: 'trendy-cap', image: '/images/products/trendy-cap.png' },
  { slug: 'chain-necklace', image: '/images/products/chain-necklace.png' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL || 'https://palettehubb.com').replace(/\/+$/, '');
  const now = new Date();

  type SitemapItem = MetadataRoute.Sitemap[number];

  let productEntries: SitemapItem[] = [];
  let categoryEntries: SitemapItem[] = [];

  try {
    const db = await connectToDatabase();
    if (db) {
      const [dbProds, dbCats] = await Promise.all([
        Product.find({ isAvailable: true }).select('slug images name updatedAt').lean(),
        Category.find({ isActive: true }).select('name slug updatedAt').lean(),
      ]);

      if (dbProds && dbProds.length > 0) {
        productEntries = dbProds.map((p) => {
          const imgUrl = Array.isArray(p.images) && p.images.length > 0
            ? (p.images[0].startsWith('http') ? p.images[0] : `${baseUrl}${p.images[0]}`)
            : undefined;

          return {
            url: `${baseUrl}/products/${p.slug}`,
            lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
            ...(imgUrl ? { images: [imgUrl] } : {}),
          };
        });
      }

      if (dbCats && dbCats.length > 0) {
        categoryEntries = dbCats.map((c) => ({
          url: `${baseUrl}/shop?category=${encodeURIComponent(c.slug || c.name)}`,
          lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      }
    }
  } catch (err) {
    console.warn('Sitemap DB query error, using fallback:', err);
  }

  // Graceful fallback from memoryStore or flagship catalog
  if (productEntries.length === 0) {
    const prods = memoryStore.products.length > 0 ? memoryStore.products : FALLBACK_PRODUCTS;
    productEntries = prods.map((p) => {
      const rawImg = ('images' in p && Array.isArray(p.images) && p.images[0]) ? p.images[0] : ('image' in p ? p.image : undefined);
      const imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${baseUrl}${rawImg}`) : undefined;

      return {
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        ...(imgUrl ? { images: [imgUrl] } : {}),
      };
    });
  }

  if (categoryEntries.length === 0) {
    const cats = memoryStore.categories.length > 0
      ? memoryStore.categories.map((c) => c.slug || c.name)
      : FALLBACK_CATEGORIES;

    categoryEntries = cats.map((catName) => ({
      url: `${baseUrl}/shop?category=${encodeURIComponent(catName)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  }

  // High-authority core site routes
  const staticRoutes: SitemapItem[] = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
      images: [`${baseUrl}/images/hero/hero-slide-1.png`],
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticRoutes, ...categoryEntries, ...productEntries];
}
