// src/components/DiscountPopup.jsx
import React, { useEffect, useRef, useState } from "react";

const DISMISS_KEY = "popup:lastDismissedAt";
const SUB_KEY = "popup:subscribed";
const DISMISS_COOLDOWN_DAYS = 7; // do not show again for 7 days

export default function DiscountPopup({ delayMs = 5000 }) {
  const [open, setOpen] = useState(false);
  const emailRef = useRef(null);
  const timeoutRef = useRef(null);

  // decide if popup should show
  useEffect(() => {
    try {
      const subscribed = localStorage.getItem(SUB_KEY) === "1";
      if (subscribed) return; // never show again if subscribed
      const last = Number(localStorage.getItem(DISMISS_KEY) || 0);
      const cooldownMs = DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
      const canShow = !last || Date.now() - last > cooldownMs;
      if (!canShow) return;

      // start 5s timer
      timeoutRef.current = setTimeout(() => setOpen(true), delayMs);
      return () => clearTimeout(timeoutRef.current);
    } catch {
      // if storage blocked, still attempt timed open
      timeoutRef.current = setTimeout(() => setOpen(true), delayMs);
      return () => clearTimeout(timeoutRef.current);
    }
  }, [delayMs]);

  // autofocus email when opened
  useEffect(() => {
    if (open) emailRef.current?.focus();
  }, [open]);

  const closeForNow = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setOpen(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: call newsletters API then mark subscribed
    try {
      localStorage.setItem(SUB_KEY, "1");
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="popup-overlay"
      aria-hidden="true"
      onClick={closeForNow}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        zIndex: 2000
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discountTitle"
        aria-describedby="discountDesc"
        className="popup-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          width: "min(560px, 95vw)",
          background: "#fff",
          color: "#000",
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,.25)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflow: "hidden",
          zIndex: 2001
        }}
      >
        {/* Left image */}
        <div
          style={{
            background:
              "url(https://images.pexels.com/photos/3739656/pexels-photo-3739656.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop) center/cover",
            minHeight: 280
          }}
        />

        {/* Right content */}
        <div style={{ padding: 24 }}>
          <button
            type="button"
            aria-label="Close"
            onClick={closeForNow}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 999,
              border: "1px solid #000",
              background: "#fff",
              cursor: "pointer"
            }}
          >
            ×
          </button>

          <div className="text-center">
            <div style={{ fontFamily: "serif", letterSpacing: 2, marginBottom: 8 }}>
              PNP ART STUDIO
            </div>
            <h2 id="discountTitle" className="fw-bold" style={{ fontSize: 32, marginBottom: 8 }}>
              Get 35% OFF your order
            </h2>
            <p id="discountDesc" style={{ marginBottom: 16 }}>
              Sign up and unlock an instant discount.
            </p>
          </div>

          <form onSubmit={onSubmit} className="vstack gap-2" style={{ display: "grid", gap: 12 }}>
            <input
              ref={emailRef}
              type="email"
              required
              placeholder="Email address"
              aria-label="Email address"
              className="form-control"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #000"
              }}
            />
            <button
              type="submit"
              className="btn"
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #000",
                background: "#000",
                color: "#fff",
                fontWeight: 700
              }}
            >
              Claim discount
            </button>
            <button
              type="button"
              onClick={closeForNow}
              className="btn btn-link"
              style={{
                background: "transparent",
                border: "none",
                color: "#0d6efd",
                textDecoration: "underline",
                fontWeight: 600,
                padding: 0
              }}
            >
              No, thanks
            </button>
            <small className="text-muted">
              You are signing up to receive communication via email and can unsubscribe at any time.
            </small>
          </form>
        </div>
      </div>
    </div>
  );
}
