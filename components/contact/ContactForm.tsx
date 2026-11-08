'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [subject, setSubject] = useState('Order Tracking & Status');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) return;
    // Client-side confirmation
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center text-emerald-800 animate-in fade-in duration-300">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-2">Message Sent to PALETTE HUB Support</h3>
        <p className="text-xs text-neutral-600 max-w-md mx-auto mb-5 leading-relaxed">
          Thank you for reaching out, <strong>{fullName}</strong>. Our dedicated concierge team has received your message and will respond to <strong>{email}</strong> within 12–24 business hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setMessage('');
            setOrderNumber('');
          }}
          className="text-xs font-bold text-[#985842] underline hover:text-black cursor-pointer"
        >
          Send another inquiry
        </button>
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

      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#985842] text-white text-xs font-bold px-7 py-3 rounded-full hover:bg-[#834633] transition-colors shadow-md active:scale-95 cursor-pointer"
      >
        <span>Send Inquiry to PALETTE HUB</span>
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}

