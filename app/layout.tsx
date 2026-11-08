import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  SITE_METADATA,
  SITE_URL,
  getOrganizationSchema,
  getWebSiteSchema,
} from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PALETTE HUB | Official Website',
    template: `%s | ${SITE_METADATA.name}`,
  },
  description:
    'Welcome to PALETTE HUB – Explore our products, discover our collections and shop with us. Visit our official website.',
  keywords: SITE_METADATA.keywords,
  applicationName: SITE_METADATA.name,
  authors: [{ name: SITE_METADATA.name, url: SITE_URL }],
  creator: SITE_METADATA.name,
  publisher: SITE_METADATA.name,
  category: 'Fashion & Apparel',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en-AE': SITE_URL,
      en: SITE_URL,
      'x-default': SITE_URL,
    },
  },
  icons: {
    icon: [
      { url: '/images/phlogo.jpeg' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/images/phlogo.jpeg',
    apple: '/images/phlogo.jpeg',
  },
  openGraph: {
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    url: SITE_URL,
    siteName: SITE_METADATA.name,
    images: [
      {
        url: '/images/hero/hero-card-exact.png',
        width: 1200,
        height: 630,
        alt: 'PALETTE HUB — Premier Fashion Dropshipping Dubai UAE',
      },
    ],
    locale: SITE_METADATA.locale,
    alternateLocale: SITE_METADATA.alternateLocales,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    images: ['/images/hero/hero-card-exact.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const instant = false;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/phlogo.jpeg" />
        <link rel="apple-touch-icon" href="/images/phlogo.jpeg" />
        {/* Local SEO Meta Tags for Dubai & United Arab Emirates */}
        <meta name="geo.region" content={SITE_METADATA.geo.region} />
        <meta name="geo.placename" content={SITE_METADATA.geo.placename} />
        <meta name="geo.position" content={SITE_METADATA.geo.position} />
        <meta name="ICBM" content={SITE_METADATA.geo.icbm} />
        {/* Global JSON-LD Structured Data: Organization & WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f7f5ee] text-neutral-900 antialiased selection:bg-black selection:text-white">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
