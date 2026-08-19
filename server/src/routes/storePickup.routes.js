import { Router } from 'express';
import * as storePickup from '../controllers/storePickup.controller.js';

const router = Router();
router.post("/", storePickup.createStorePickupOrder);         // Create
router.get("/", storePickup.getStorePickupOrders);            // Get all
router.get("/:id", storePickup.getStorePickupOrder);          // Get one
router.patch("/:id", storePickup.updateStorePickupOrder);     // Update
router.delete("/:id", storePickup.deleteStorePickupOrder);    // Delete

export default router;
