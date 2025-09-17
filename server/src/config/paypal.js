// src/config/paypal.js
import axios from 'axios';
import crypto from 'crypto';

const {
  // Live by default; override only if explicitly needed
  PAYPAL_BASE_URL = 'https://api-m.paypal.com',
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_SECRET, // legacy env name fallback
  PAYPAL_WEBHOOK_ID,
  BASE_URL, // optional: used for return_url/cancel_url
} = process.env;

function assertCreds() {
  const secret = PAYPAL_CLIENT_SECRET || PAYPAL_SECRET;
  if (!PAYPAL_CLIENT_ID || !secret) {
    throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET');
  }
}

export async function getAccessToken() {
  assertCreds();
  const secret = PAYPAL_CLIENT_SECRET || PAYPAL_SECRET;
  const { data } = await axios({
    url: `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    method: 'post',
    data: 'grant_type=client_credentials',
    auth: { username: PAYPAL_CLIENT_ID, password: secret },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000,
  });
  return data.access_token;
}

// Internal: enforce Orders v2 breakdown identity
function validateBreakdown({ value, breakdown }) {
  const toN = (v) => Number(v || 0);
  const sum =
    toN(breakdown?.item_total?.value) +
    toN(breakdown?.tax_total?.value) +
    toN(breakdown?.shipping?.value) +
    toN(breakdown?.handling?.value) +
    toN(breakdown?.insurance?.value) -
    toN(breakdown?.shipping_discount?.value) -
    toN(breakdown?.discount?.value);
  return Number(Number(sum).toFixed(2)) === Number(Number(value).toFixed(2));
}

// Build purchase_units with items and breakdown
function buildPurchaseUnit({ totals, items, shippingAddress }) {
  const currency = (totals?.currency || 'USD').toUpperCase();
  const toMoney = (n) => Number(n ?? 0).toFixed(2);

  const itemsForPayPal = (items || []).map((it) => ({
    name: String(it.name || it.title || 'Item').slice(0, 127),
    quantity: String(it.qty || 1),
    unit_amount: { currency_code: currency, value: toMoney(it.price || 0) },
  }));

  const itemTotal = toMoney(
    (items || []).reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.qty || 1)), 0)
  );
  const shipping = toMoney(totals?.shipping || 0);
  const tax = toMoney(totals?.tax || 0);
  const discount = toMoney(totals?.discount || 0);
  const grand = toMoney(totals?.grandTotal || 0);

  const breakdown = {
    item_total: { currency_code: currency, value: itemTotal },
  };
  if (Number(tax) > 0) breakdown.tax_total = { currency_code: currency, value: tax };
  if (Number(shipping) > 0) breakdown.shipping = { currency_code: currency, value: shipping };
  if (Number(discount) > 0) breakdown.discount = { currency_code: currency, value: discount };

  if (!validateBreakdown({ value: grand, breakdown })) {
    throw new Error('Amount breakdown does not sum to total');
  }

  const unit = {
    reference_id: 'default',
    amount: { currency_code: currency, value: grand, breakdown },
    items: itemsForPayPal,
  };

  if (shippingAddress?.fullName) {
    unit.shipping = {
      name: { full_name: shippingAddress.fullName },
      address: {
        address_line_1: shippingAddress.line1 || '',
        address_line_2: shippingAddress.line2 || '',
        admin_area_2: shippingAddress.city || '',
        admin_area_1: shippingAddress.state || '',
        postal_code: shippingAddress.postalCode || '',
        country_code: (shippingAddress.countryCode || 'US').toUpperCase(),
      },
    };
  }

  return unit;
}

// Create Order (JS SDK or redirect approval)
export async function paypalCreateOrderAxios({
  totals,
  items,
  referenceId = `order-${Date.now()}`,
  brandName = 'pnp art studio',
  shippingAddress,
}) {
  const accessToken = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();

  const purchaseUnit = buildPurchaseUnit({ totals, items, shippingAddress });
  purchaseUnit.reference_id = referenceId;

  const application_context = {
    user_action: 'PAY_NOW',
    brand_name: brandName,
    shipping_preference: shippingAddress?.fullName ? 'SET_PROVIDED_ADDRESS' : 'GET_FROM_FILE',
  };

  if (BASE_URL) {
    application_context.return_url = `${BASE_URL}/complete-order`;
    application_context.cancel_url = `${BASE_URL}/cancel-order`;
  }

  const { data } = await axios({
    url: `${PAYPAL_BASE_URL}/v2/checkout/orders`,
    method: 'post',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': idempotencyKey,
      Prefer: 'return=representation',
    },
    data: {
      intent: 'CAPTURE',
      purchase_units: [purchaseUnit],
      application_context,
    },
    timeout: 20000,
  });

  const approvalLink = (data?.links || []).find((l) => l.rel === 'approve')?.href || null;
  return { order: data, approvalLink };
}

export async function paypalCaptureOrderAxios(orderId) {
  const accessToken = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  const { data } = await axios({
    url: `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    method: 'post',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': idempotencyKey,
    },
    timeout: 20000,
  });
  return data;
}

// Remote webhook signature verification
export async function verifyWebhookSignature(req) {
  if (!PAYPAL_WEBHOOK_ID) {
    throw new Error('Missing PAYPAL_WEBHOOK_ID');
  }
  const transmissionId = req.headers['paypal-transmission-id'];
  const transmissionTime = req.headers['paypal-transmission-time'];
  const certUrl = req.headers['paypal-cert-url'];
  const authAlgo = req.headers['paypal-auth-algo'];
  const transmissionSig = req.headers['paypal-transmission-sig'];

  const accessToken = await getAccessToken();

  const payload = {
    auth_algo: authAlgo,
    cert_url: certUrl,
    transmission_id: transmissionId,
    transmission_sig: transmissionSig,
    transmission_time: transmissionTime,
    webhook_id: PAYPAL_WEBHOOK_ID,
    webhook_event: req.body,
  };

  const { data } = await axios({
    url: `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    method: 'post',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    data: payload,
    timeout: 15000,
  });

  return data?.verification_status === 'SUCCESS';
}
