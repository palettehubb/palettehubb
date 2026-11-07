/**
 * PayPal REST API v2 Integration Helper
 * Supports both Sandbox (Test) and Live Production modes.
 */

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Returns the PayPal API base URL depending on the configured mode.
 */
export function getPayPalBaseUrl(): string {
  const mode = process.env.PAYPAL_MODE || 'sandbox';
  return mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

/**
 * Obtains an OAuth 2.0 access token from PayPal using Client ID and Secret.
 * Uses in-memory caching to avoid redundant requests.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId =
    process.env.PAYPAL_CLIENT_ID ||
    'Af_M98Cn4XAf4ZlM0AEZEWqOUurcjhIWnS9CKfxv81gAddrLiRhZRQj8OQrVxRTd0euOdpgQjjl7SFYJ';
  const clientSecret =
    process.env.PAYPAL_CLIENT_SECRET ||
    'EBYn3e_kSk3-oAn_g-hxZO7xwOzfnosWknsqeIk7jDDJlbZX_OPBazwXA5MlZTfXXm-DH3J151fwQ7eC';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal Client ID or Secret is missing in environment variables.');
  }

  // Return cached token if valid (with 60-second safety buffer)
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  const baseUrl = getPayPalBaseUrl();
  const basicAuth = Buffer.from(`${clientId.trim()}:${clientSecret.trim()}`).toString('base64');

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal OAuth token error:', errorText);
    throw new Error(`Failed to authenticate with PayPal: ${response.statusText}`);
  }

  const data: PayPalTokenResponse = await response.json();
  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  return cachedAccessToken;
}

export interface CreateOrderParams {
  amount: number; // In selected currency (e.g. USD)
  currency?: string; // 'USD' by default for universal sandbox/global card support
  description?: string;
  referenceId?: string;
}

/**
 * Creates an order on PayPal's v2 Checkout API.
 */
export async function createPayPalOrder({
  amount,
  currency = 'USD',
  description = 'Palette Hubb Fashion Order',
  referenceId,
}: CreateOrderParams) {
  const token = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const formattedAmount = Number(amount).toFixed(2);

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: referenceId || `ph_${Date.now()}`,
          description,
          amount: {
            currency_code: currency,
            value: formattedAmount,
          },
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('PayPal order creation failed:', data);
    throw new Error(data.message || 'Failed to create PayPal order');
  }

  return data;
}

/**
 * Captures an approved PayPal order.
 */
export async function capturePayPalOrder(orderId: string) {
  const token = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('PayPal order capture failed:', data);
    throw new Error(data.message || 'Failed to capture PayPal payment');
  }

  return data;
}

/**
 * Retrieves details of a PayPal order to check its current status (e.g. CREATED, APPROVED, COMPLETED).
 */
export async function getPayPalOrderDetails(orderId: string) {
  const token = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Failed to get PayPal order details:', data);
    throw new Error(data.message || 'Failed to fetch PayPal order status');
  }

  return data;
}

/**
 * Helper to convert INR (₹) amount to USD ($) at a reliable exchange rate.
 * Standard fallback rate is ~86.5 INR = 1 USD.
 */
export function convertInrToUsd(inrAmount: number, rate = 86.5): number {
  const usd = inrAmount / rate;
  return Math.round(usd * 100) / 100;
}
