import {
  createPayPalOrder,
  capturePayPalOrder
} from '../config/paypal.js';

// Create order
export async function paypalCreateOrderController(req, res, next) {
  try {
    const { total, currency, returnUrl, cancelUrl } = req.body;
    if (!total) return res.status(400).json({ error: "Missing total" });

    const order = await createPayPalOrder({
      amount: total,
      currency: currency || "USD",
      returnUrl: returnUrl || "https://yourdomain.com/payment/success",
      cancelUrl: cancelUrl || "https://yourdomain.com/payment/cancel"
    });

    res.status(201).json(order); // Frontend should redirect user to approve link!
  } catch (err) {
    next(err);
  }
}

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
