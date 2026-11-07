'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';
import { QrCode, ExternalLink, RefreshCw, CheckCircle2, Lock, Smartphone, ShieldCheck, AlertCircle } from 'lucide-react';
import { IShippingAddress, ICartItem, IOrder } from '@/types';

interface SecureQRCodePaymentProps {
  customer: IShippingAddress;
  items: ICartItem[];
  couponCode?: string;
  totalUSD: number;
  disabled?: boolean;
  onSuccess: (order: IOrder) => void;
  onError: (errorMsg: string) => void;
}

export default function SecureQRCodePayment({
  customer,
  items,
  couponCode,
  totalUSD,
  disabled,
  onSuccess,
  onError,
}: SecureQRCodePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes session
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const generateQRCode = async () => {
    if (disabled) {
      onError('Please fill in your shipping details and accept the return policy first.');
      return;
    }

    if (!customer.fullName || !customer.email || !customer.phone || !customer.street) {
      onError('Please complete all required customer shipping fields first.');
      return;
    }

    if (!items || items.length === 0) {
      onError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setQrCodeUrl(null);
    setApprovalUrl(null);
    setIsPaid(false);

    try {
      // 1. Create order on PayPal REST API
      const res = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items,
          couponCode,
          clientTotal: totalUSD,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.orderId) {
        throw new Error(data.error || 'Failed to initiate secure QR payment session');
      }

      setPaypalOrderId(data.orderId);
      const url = data.approvalUrl || `https://www.sandbox.paypal.com/checkoutnow?token=${data.orderId}`;
      setApprovalUrl(url);

      // 2. Generate crisp QR Code Image Data URL
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#002c6c', // PayPal Navy Blue
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      setQrCodeUrl(qrDataUrl);
      setCountdown(600);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate payment QR code';
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Poll for phone payment confirmation when QR code is active
  useEffect(() => {
    if (!paypalOrderId || isPaid) return;

    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/payments/paypal/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paypalOrderId,
            customer,
            items,
            couponCode,
          }),
        });

        const data = await res.json();
        if (data.success && data.paid && data.order) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setIsPaid(true);
          onSuccess(data.order);
        }
      } catch (err) {
        // Polling retry on network fluctuation
      }
    }, 3000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [paypalOrderId, isPaid, customer, items, couponCode, onSuccess]);

  // Session timer decrement
  useEffect(() => {
    if (!qrCodeUrl || isPaid) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setQrCodeUrl(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrCodeUrl, isPaid]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isPaid) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-8 text-center space-y-3 animate-in fade-in duration-300">
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-emerald-950">Payment Verified Successfully!</h3>
        <p className="text-xs text-emerald-800">
          Your order has been placed, stock reserved, and dispatch routed to supplier. Redirecting to confirmation...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-sky-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-sky-100 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0070ba] text-white flex items-center justify-center shadow-sm">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-neutral-900">Scan to Pay (Secure QR)</h4>
            <p className="text-[11px] text-neutral-500">Instant scan with any smartphone camera</p>
          </div>
        </div>
        <span className="text-xs font-black tracking-tight text-[#003087] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
          PayPal Verified
        </span>
      </div>

      {!qrCodeUrl ? (
        <div className="text-center py-4 space-y-3">
          <p className="text-xs text-neutral-600">
            Generate an encrypted, order-specific QR code to pay <strong className="text-neutral-900">${totalUSD.toFixed(2)} USD</strong> directly using PayPal, Debit, or Credit card on your phone.
          </p>

          <button
            type="button"
            onClick={generateQRCode}
            disabled={loading || disabled}
            className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Encrypted QR Code...</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>Generate Secure QR Code (${totalUSD.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* QR Code Presentation */}
          <div className="flex flex-col items-center justify-center p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3">
            <div className="relative p-2.5 bg-white rounded-2xl shadow-md border-2 border-[#0070ba]/30">
              <Image
                src={qrCodeUrl}
                alt="Scan to Pay QR Code"
                width={260}
                height={260}
                className="rounded-xl"
                priority
              />
              <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#0070ba]" />
              <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#0070ba]" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#0070ba]" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#0070ba]" />
            </div>

            <div className="text-center space-y-1">
              <div className="text-xs font-black text-neutral-900">
                Amount to Pay: <span className="text-[#0070ba]">${totalUSD.toFixed(2)} USD</span>
              </div>
              <div className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-neutral-600" />
                <span>Scan with your phone camera app to open checkout</span>
              </div>
            </div>
          </div>

          {/* Live Polling Status Indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0070ba]" />
              </span>
              <span className="text-neutral-700 font-medium text-[11px]">
                Waiting for payment on phone...
              </span>
            </div>
            <span className="font-mono text-neutral-500 font-bold text-[11px]">
              Expires: {formatTimer(countdown)}
            </span>
          </div>

          {/* Direct Mobile Link & Refresh Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            {approvalUrl && (
              <a
                href={approvalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-2.5 px-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Open Checkout Link Directly</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={generateQRCode}
              disabled={loading}
              className="w-full sm:w-auto py-2.5 px-3 border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted • Real-time order synchronization</span>
          </div>
        </div>
      )}
    </div>
  );
}
