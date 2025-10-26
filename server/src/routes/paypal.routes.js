import express from 'express';
import {
  createOrderController,
  captureOrderController
  // Remove webhookController if not implemented
} from '../controllers/paypal.controller.js';

const router = express.Router();

router.post('/create-order', createOrderController);
router.post('/capture-order', captureOrderController);
// Remove this line if you haven’t created webhookController
// router.post('/webhook', webhookController);

export default router;
