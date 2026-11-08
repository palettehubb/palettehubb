import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://palettehubb.com'),
  title: 'Palette Hubb — Premier Fashion & Lifestyle Dropshipping',
  description:
    'Discover tailored blazers, oversized tees, luxury chronographs, cuban chains, and curated accessories at Palette Hubb. Direct supplier-fulfilled fashion dropshipping.',
  keywords: [
    'Palette Hubb',
    'fashion dropshipping',
    'oversized t-shirt',
    'formal blazer',
    'mens watches',
    'cuban link chains',
    'accessories',
    'Indian ecommerce',
  ],
  icons: {
    icon: '/images/phlogo.jpeg',
    shortcut: '/images/phlogo.jpeg',
    apple: '/images/phlogo.jpeg',
  },
  openGraph: {
    title: 'Palette Hubb — Premier Fashion & Lifestyle Store',
    description:
      'Curated fashion drops, supplier-fulfilled dropshipping, and premium lifestyle goods.',
    url: 'https://palettehubb.com',
    siteName: 'Palette Hubb',
    images: [
      {
        url: '/images/hero/hero-card-exact.png',
        width: 1200,
        height: 630,
        alt: 'Palette Hubb Fashion Collection',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/phlogo.jpeg" />
        <link rel="apple-touch-icon" href="/images/phlogo.jpeg" />
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
