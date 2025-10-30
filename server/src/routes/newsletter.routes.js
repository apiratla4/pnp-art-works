import { Router } from "express";
import {
  subscribe, listSubscribers, exportSubscribers,
  createCampaign, listCampaigns, sendNowById, scheduleById, checkSubscriber, claimCoupon
} from "../controllers/newsletter.controller.js";

const router = Router();

router.post("/subscribe", subscribe);
router.get("/subscriber-exists", checkSubscriber);
router.post("/claim-coupon", claimCoupon);
router.get("/subscribers", listSubscribers);
router.get("/subscribers/export", exportSubscribers);
router.get("/campaigns", listCampaigns);
router.post("/campaigns", createCampaign);
router.post("/campaigns/:id/send-now", sendNowById);
router.patch("/campaigns/:id/schedule", scheduleById);

export default router;
