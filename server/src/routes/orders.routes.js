import { Router } from "express";
import * as orders from "../controllers/orders.controller.js";

const router = Router();

// Basic CRUD
router.get("/", orders.getOrders);                           // GET /api/orders - list orders
router.post("/", orders.createOrder);                        // POST /api/orders - create order
router.get("/:id", orders.getOrder);                         // GET /api/orders/:id - get single order
router.patch("/:id", orders.updateOrderStatus);              // PATCH /api/orders/:id - update status

// PayPal specific
router.patch("/paypal/:paypalOrderId/capture", orders.updateOrderWithCapture);  // Update with capture
router.post("/paypal/:paypalOrderId/webhook", orders.addWebhookEvent);           // Add webhook event

export default router;
