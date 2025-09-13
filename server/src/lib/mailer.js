// src/lib/mailer.js
import nodemailer from "nodemailer";

export function createTransport() {
  // Pooled SMTP (best for bursts) [2]
  return nodemailer.createTransport({
    pool: true,
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Boolean(process.env.SMTP_SECURE === "true"),
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      type: process.env.SMTP_AUTH_TYPE || "login"
    } : undefined
  });
}

// Builds final HTML
export function renderNewsletter({ headerHtml = "", bodyHtml = "", footerHtml = "", imageUrl = null }) {
  const hero = imageUrl ? `<img src="${imageUrl}" alt="" style="max-width:100%;display:block;margin:16px auto;border-radius:8px" />` : "";
  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;">
    <div>${headerHtml}</div>
    ${hero}
    <div>${bodyHtml}</div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
    <div style="font-size:12px;color:#6b7280">${footerHtml}</div>
  </div>`;
}
