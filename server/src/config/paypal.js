import axios from "axios";

const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_MODE,
} = process.env;

const BASE_URL = PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

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

export async function createPayPalOrder({ items, customer, shippingAddress, returnUrl, cancelUrl }) {
  const accessToken = await getPayPalAccessToken();

  // Cart total computation
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  const purchase_units = [
    {
      amount: {
        currency_code: "USD",
        value: totalAmount,
        breakdown: {
          item_total: {
            currency_code: "USD",
            value: totalAmount
          }
        }
      },
      items: items.map(item => ({
        name: item.name,
        unit_amount: { value: item.price.toFixed(2), currency_code: "USD" },
        quantity: item.quantity.toString(),
        description: item.description || "",
        category: "PHYSICAL_GOODS"
      })),
      ...(shippingAddress && {
        shipping: {
          name: { full_name: `${shippingAddress.firstName} ${shippingAddress.lastName}` },
          address: {
            address_line_1: shippingAddress.address1,
            address_line_2: shippingAddress.address2 || "",
            admin_area_2: shippingAddress.city,
            admin_area_1: shippingAddress.state,
            postal_code: shippingAddress.zip,
            country_code: shippingAddress.country || "US"
          }
        }
      })
    }
  ];

  const orderData = {
    intent: "CAPTURE",
    purchase_units,
    payer: customer ? {
      email_address: customer.email,
      name: {
        given_name: customer.firstName,
        surname: customer.lastName
      }
    } : undefined,
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
  return data; // includes id, links, status
}

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
