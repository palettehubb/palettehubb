'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Truck,
  Lock,
  Tag,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { IShippingAddress, IOrder } from '@/types';
import PayPalButton from '@/components/checkout/PayPalButton';

export const UAE_STATES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
];

export const COUNTRY_STATES_MAP: Record<string, string[]> = {
  'United Arab Emirates': UAE_STATES,
  'Saudi Arabia': [
    'Riyadh', 'Makkah', 'Eastern Province', 'Madinah', 'Al-Qassim', 'Asir', 'Tabuk',
    'Hail', 'Northern Borders', 'Jazan', 'Najran', 'Al-Bahah', 'Al-Jawf'
  ],
  'Qatar': [
    'Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Al Daayen', 'Umm Salal', 'Madinat ash Shamal', 'Al Sheehaniya'
  ],
  'Kuwait': [
    'Al Asimah (Capital)', 'Hawalli', 'Farwaniya', 'Ahmadi', 'Jahra', 'Mubarak Al-Kabeer'
  ],
  'Oman': [
    'Muscat', 'Dhofar', 'Musandam', 'Al Buraimi', 'Ad Dakhiliyah', 'Al Batinah North',
    'Al Batinah South', 'Ash Sharqiyah North', 'Ash Sharqiyah South', 'Ad Dhahirah', 'Al Wusta'
  ],
  'Bahrain': [
    'Capital', 'Muharraq', 'Northern', 'Southern'
  ],
  'United States': [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
  ],
  'United Kingdom': [
    'England', 'Scotland', 'Wales', 'Northern Ireland'
  ],
  'Canada': [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
    'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan',
    'Northwest Territories', 'Nunavut', 'Yukon'
  ],
  'India': [
    'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Gujarat', 'Uttar Pradesh',
    'Andhra Pradesh', 'Telangana', 'West Bengal', 'Punjab', 'Rajasthan', 'Haryana',
    'Bihar', 'Madhya Pradesh', 'Goa'
  ],
  'Australia': [
    'New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia',
    'Tasmania', 'Australian Capital Territory', 'Northern Territory'
  ],
  'Germany': [
    'Bavaria', 'Berlin', 'Baden-Württemberg', 'North Rhine-Westphalia', 'Hesse', 'Hamburg',
    'Lower Saxony', 'Saxony', 'Rhineland-Palatinate', 'Schleswig-Holstein'
  ],
  'France': [
    'Île-de-France', 'Auvergne-Rhône-Alpes', "Provence-Alpes-Côte d'Azur", 'Nouvelle-Aquitaine',
    'Occitanie', 'Grand Est', 'Hauts-de-France', 'Brittany', 'Normandy'
  ]
};

