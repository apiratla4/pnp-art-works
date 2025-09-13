// src/controllers/newsletter.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import Subscriber from "../models/Subscriber.js";
import NewsletterCampaign from "../models/NewsletterCampaign.js";
import { createTransport, renderNewsletter } from "../lib/mailer.js";
import cron from "node-cron";

const scheduledTasks = new Map(); // campaignId -> task

// Helper: (re)register cron for a campaign
export async function scheduleCampaign(c) {
  // Stop existing
  const t = scheduledTasks.get(String(c._id));
  if (t) { t.stop(); scheduledTasks.delete(String(c._id)); }

  if (c.schedule.type === "now") return; // immediate, no cron
  if (c.status !== "scheduled") return;

  let expr;
  if (c.schedule.type === "once" && c.schedule.when) {
    const dt = new Date(c.schedule.when);
    // minute hour day-of-month month day-of-week [8]
    expr = `${dt.getMinutes()} ${dt.getHours()} ${dt.getDate()} ${dt.getMonth() + 1} *`;
  } else if (c.schedule.type === "weekly" && c.schedule.weekly) {
    const [h, m] = (c.schedule.weekly.time || "09:00").split(":").map(Number);
    expr = `${m} ${h} * * ${c.schedule.weekly.dow}`;
  } else if (c.schedule.type === "monthly" && c.schedule.monthly) {
    const [h, m] = (c.schedule.monthly.time || "09:00").split(":").map(Number);
    expr = `${m} ${h} ${c.schedule.monthly.dom} * *`;
  } else if (c.schedule.type === "cron" && c.schedule.cron) {
    expr = c.schedule.cron;
  } else {
    return;
  }

  const task = cron.schedule(expr, async () => {
    await sendCampaignNow(c._id);
    if (c.schedule.type === "once") {
      // mark sent and stop one-time schedules
      await NewsletterCampaign.findByIdAndUpdate(c._id, { $set: { status: "sent", lastSentAt: new Date() } });
      task.stop();
      scheduledTasks.delete(String(c._id));
    }
  });
  scheduledTasks.set(String(c._id), task);
}

// Send to all (batched)
async function deliver(subject, html) {
  const trans = createTransport(); // pooled [2]
  const page = 250; // batch size
  let skip = 0, sent = 0, fail = 0;
  for (;;) {
    const batch = await Subscriber.find().sort({ _id: 1 }).skip(skip).limit(page).lean();
    if (!batch.length) break;
    // send individually to avoid leaking addresses
    const jobs = batch.map((s) =>
      trans.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: s.email,
        subject,
        html
      }).then(() => sent++).catch(() => fail++)
    );
    await Promise.allSettled(jobs);
    skip += page;
  }
  return { sent, fail };
}

export const subscribe = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "").toLowerCase().trim();
  if (!/.+@.+\..+/.test(email)) return res.status(400).json({ message: "Invalid email" });
  await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  res.status(201).json({ ok: true });
});

export const listSubscribers = asyncHandler(async (_req, res) => {
  const items = await Subscriber.find().sort({ createdAt: -1 }).lean();
  res.json({ items });
});

export const exportSubscribers = asyncHandler(async (_req, res) => {
  const items = await Subscriber.find().sort({ createdAt: -1 }).lean();
  const rows = ["email,createdAt", ...items.map(i => `${i.email},${i.createdAt ? new Date(i.createdAt).toISOString() : ""}`)];
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=\"subscribers.csv\"");
  res.send(rows.join("\n"));
});

async function sendCampaignNow(id) {
  const c = await NewsletterCampaign.findById(id).lean();
  if (!c) return;
  const html = renderNewsletter(c);
  const { sent, fail } = await deliver(c.subject, html);
  await NewsletterCampaign.findByIdAndUpdate(id, {
    $inc: { sentCount: sent, failCount: fail },
    $set: { lastSentAt: new Date(), status: "sent" }
  });
  return { sent, fail };
}

export const createCampaign = asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const schedule = payload.schedule || { type: "now" };
  const doc = await NewsletterCampaign.create({
    subject: payload.subject,
    headerHtml: payload.headerHtml || "",
    bodyHtml: payload.bodyHtml || "",
    footerHtml: payload.footerHtml || "",
    imageUrl: payload.imageUrl || null,
    schedule,
    status: schedule.type === "now" ? "sent" : "scheduled"
  });

  if (schedule.type === "now") {
    const result = await sendCampaignNow(doc._id);
    return res.json({ ...result, id: doc._id });
  } else {
    await scheduleCampaign(doc);
    return res.status(201).json({ id: doc._id, status: "scheduled" });
  }
});

export const listCampaigns = asyncHandler(async (_req, res) => {
  const items = await NewsletterCampaign.find().sort({ createdAt: -1 }).lean();
  res.json({ items });
});

export const sendNowById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await sendCampaignNow(id);
  res.json(result || { sent: 0, fail: 0 });
});

export const scheduleById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const schedule = req.body?.schedule;
  const updated = await NewsletterCampaign.findByIdAndUpdate(id, { $set: { schedule, status: "scheduled" } }, { new: true }).lean();
  if (!updated) return res.status(404).json({ message: "Not found" });
  await scheduleCampaign(updated);
  res.json({ id, status: "scheduled" });
});
