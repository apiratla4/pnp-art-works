// src/config/paypal.js
import axios from 'axios';
import crypto from 'crypto';

const {
  PAYPAL_BASE_URL = 'https://api-m.paypal.com', // live default
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  PAYPAL_WEBHOOK_ID,
  BASE_URL, // optional, used for return_url/cancel_url redirects
} = process.env;

function assertCreds() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_SECRET');
  }
}

export async function getAccessToken() {
  assertCreds();
  const { data } = await axios({
    url: `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    method: 'post',
    data: 'grant_type=client_credentials',
    auth: { username: PAYPAL_CLIENT_ID, password: PAYPAL_SECRET },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data.access_token;
}

// Build purchase_units, items, and breakdown for Orders v2
function buildPurchaseUnit({ totals, items }) {
  const currency = totals?.currency || 'USD';
  const toMoney = (n) => Number(n ?? 0).toFixed(2);

  const itemsForPayPal = (items || []).map((it) => ({
    name: String(it.name || it.title || 'Item'),
    quantity: String(it.qty || 1),
    unit_amount: { currency_code: currency, value: toMoney(it.price || 0) },
  }));

  const itemTotal = toMoney(
    (items || []).reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0)
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

  return {
    amount: {
      currency_code: currency,
      value: grand,
      breakdown,
    },
    items: itemsForPayPal,
  };
}

// Create Order (supports both JS SDK and redirect approval)
export async function paypalCreateOrderAxios({ totals, items, referenceId = 'order', brandName = 'Store' }) {
  const accessToken = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();

  const purchaseUnit = buildPurchaseUnit({ totals, items });

  const application_context = {
    user_action: 'PAY_NOW',
    brand_name: brandName,
  };

  // Optional redirect URLs like the example; ignored by JS SDK flow but supported for link-based approvals
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
    },
    data: {
      intent: 'CAPTURE',
      purchase_units: [{ reference_id: referenceId, ...purchaseUnit }],
      application_context,
    },
  });

  // For redirect-style approvals (like your example), the approval URL can be read from links
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
  });
  return data;
}

// Remote webhook signature verification (production)
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
  });

  return data?.verification_status === 'SUCCESS';
}
