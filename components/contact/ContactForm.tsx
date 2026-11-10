'use client';

import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ExternalLink, Globe, Smartphone } from 'lucide-react';

const WA_PHONE = '971568181187';

export default function ContactForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [subject, setSubject] = useState('Order Tracking & Status');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [preparedText, setPreparedText] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const formatMessageText = () => {
    const lines = [
      'Hello PALETTE HUB,',
      '',
      'I would like to submit an enquiry via your official website:',
      `- Name: ${fullName.trim()}`,
      `- Email: ${email.trim()}`,
      `- Topic: ${subject}`,
      orderNumber.trim() ? `- Order Number: ${orderNumber.trim()}` : null,
      `- Message: ${message.trim()}`,
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) return;

    const text = formatMessageText();
    const encoded = encodeURIComponent(text);

    const directWeb = `https://web.whatsapp.com/send?phone=${WA_PHONE}&text=${encoded}`;
    const directApp = `https://wa.me/${WA_PHONE}?text=${encoded}`;

    setPreparedText(text);
    setWebUrl(directWeb);
    setAppUrl(directApp);
    setSubmitted(true);

    // Auto-launch the appropriate version
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const target = isMobile ? directApp : directWeb;
      window.open(target, '_blank');
    }
  };

  const handleCopy = async () => {
    if (!preparedText) return;
    try {
      await navigator.clipboard.writeText(preparedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center text-emerald-800 animate-in fade-in duration-300">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-1.5">
          Inquiry Pre-filled & Ready for WhatsApp
        </h3>
        <p className="text-xs text-neutral-600 max-w-md mx-auto mb-4 leading-relaxed">
          Your message has been formatted. Choose how you&apos;d like to open WhatsApp below:
        </p>

        {/* Dual Direct Buttons: WhatsApp Web (Desktop) and WhatsApp App */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          <a
            href={webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-6 py-3.5 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Open in WhatsApp Web (Browser)</span>
          </a>

          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold px-6 py-3.5 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open in WhatsApp App</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Message</span>
              </>
            )}
          </button>
        </div>

        {/* Pre-filled Message Preview Box */}
        <div className="bg-white/95 border border-emerald-200/90 rounded-2xl p-4 text-left text-xs font-mono text-neutral-800 whitespace-pre-wrap max-w-lg mx-auto shadow-2xs">
          {preparedText}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setMessage('');
              setOrderNumber('');
            }}
            className="text-xs font-bold text-neutral-600 hover:text-black underline cursor-pointer"
          >
            ← Fill out another inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
            Your Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
            Your Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="recipient@example.com"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
            Order Number (If applicable)
          </label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. PH-12345"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
            Inquiry Topic *
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black cursor-pointer"
          >
            <option value="Order Tracking & Status">Order Tracking & Status</option>
            <option value="Product Details & Sizing">Product Details & Sizing</option>
            <option value="Return / Damage Claim">Return / Damage Claim (Unboxing Video)</option>
            <option value="Supplier / Brand Inquiry">Supplier / Brand Inquiry</option>
            <option value="General Question">General Question</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
          Your Message *
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can PALETTE HUB assist you today?"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-7 py-3.5 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span>Send Inquiry via WhatsApp</span>
        </button>
        <span className="text-[11px] text-neutral-400 self-center">
          Transfers structured message directly to PALETTE HUB WhatsApp
        </span>
      </div>
    </form>
  );
}
