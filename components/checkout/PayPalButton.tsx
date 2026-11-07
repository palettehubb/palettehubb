'use client';

import React, { useEffect, useRef, useState } from 'react';
import { IShippingAddress, ICartItem, IOrder } from '@/types';

interface PayPalButtonProps {
  customer: IShippingAddress;
  items: ICartItem[];
  couponCode?: string;
  totalINR: number;
  disabled?: boolean;
  onSuccess: (order: IOrder) => void;
  onError: (errorMsg: string) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paypal?: any;
  }
}

export default function PayPalButton({
  customer,
  items,
  couponCode,
  totalINR,
  disabled,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    'Af_M98Cn4XAf4ZlM0AEZEWqOUurcjhIWnS9CKfxv81gAddrLiRhZRQj8OQrVxRTd0euOdpgQjjl7SFYJ';

  // Load the PayPal JS SDK dynamically
  useEffect(() => {
    if (!clientId) {
      onError('PayPal Client ID is not configured.');
      return;
    }

    const scriptId = 'paypal-sdk-script';
    const existingScript = document.getElementById(scriptId);

    if (existingScript && window.paypal) {
      setSdkReady(true);
      return;
    }

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
      script.async = true;
      script.onload = () => setSdkReady(true);
      script.onerror = () => onError('Failed to load PayPal secure checkout SDK.');
      document.body.appendChild(script);
    }
  }, [clientId, onError]);

  // Render PayPal Buttons once SDK is ready and container exists
  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current) return;

    // Clear previous button render if any
    containerRef.current.innerHTML = '';

    try {
      window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 48,
          },
          // Validate required fields before launching PayPal modal
          onClick: (_data: unknown, actions: { resolve: () => void; reject: () => void }) => {
            if (disabled) {
              return actions.reject();
            }
            if (
              !customer.fullName ||
              !customer.email ||
              !customer.phone ||
              !customer.street ||
              !customer.city ||
              !customer.pincode
            ) {
              onError('Please fill in all required shipping address fields above first.');
              return actions.reject();
            }
            return actions.resolve();
          },
          // 1. Create order on server
          createOrder: async () => {
            try {
              setIsProcessing(true);
              const res = await fetch('/api/payments/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  items: items.map((i) => ({
                    productId: i.productId,
                    slug: i.slug,
                    price: i.price,
                    quantity: i.quantity,
                  })),
                  couponCode,
                  clientTotal: totalINR,
                }),
              });

              const data = await res.json();
              if (!data.success || !data.orderId) {
                throw new Error(data.error || 'Failed to create PayPal order.');
              }
              return data.orderId;
            } catch (err: unknown) {
              setIsProcessing(false);
              const message = err instanceof Error ? err.message : 'PayPal order creation failed';
              onError(message);
              throw err;
            }
          },
          // 2. Capture order on server
          onApprove: async (data: { orderID: string }) => {
            try {
              setIsProcessing(true);
              const res = await fetch('/api/payments/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  paypalOrderId: data.orderID,
                  customer,
                  items,
                  couponCode,
                }),
              });

              const captureData = await res.json();
              if (!captureData.success) {
                throw new Error(captureData.error || 'PayPal capture failed.');
              }

              setIsProcessing(false);
              onSuccess(captureData.order);
            } catch (err: unknown) {
              setIsProcessing(false);
              const message = err instanceof Error ? err.message : 'PayPal payment capture failed';
              onError(message);
            }
          },
          onCancel: () => {
            setIsProcessing(false);
          },
          onError: (err: unknown) => {
            setIsProcessing(false);
            console.error('PayPal button error:', err);
            onError('Payment could not be completed with PayPal. Please try again.');
          },
        })
        .render(containerRef.current);
    } catch (e) {
      console.error('PayPal render error:', e);
    }
  }, [sdkReady, customer, items, couponCode, totalINR, disabled, onSuccess, onError]);

  return (
    <div className="w-full mt-3">
      {isProcessing && (
        <div className="p-3 mb-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-amber-900 animate-pulse">
          <div className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin" />
          <span>Communicating with PayPal secure gateway...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full min-h-[50px]" />
    </div>
  );
}
