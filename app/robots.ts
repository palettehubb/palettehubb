import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL || 'https://palettehubb.com').replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/',
          '/api/*',
          '/supplier-dashboard',
          '/supplier-dashboard/*',
          '/checkout',
          '/checkout/*',
          '/order-confirmation',
          '/order-confirmation/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/shop',
          '/products/*',
          '/about',
          '/contact',
          '/track-order',
          '/privacy',
          '/terms',
          '/images/*',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/',
          '/api/*',
          '/supplier-dashboard',
          '/checkout',
          '/order-confirmation',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
