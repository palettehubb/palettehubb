import React from 'react';
import type { Metadata } from 'next';
import CheckoutClient from '@/components/checkout/CheckoutClient';

export const metadata: Metadata = {
  title: 'Secure Checkout | PALETTE HUB',
  description: 'Complete your fashion order with secure payment and express dropship dispatch.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
