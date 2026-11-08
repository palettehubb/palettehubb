import { IProduct } from '@/types';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://palettehubb.com';

export const SITE_METADATA = {
  name: 'PALETTE HUB',
  legalName: 'PALETTE HUB',
  alternateNames: [
    'Palette Hub',
    'PALETTE HUB',
    'PaletteHub',
    'Palette Hub official website',
    'Palette Hub online store',
    'Palette Hub Dubai',
    'Palette Hub UAE',
  ],
  title: 'PALETTE HUB | Official Website',
  description:
    'Welcome to PALETTE HUB – Explore our products, discover our collections and shop with us. Visit our official website.',
  keywords: [
    // Brand search domination keywords
    'Palette Hub',
    'PALETTE HUB',
    'PaletteHub',
    'Palette Hub official website',
    'Palette Hub online store',
    'Palette Hub Dubai',
    'Palette Hub UAE',
    'Palette Hub clothing',
    'Palette Hub fashion',
    // Category & market keywords
    'Fashion dropshipping UAE',
    'Clothing dropshipping UAE',
    'Clothing suppliers Dubai',
    'Fashion dropshipping Dubai',
    'Garment suppliers UAE',
    'Wholesale clothing UAE',
    'Fashion accessories supplier Dubai',
    'Online clothing supplier UAE',
    "Women's fashion UAE",
    "Men's clothing UAE",
    'Fashion accessories Dubai',
    'Trending garments UAE',
    'Clothing dropshipping worldwide',
    'International fashion supplier',
    'Dubai fashion marketplace',
  ],
  locale: 'en_AE',
  alternateLocales: ['en_US', 'ar_AE'],
  themeColor: '#985842',
  email: 'palettehubb@gmail.com',
  geo: {
    region: 'AE-DU',
    placename: 'Dubai, United Arab Emirates',
    position: '25.2048;55.2708',
    icbm: '25.2048, 55.2708',
  },
  socialLinks: [
    'https://instagram.com',
    'https://facebook.com',
    'https://x.com',
    'https://youtube.com',
  ],
};

/**
 * Organization and OnlineStore Schema (Establishes clear Google Knowledge Graph Brand Authority)
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'OnlineStore'],
    '@id': `${SITE_URL}/#organization`,
    name: SITE_METADATA.name,
    legalName: SITE_METADATA.legalName,
    alternateName: SITE_METADATA.alternateNames,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#logo`,
      url: `${SITE_URL}/images/phlogo.jpeg`,
      caption: 'PALETTE HUB Official Logo',
    },
    image: `${SITE_URL}/images/hero/hero-card-exact.png`,
    description: SITE_METADATA.description,
    email: SITE_METADATA.email,
    sameAs: SITE_METADATA.socialLinks,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: SITE_METADATA.email,
      url: `${SITE_URL}/contact`,
      availableLanguage: ['English', 'Arabic'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dubai',
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '25.2048',
      longitude: '55.2708',
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Dubai',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Abu Dhabi',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Sharjah',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Ajman',
      },
      {
        '@type': 'Country',
        name: 'United Arab Emirates',
      },
      {
        '@type': 'Place',
        name: 'Worldwide',
      },
    ],
    priceRange: '$$',
  };
}

/**
 * WebSite Schema with internal SearchAction
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_METADATA.name,
    alternateName: SITE_METADATA.alternateNames,
    description: SITE_METADATA.description,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: ['en-AE', 'en', 'ar-AE'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * BreadcrumbList Schema generator
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Product Schema with Offer generator
 */
export function getProductSchema(product: IProduct) {
  const images = (product.images && product.images.length > 0 ? product.images : ['/images/hero/hero-card-exact.png']).map(
    (img) => (img.startsWith('http') ? img : `${SITE_URL}${img}`)
  );

  const productUrl = `${SITE_URL}/products/${product.slug}`;

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    description:
      product.description ||
      `Buy authentic ${product.name} at PALETTE HUB. Fast dropshipping across Dubai, the UAE, and worldwide.`,
    image: images,
    sku: String(product._id || product.slug),
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: SITE_METADATA.name,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: product.price.toFixed(2),
      priceValidUntil: nextYear.toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.stock && product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: SITE_METADATA.name,
        url: SITE_URL,
      },
      areaServed: [
        {
          '@type': 'Country',
          name: 'United Arab Emirates',
        },
        {
          '@type': 'Place',
          name: 'Worldwide',
        },
      ],
    },
  };
}
