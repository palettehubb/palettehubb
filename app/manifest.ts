import { MetadataRoute } from 'next';
import { SITE_METADATA } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_METADATA.name,
    short_name: SITE_METADATA.name,
    description: SITE_METADATA.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f5ee',
    theme_color: SITE_METADATA.themeColor,
    icons: [
      {
        src: '/images/phlogo.jpeg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/images/phlogo.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}

