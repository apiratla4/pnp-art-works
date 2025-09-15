// server/src/routes/paypal.routes.js
import { Router } from 'express';
import { createPaypalOrder, capturePaypalOrder } from '../controllers/paypalController.js';

const router = Router();
router.post('/create-order', createPaypalOrder);
router.post('/capture-order', capturePaypalOrder);
export default router;
