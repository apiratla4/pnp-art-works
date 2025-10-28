// routes/orders.routes.js
import { Router } from 'express';
import * as orders from '../controllers/orders.controller.js';

const router = Router();

router.post('/', orders.createOrder);
router.get('/', orders.getOrders);
router.get('/:id', orders.getOrder);
router.patch('/:id', orders.updateOrderStatus);
router.get('/orders/ref/:referenceId', orders.getOrderByReferenceId);
router.patch('/paypal/:paypalOrderId/capture', orders.updateOrderWithCapture);
router.post('/paypal/:paypalOrderId/webhook', orders.addWebhookEvent);

export default router;
