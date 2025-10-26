import {
  createPayPalOrder,
  capturePayPalOrder
} from '../config/paypal.js';

// POST /api/paypal/create-order
export async function paypalCreateOrderController(req, res, next) {
  try {
    const { total, currency, returnUrl, cancelUrl } = req.body;
    if (!total) return res.status(400).json({ error: "Missing order total" });

    const order = await createPayPalOrder({
      amount: total,
      currency: currency || "USD",
      returnUrl: returnUrl || "https://pnpartstudio.com/order/success",
      cancelUrl: cancelUrl || "https://pnpartstudio.com/order/cancel",
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

// POST /api/paypal/capture-order
export async function paypalCaptureOrderController(req, res, next) {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "Missing orderId" });

    const result = await capturePayPalOrder(orderId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
