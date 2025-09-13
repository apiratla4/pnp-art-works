import { Router } from "express";
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
  validateCoupon
} from "../controllers/coupon.controller.js";

const router = Router();

router.get("/", listCoupons);
router.post("/", createCoupon);

// Edit fields
router.patch("/:id", updateCoupon);

// Toggle status
router.patch("/:id/status", updateCouponStatus);

// Delete
router.delete("/:id", deleteCoupon);

// Public validation
router.get("/validate/:code", validateCoupon);

export default router;
