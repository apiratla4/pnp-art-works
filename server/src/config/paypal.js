import axios from "axios";

const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_MODE,
} = process.env;

const BASE_URL =
  PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// Get OAuth2 Bearer Token
export async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const { data } = await axios.post(
    `${BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
  return data.access_token;
}

// Create PayPal order
export async function createPayPalOrder({
  amount, currency = "USD", returnUrl, cancelUrl,
}) {
  const accessToken = await getPayPalAccessToken();

  const orderData = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: { currency_code: currency, value: amount }
      }
    ],
    application_context: {
      brand_name: "PnP Art Studio",
      user_action: "PAY_NOW",
      return_url: returnUrl,
      cancel_url: cancelUrl
    }
  };

  const { data } = await axios.post(
    `${BASE_URL}/v2/checkout/orders`, orderData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data;
}

// Capture approved PayPal order
export async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();
  const { data } = await axios.post(
    `${BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );
  return data;
}
