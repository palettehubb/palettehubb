import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import TrackOrderClient from '@/components/order/TrackOrderClient';
import { SITE_URL, getBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Track Your Fashion Order | PALETTE HUB Dubai & UAE Delivery',
  description:
    'Track live courier status and fulfillment milestones for your PALETTE HUB garment and fashion orders across Dubai, the UAE, and worldwide.',
  alternates: {
    canonical: `${SITE_URL}/track-order`,
  },
};

export default function TrackOrderPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Track Order', url: '/track-order' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#f7f5ee] flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <TrackOrderClient />
      </Suspense>
    </>
  );
}
