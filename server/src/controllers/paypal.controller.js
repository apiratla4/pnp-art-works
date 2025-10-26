import Order from '../models/Order.js';
import {
  paypalCreateOrderAxios,
  paypalCaptureOrderAxios,
  verifyWebhookSignature,
} from '../config/paypal.js';

export async function createOrderController(req, res, next) {
  try {
    const {
      totals, items, referenceId, brandName,
      shippingAddress, billingAddress, customer, userId,
    } = req.body || {};

    if (!totals?.grandTotal) return res.status(400).json({ error: 'Missing totals.grandTotal' });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' });

    const { order: ppOrder, approvalLink } = await paypalCreateOrderAxios({
      totals, items, referenceId, brandName, shippingAddress,
    });

    const doc = await Order.create({
      userId,
      customer, items, shippingAddress, billingAddress, totals,
      referenceId, paypalOrderId: ppOrder?.id, intent: ppOrder?.intent,
      status: ppOrder?.status, approvalLink, paypalCreateResponse: ppOrder,
    });

    return res.status(201).json({
      id: ppOrder?.id, status: ppOrder?.status, approvalLink,
      order: { _id: doc._id, referenceId: doc.referenceId },
    });
  } catch (err) { next(err); }
}

export async function captureOrderController(req, res, next) {
  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

    const captureRes = await paypalCaptureOrderAxios(orderId);
    const status = captureRes?.status;
    const captures = captureRes?.purchase_units?.flatMap((pu) => pu?.payments?.captures || []) || [];

    const updated = await Order.findOneAndUpdate(
      { paypalOrderId: orderId },
      { status, paypalCaptureResponse: captureRes, $set: { captures } },
      { new: true }
    );

    return res.status(200).json({
      ok: true, status, orderId, captures, order: updated,
    });
  } catch (err) { next(err); }
}
