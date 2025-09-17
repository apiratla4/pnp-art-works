// src/routes/redirect.routes.js
import express from 'express';
import { paypalCaptureOrderAxios } from '../config/paypal.js';

const router = express.Router();

// Example: GET /api/redirect/complete-order?token=ORDER_ID
router.get('/complete-order', async (req, res, next) => {
  try {
    const orderId = req.query?.token; // PayPal returns order id as token
    if (!orderId) return res.status(400).send('Missing token');
    await paypalCaptureOrderAxios(orderId);
    return res.status(200).send('Order captured successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/cancel-order', (req, res) => {
  return res.status(200).send('Order canceled');
});

export default router;
