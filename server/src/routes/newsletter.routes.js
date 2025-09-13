// src/routes/newsletter.routes.js
import { Router } from "express";
import {
  subscribe, listSubscribers, exportSubscribers,
  createCampaign, listCampaigns, sendNowById, scheduleById
} from "../controllers/newsletter.controller.js";

const router = Router();

// Public: subscribe
router.post("/subscribe", subscribe);

// Admin: subscribers
router.get("/subscribers", listSubscribers);
router.get("/subscribers/export", exportSubscribers);

// Admin: campaigns
router.get("/campaigns", listCampaigns);
router.post("/campaigns", createCampaign);
router.post("/campaigns/:id/send-now", sendNowById);
router.patch("/campaigns/:id/schedule", scheduleById);

export default router;