// Prioritize United Arab Emirates at top of country selector
const RAW_COUNTRIES = [
  'United Arab Emirates',

  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus',
  'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Congo-Brazzaville)',
  'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic (Czechia)', 'Democratic Republic of the Congo',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti',
  'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania',
  'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco',
  'Mozambique', 'Myanmar (Burma)', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua',
  'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Palestine State', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
  'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

export const ALL_COUNTRIES: string[] = Array.from(new Set(RAW_COUNTRIES));

export default function CheckoutClient() {
  const router = useRouter();
  const {
    items,
    subtotal,
    discount,
    total,
    appliedCoupon,
    clearCart,
  } = useCart();

  const [address, setAddress] = useState<IShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: 'Dubai',
    pincode: '',
    country: 'United Arab Emirates',
  });

  const [isCustomState, setIsCustomState] = useState(false);
  const [customStateInput, setCustomStateInput] = useState('');

  // Determine state list for currently selected country
  const availableStates = useMemo(() => {
    return COUNTRY_STATES_MAP[address.country] || [
      'Capital / Main Region',
      'Central Region',
      'Northern Region',
      'Southern Region',
      'Eastern Region',
      'Western Region',
    ];
  }, [address.country]);

  // Handle Country selection change
  const handleCountryChange = (newCountry: string) => {
    const states = COUNTRY_STATES_MAP[newCountry] || [
      'Capital / Main Region',
      'Central Region',
      'Northern Region',
      'Southern Region',
      'Eastern Region',
      'Western Region',
    ];
    const defaultState = newCountry === 'United Arab Emirates' ? 'Dubai' : states[0] || '';
    setIsCustomState(false);
    setCustomStateInput('');
    setAddress((prev) => ({
      ...prev,
      country: newCountry,
      state: defaultState,
    }));
  };

  // Handle State selection change
  const handleStateChange = (newState: string) => {
    if (newState === '__custom__') {
      setIsCustomState(true);
      setCustomStateInput('');
    } else {
      setIsCustomState(false);
      setCustomStateInput('');
      setAddress((prev) => ({ ...prev, state: newState }));
    }
  };

  // Live product charges map fetched directly from backend catalog
  const [liveProductsMap, setLiveProductsMap] = useState<
    Record<string, { deliveryChargeInsideDubai: number; deliveryChargeOutsideDubai: number; tax: number; price: number }>
  >({});

  // Background catalog sync on checkout mount to ensure freshest rates
  useEffect(() => {
    if (!items || items.length === 0) return;

    let isMounted = true;
    fetch('/api/products?limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          const map: Record<string, { deliveryChargeInsideDubai: number; deliveryChargeOutsideDubai: number; tax: number; price: number }> = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.products.forEach((p: any) => {
            const entry = {
              deliveryChargeInsideDubai: Number(p.deliveryChargeInsideDubai) || 0,
              deliveryChargeOutsideDubai: Number(p.deliveryChargeOutsideDubai) || 0,
              tax: Number(p.tax) || 0,
              price: Number(p.price) || 0,
            };
            if (p._id) map[String(p._id)] = entry;
            if (p.slug) map[p.slug] = entry;
            if (p.name) map[p.name.trim().toLowerCase()] = entry;
          });

          if (isMounted) {
            setLiveProductsMap(map);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [items]);

  // Dynamic Destination-based Shipping (per unique product item, not multiplied by count) & Tax Percentage Calculation
  const isDubaiSelected = useMemo(() => {
    const isUae =
      address.country.toLowerCase().includes('emirates') ||
      address.country.toLowerCase() === 'uae' ||
      address.country.toLowerCase() === 'united arab emirates';
    return isUae && address.state.trim().toLowerCase() === 'dubai';
  }, [address.country, address.state]);

  const deliveryCharge = useMemo(() => {
    // Real-world logic: Delivery charge applies per unique product item to destination, not multiplied by quantity
    const productDeliveryMap = new Map<string, number>();
    for (const item of items) {
      const prodKey = item.productId || item.slug;
      if (!productDeliveryMap.has(prodKey)) {
        const live =
          liveProductsMap[item.productId] ||
          liveProductsMap[item.slug] ||
          (item.name ? liveProductsMap[item.name.trim().toLowerCase()] : null);

        const insideRate = live !== undefined && live !== null ? live.deliveryChargeInsideDubai : (item.deliveryChargeInsideDubai ?? 0);
        const outsideRate = live !== undefined && live !== null ? live.deliveryChargeOutsideDubai : (item.deliveryChargeOutsideDubai ?? 0);

        const charge = isDubaiSelected ? insideRate : outsideRate;
        productDeliveryMap.set(prodKey, charge);
      }
    }
    return Array.from(productDeliveryMap.values()).reduce((sum, val) => sum + val, 0);
  }, [items, isDubaiSelected, liveProductsMap]);

  const taxAmount = useMemo(() => {
    // Real-world logic: Tax is entered as percentage (e.g. 5 = 5% of item total amount)
    return items.reduce((sum, item) => {
      const live =
        liveProductsMap[item.productId] ||
        liveProductsMap[item.slug] ||
        (item.name ? liveProductsMap[item.name.trim().toLowerCase()] : null);

      const taxRate = live !== undefined && live !== null ? live.tax : (item.tax ?? 0);
      const price = live !== undefined && live !== null ? live.price : item.price;
      const lineAmount = price * item.quantity;
      return sum + (lineAmount * taxRate) / 100;
    }, 0);
  }, [items, liveProductsMap]);

  const effectiveSubtotal = useMemo(() => {
    const liveSub = items.reduce((sum, item) => {
      const live =
        liveProductsMap[item.productId] ||
        liveProductsMap[item.slug] ||
        (item.name ? liveProductsMap[item.name.trim().toLowerCase()] : null);
      const price = live !== undefined && live !== null ? live.price : item.price;
      return sum + price * item.quantity;
    }, 0);
    return liveSub > 0 ? liveSub : subtotal;
  }, [items, liveProductsMap, subtotal]);

  const calculatedTotal = useMemo(() => {
    return Math.max(0, effectiveSubtotal - discount + deliveryCharge + taxAmount);
  }, [effectiveSubtotal, discount, deliveryCharge, taxAmount]);

  const [agreedToReturnPolicy, setAgreedToReturnPolicy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<IOrder | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderSuccess = (order: IOrder) => {
    // Immediately lock completed order state and scroll smoothly to top so user sees instant confirmation
    setCompletedOrder(order);
    setShowCelebration(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    try {
      const existing = JSON.parse(localStorage.getItem('palette_device_orders') || '[]');
      const updatedDeviceOrders = [
        {
          orderNumber: order.orderNumber,
          date: new Date().toISOString(),
          total: order.total,
          itemsCount: order.items?.length || 1,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...existing.filter((o: any) => o.orderNumber !== order.orderNumber),
      ].slice(0, 10);
      localStorage.setItem('palette_device_orders', JSON.stringify(updatedDeviceOrders));
    } catch {
      // ignore storage failure
    }

    // Clear cart right before router navigation to avoid layout collapse jump to footer
    setTimeout(() => {
      clearCart();
      router.push(`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`);
    }, 2200);
  };

  if ((items.length === 0 || !items) && !completedOrder) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Your Bag is Empty</h2>
        <p className="text-xs text-neutral-500 mb-6 max-w-sm">
          Add items to your cart before proceeding to the checkout section.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-black text-white text-xs font-semibold px-6 py-3 rounded-full hover:bg-neutral-800 transition-colors"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f5ee] min-h-screen py-10 sm:py-14 select-none relative">
      {/* Celebratory Success Modal */}
      {showCelebration && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl text-center border border-emerald-100 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5] animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Payment Completed</span>
            </div>

            <h2 className="text-2xl font-black text-neutral-900 tracking-tight mb-2">
              Payment Successful!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mb-4">
              Your order <span className="font-mono font-bold text-black">#{completedOrder.orderNumber}</span> has been paid & verified via PayPal. Confirmation emails have been dispatched.
            </p>

            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 mb-6 text-left">
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>Amount Paid</span>
                <span className="font-bold text-neutral-900">${completedOrder.total.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Customer</span>
                <span className="font-semibold text-neutral-900">{completedOrder.customer.fullName}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-500">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>Redirecting to Order Tracking...</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black">
              Shop
            </Link>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">Secure Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Secure Checkout
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Orders are processed immediately with direct dispatch.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Shipping Address & Payment Selection */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Shipping Address Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100 flex items-center justify-between">
                <span>1. Shipping & Delivery Address</span>
                <span className="text-xs text-neutral-400 font-normal">All fields required</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Enter recipient's full name"
                    value={address.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g. +1 555-0199 or +91 9876543210"
                    value={address.phone}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                  Email Address (for Order Updates & Tracking) *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="recipient@example.com"
                  value={address.email}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                    Country / Region *
                  </label>
                  <select
                    name="country"
                    value={address.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-black cursor-pointer"
                  >
                    {ALL_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5 flex items-center justify-between">
                    <span>Postal / ZIP Code</span>
                    <span className="text-[10px] text-neutral-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Optional postal / ZIP code"
                    value={address.pincode || ''}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                  Street Address & Apartment / Suite *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                  value={address.street}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. Dubai, Abu Dhabi, or New York"
                    value={address.city}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-neutral-700 uppercase">
                      State / Emirate / Region *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomState(!isCustomState);
                        if (!isCustomState) setCustomStateInput(address.state);
                      }}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      {isCustomState ? 'Choose from list' : '+ Type Custom'}
                    </button>
                  </div>

                  {isCustomState ? (
                    <input
                      type="text"
                      name="state"
                      required
                      placeholder="Type state, province or emirate name"
                      value={customStateInput}
                      onChange={(e) => {
                        setCustomStateInput(e.target.value);
                        setAddress((prev) => ({ ...prev, state: e.target.value }));
                      }}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-black"
                    />
                  ) : (
                    <select
                      name="state"
                      value={address.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-black cursor-pointer"
                    >
                      {availableStates.map((st) => (
                        <option key={st} value={st}>
                          {st}{address.country === 'United Arab Emirates' && st === 'Dubai' ? ' — (Inside Dubai Delivery)' : ''}
                        </option>
                      ))}
                      <option value="__custom__">+ Enter custom state / region...</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Section - Clean PayPal Information */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100 flex items-center justify-between">
                <span>Payment Method</span>
                <span className="text-xs font-black tracking-tight text-[#003087]">
                  PayPal Express & Cards
                </span>
              </h2>

              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-neutral-900">
                    Official PayPal Live Gateway
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 font-semibold">
                    <span className="bg-white px-2 py-0.5 rounded border border-neutral-200">Visa</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-neutral-200">MasterCard</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-neutral-200">Amex</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-neutral-200">Discover</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-600 mt-2 leading-relaxed">
                  Pay securely with your PayPal account or direct credit/debit card. Your payment is encrypted and verified before order creation.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Placement */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-md sticky top-28 space-y-6">
              <h2 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
                Order Review ({items.length} items)
              </h2>

              {/* Items preview list */}
              <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-neutral-100 pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="pt-3 first:pt-0 flex items-center gap-3"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-neutral-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''} {item.color ? `• Color: ${item.color}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-neutral-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="border-t border-neutral-100 pt-4 space-y-2.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-neutral-900">
                    ${effectiveSubtotal.toFixed(2)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Coupon Discount ({appliedCoupon?.code})
                    </span>
                    <span>- ${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-neutral-800">Delivery Charge</span>
                    <span className="text-[10px] text-neutral-500">
                      {isDubaiSelected
                        ? 'Inside Dubai rate applied'
                        : `Outside Dubai / Standard delivery (${address.country})`}
                    </span>
                  </div>
                  <span className="font-semibold text-neutral-900">
                    ${deliveryCharge.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-800">Tax</span>
                  <span className="font-semibold text-neutral-900">
                    ${taxAmount.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-neutral-200 pt-3 flex justify-between text-sm sm:text-base font-black text-neutral-900">
                  <div className="flex flex-col">
                    <span>Total Amount</span>
                    <span className="text-[10px] font-normal text-neutral-400">
                      Price (${(effectiveSubtotal - discount).toFixed(2)}) + Delivery (${deliveryCharge.toFixed(2)}) + Tax (${taxAmount.toFixed(2)})
                    </span>
                  </div>
                  <span className="text-base sm:text-lg text-[#003087]">
                    ${calculatedTotal.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Mandatory 3-Day Return Policy & Unboxing video agreement */}
              <div className="pt-1">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-colors ${
                    !agreedToReturnPolicy && errorMessage?.includes('Return Policy')
                      ? 'bg-red-50/60 border-red-300'
                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={agreedToReturnPolicy}
                    onChange={(e) => {
                      setAgreedToReturnPolicy(e.target.checked);
                      if (errorMessage?.includes('Return Policy')) {
                        setErrorMessage(null);
                      }
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-[#985842] focus:ring-[#985842] accent-[#985842] cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-neutral-600 leading-snug">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="font-semibold text-neutral-900 underline underline-offset-2 hover:text-[#985842]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      3-Day Return Policy
                    </Link>{' '}
                    and the mandatory unboxing video requirement for damages.
                  </span>
                </label>
              </div>

              {/* Payment Action: PayPal Smart Buttons */}
              <div className="pt-1">
                <PayPalButton
                  customer={address}
                  items={items}
                  couponCode={appliedCoupon?.code}
                  totalINR={calculatedTotal}
                  disabled={!agreedToReturnPolicy}
                  onSuccess={(confirmedOrder) => {
                    handleOrderSuccess(confirmedOrder);
                  }}
                  onError={(err) => {
                    setErrorMessage(err);
                  }}
                />
                {!agreedToReturnPolicy && (
                  <p className="text-[11px] text-amber-700 text-center mt-2">
                    Please check the Return Policy agreement above to activate PayPal checkout.
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2 text-neutral-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified PayPal live integration • SSL Protected</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Truck className="w-4 h-4 text-neutral-800" />
                  <span>Direct order routing & dispatch</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <Lock className="w-4 h-4 text-neutral-400" />
                  <span>
                    View our{' '}
                    <Link href="/privacy" target="_blank" className="underline hover:text-neutral-800">
                      Privacy Policy
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
