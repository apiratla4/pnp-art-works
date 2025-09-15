// server/src/routes/checkout.routes.js
import { Router } from 'express';
import { placeCodOrder } from '../controllers/checkoutController.js';

const router = Router();
router.post('/cod-order', placeCodOrder);
export default router;
