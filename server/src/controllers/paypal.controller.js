import {
  createPayPalOrder,
  capturePayPalOrder
} from '../config/paypal.js';

// POST /api/paypal/create-order
export async function paypalCreateOrderController(req, res, next) {
  try {
    const { items, customer, shippingAddress, returnUrl, cancelUrl } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "No cart items" });

    const order = await createPayPalOrder({
      items, customer, shippingAddress, returnUrl, cancelUrl
    });

    res.status(201).json({ id: order.id, links: order.links, status: order.status });
  } catch (err) {
    next(err);
  }
}

// POST /api/paypal/capture-order
export async function paypalCaptureOrderController(req, res, next) {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "Missing orderId" });

    const capture = await capturePayPalOrder(orderId);
    res.status(200).json(capture);
  } catch (err) {
    next(err);
  }
}
