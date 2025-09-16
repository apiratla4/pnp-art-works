// src/controllers/paypal.controller.js
import axios from 'axios';

const PAYPAL_BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const { data } = await axios({
    url: `${PAYPAL_BASE}/v1/oauth2/token`,
    method: 'post',
    auth: { username: process.env.PAYPAL_CLIENT_ID, password: process.env.PAYPAL_CLIENT_SECRET },
    params: { grant_type: 'client_credentials' }
  });
  return data.access_token;
}

export async function createOrder(req, res, next) {
  try {
    const { summary } = req.body || {};
    const access = await getAccessToken();
    const body = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: String(Number(summary?.total || 0).toFixed(2))
          }
        }
      ]
    };
    const { data } = await axios.post(`${PAYPAL_BASE}/v2/checkout/orders`, body, {
      headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' }
    });
    res.status(201).json({ orderID: data.id });
  } catch (e) { next(e); }
}

export async function captureOrder(req, res, next) {
  try {
    const { orderID } = req.body || {};
    const access = await getAccessToken();
    const { data } = await axios.post(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {}, {
      headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' }
    });
    // data.status === 'COMPLETED'
    res.json({ ok: true, orderId: orderID, status: data.status });
  } catch (e) { next(e); }
}
