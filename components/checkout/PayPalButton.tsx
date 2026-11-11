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
  disabled,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isRenderedRef = useRef(false);

  // Store latest values in refs to avoid re-rendering and destroying the PayPal iframe on keystrokes
  const customerRef = useRef(customer);
  customerRef.current = customer;

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const couponCodeRef = useRef(couponCode);
  couponCodeRef.current = couponCode;

  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    'BAA29Z8SGTxCZCNtjhPHqWvhu2bI65kTY0MnJs1O_795cTY7llUTzadfadsEjlltFj91IsYMXOdHPp5UNE';

  // Safeguard: suppress benign PayPal SDK internal promise cancellations from bubbling to the Next.js dev error overlay
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reasonStr = String(event?.reason || '');
      const reasonMsg = String(event?.reason?.message || '');
      if (
        reasonStr.includes('paypal_js_sdk_v5') ||
        reasonStr.includes('post-robot') ||
        reasonStr.includes('zoid') ||
        reasonMsg.includes('paypal')
      ) {
        // Prevent dev overlay crash while still keeping execution alive
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  // 1. Load the PayPal JS SDK dynamically
  useEffect(() => {
    if (!clientId) {
      onErrorRef.current('PayPal Client ID is not configured.');
      return;
    }

    const scriptId = 'paypal-sdk-script';
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existingScript && window.paypal) {
      setSdkReady(true);
      return;
    }

    if (existingScript && !window.paypal) {
      const handleLoad = () => setSdkReady(true);
      existingScript.addEventListener('load', handleLoad);
      return () => existingScript.removeEventListener('load', handleLoad);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons,funding-eligibility&enable-funding=card`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => onErrorRef.current('Failed to load PayPal secure checkout SDK.');
    document.body.appendChild(script);
  }, [clientId]);

  // 2. Render PayPal Buttons once SDK is ready - rendered ONCE without tearing down on every keystroke
  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current) return;
    if (isRenderedRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    try {
      const buttons = window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 48,
        },
        // Validate required fields before launching PayPal modal
        onClick: (_data: unknown, actions: { resolve: () => any; reject: () => any }) => {
          if (disabledRef.current) {
            onErrorRef.current('Please agree to the 3-Day Return Policy before proceeding.');
            try {
              const res = actions.reject();
              if (res && typeof res.catch === 'function') res.catch(() => {});
              return res;
            } catch {
              return;
            }
          }

          const c = customerRef.current;
          if (
            !c.fullName?.trim() ||
            !c.email?.trim() ||
            !c.phone?.trim() ||
            !c.street?.trim() ||
            !c.city?.trim() ||
            !c.state?.trim()
          ) {
            onErrorRef.current('Please fill in required shipping fields (Name, Email, Phone, Street, City, State) first.');
            try {
              const res = actions.reject();
              if (res && typeof res.catch === 'function') res.catch(() => {});
              return res;
            } catch {
              return;
            }
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) {
            onErrorRef.current('Please provide a valid email address for your order confirmation receipt.');
            try {
              const res = actions.reject();
              if (res && typeof res.catch === 'function') res.catch(() => {});
              return res;
            } catch {
              return;
            }
          }

          if (c.phone.trim().length < 6) {
            onErrorRef.current('Please provide a valid contact phone number for delivery dispatch.');
            try {
              const res = actions.reject();
              if (res && typeof res.catch === 'function') res.catch(() => {});
              return res;
            } catch {
              return;
            }
          }

          return actions.resolve();
        },

        // 1. Create order on server (100% server verified from database)
        createOrder: async () => {
          try {
            setIsProcessing(true);
            const res = await fetch('/api/payments/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer: {
                  country: customerRef.current.country,
                  state: customerRef.current.state,
                },
                items: itemsRef.current.map((i) => ({
                  productId: i.productId,
                  slug: i.slug,
                  price: i.price,
                  quantity: i.quantity,
                })),
                couponCode: couponCodeRef.current,
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
            onErrorRef.current(message);
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
                customer: customerRef.current,
                items: itemsRef.current,
                couponCode: couponCodeRef.current,
              }),
            });

            const captureData = await res.json();
            if (!captureData.success) {
              throw new Error(captureData.error || 'PayPal capture failed.');
            }

            setIsProcessing(false);
            onSuccessRef.current(captureData.order);
          } catch (err: unknown) {
            setIsProcessing(false);
            const message = err instanceof Error ? err.message : 'Payment capture failed';
            onErrorRef.current(message);
          }
        },

        onCancel: () => {
          setIsProcessing(false);
          onErrorRef.current('Payment window was cancelled. No charges were made.');
        },

        onError: (err: unknown) => {
          setIsProcessing(false);
          console.warn('PayPal Smart Button notice:', err);
          onErrorRef.current('PayPal encountered a processing error. Please try again or refresh.');
        },
      });

      if (buttons.isEligible && !buttons.isEligible()) {
        console.warn('PayPal Buttons not eligible on this device/currency');
        return;
      }

      const renderPromise = buttons.render(container);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (renderPromise && typeof (renderPromise as any).catch === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (renderPromise as any)
          .then(() => {
            isRenderedRef.current = true;
          })
          .catch((renderErr: unknown) => {
            console.warn('PayPal button render caught:', renderErr);
          });
      } else {
        isRenderedRef.current = true;
      }
    } catch (err: unknown) {
      console.warn('Failed to initialize PayPal Buttons:', err);
    }
  }, [sdkReady]);

  return (
    <div 
      className="w-full relative"
      onClickCapture={(e) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
          onErrorRef.current('Please agree to the 3-Day Return Policy above to unlock PayPal & Card checkout.');
        }
      }}
    >
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 p-3 mb-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold animate-pulse border border-amber-200">
          <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span>Securing transaction with PayPal Gateway...</span>
        </div>
      )}

      {/* Button Mount Target */}
      <div
        ref={containerRef}
        className={`w-full min-h-[50px] transition-opacity duration-200 ${
          disabled ? 'opacity-50 pointer-events-none' : 'opacity-100'
        }`}
      />

      {!sdkReady && (
        <div className="w-full h-12 rounded-xl bg-neutral-100 animate-pulse flex items-center justify-center text-xs text-neutral-400 font-semibold border border-neutral-200">
          Initializing PayPal Live Checkout...
        </div>
      )}
    </div>
  );
}
