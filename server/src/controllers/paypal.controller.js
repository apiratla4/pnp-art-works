// src/controllers/paypal.controller.js
import Order from '../models/Order.js';
import {
  paypalCreateOrderAxios,
  paypalCaptureOrderAxios,
  verifyWebhookSignature,
} from '../config/paypal.js';

// POST /api/paypal/create-order
export async function createOrderController(req, res, next) {
  try {
    const {
      totals,
      items = [],
      shippingAddress,
      billingAddress,
      customer,
      userId,
      referenceId = `order-${Date.now()}`,
      brandName = 'pnp art studio',
    } = req.body || {};

    if (!totals?.grandTotal) {
      return res.status(400).json({ error: 'Missing totals.grandTotal' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items' });
    }

    // Optional: look up products by productId to recompute prices server-side
    // TODO: Replace client-sent prices with DB prices to prevent tampering.

    const { order: ppOrder, approvalLink } = await paypalCreateOrderAxios({
      totals,
      items,
      referenceId,
      brandName,
      shippingAddress,
    });

    const doc = await Order.create({
      userId,
      customer,
      items,
      shippingAddress,
      billingAddress,
      totals,
      referenceId,
      paypalOrderId: ppOrder?.id,
      intent: ppOrder?.intent,
      status: ppOrder?.status,
      approvalLink,
      paypalCreateResponse: ppOrder,
    });

    return res.status(201).json({
      id: ppOrder?.id,
      status: ppOrder?.status,
      approvalLink,
      order: { _id: doc._id, referenceId: doc.referenceId },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/paypal/capture-order
export async function captureOrderController(req, res, next) {
  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

    const captureRes = await paypalCaptureOrderAxios(orderId);
    const status = captureRes?.status;
    const captures =
      captureRes?.purchase_units?.flatMap((pu) => pu?.payments?.captures || []) || [];

    const updated = await Order.findOneAndUpdate(
      { paypalOrderId: orderId },
      {
        status,
        paypalCaptureResponse: captureRes,
        $set: { captures },
      },
      { new: true }
    );

    return res.status(200).json({
      ok: true,
      status,
      orderId,
      captures,
      order: updated,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/paypal/webhook
export async function webhookController(req, res, next) {
  try {
    const verified = await verifyWebhookSignature(req);
    if (!verified) return res.status(400).json({ error: 'Invalid webhook signature' });

    const event = req.body;

    let paypalOrderId = null;
    if (event?.event_type === 'CHECKOUT.ORDER.APPROVED') {
      paypalOrderId = event?.resource?.id || null;
    } else if (event?.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      paypalOrderId = event?.resource?.supplementary_data?.related_ids?.order_id || null;
    }

    if (paypalOrderId) {
      const update = { $push: { webhooks: event } };
      if (event?.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const capture = event?.resource;
        update.$set = { status: 'COMPLETED' };
        if (capture) update.$push.captures = capture;
      }
      await Order.findOneAndUpdate({ paypalOrderId }, update, { upsert: false });
    }

    return res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}
