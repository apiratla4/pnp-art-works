import express from 'express';
import {
  createOrderController,
  captureOrderController,
  webhookController,
} from '../controllers/paypal.controller.js';

const router = express.Router();

router.post('/create-order', createOrderController);
router.post('/capture-order', captureOrderController);
router.post('/webhook', webhookController);

export default router;
