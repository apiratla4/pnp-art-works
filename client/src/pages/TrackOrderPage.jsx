// src/pages/TrackOrderPage.jsx
import React, { useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const DEFAULT_STEPS = [
  { key: "PLACED", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" }
];
const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const cleanId = orderId.trim();

  const stepIndex = useMemo(() => {
    if (!order?.status) return -1;
    const idx = DEFAULT_STEPS.findIndex(s => s.key === order.status);
    return idx >= 0 ? idx : -1;
  }, [order]);

  const progressPct = useMemo(() => {
    if (stepIndex < 0) return 0;
    const last = DEFAULT_STEPS.length - 1;
    return Math.round((stepIndex / last) * 100);
  }, [stepIndex]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!cleanId) {
      toast.error("Please enter a valid Order ID");
      return;
    }
    setLoading(true);
    setOrder(null);
    await toast.promise(
      (async () => {
        const url = `${API_BASE}/api/orders/track?orderId=${encodeURIComponent(cleanId)}`;
        const { data } = await axios.get(url, { withCredentials: true });
        if (!data || !data.orderId) {
          const err = new Error("Order not found");
          err.code = "NOT_FOUND";
          throw err;
        }
        setOrder(data);
        return "Order found";
      })(),
      {
        loading: "Checking order…",
        success: (msg) => msg || "Loaded",
        error: (err) => err?.message || "Unable to fetch order"
      }
    ).finally(() => setLoading(false));
  };

  return (
    <div className="order-track-wrap">
      <div className="order-track-container">
        <header className="order-track-head">
          <h1>Track your order</h1>
          <p>Enter the Order ID to see live status and details</p>
        </header>
        {/* Search form */}
        <form className="order-track-form" onSubmit={onSubmit} noValidate>
          <input
            type="text"
            className="mono-inpt"
            id="orderIdInput"
            placeholder="e.g. ORD-123456"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            aria-describedby="orderIdHelp"
            inputMode="text"
            autoComplete="off"
            disabled={loading}
            style={{ maxWidth: 280 }}
          />
          <button type="submit" className="mono-btn mono-btn-accent" disabled={loading}>
            {loading ? "Loading…" : "Track"}
          </button>
        </form>
        <div id="orderIdHelp" className="order-track-help">
          Example: ORD-123456 (as in the email confirmation)
        </div>

        {!order && !loading && (
          <div className="mono-state-hint">Enter an Order ID above to see status and details</div>
        )}

        {order && (
          <section className="mono-card-wide order-detail-card">
            {/* Progress header */}
            <div className="order-progressbar-area">
              <div className="mono-pill-title">
                <span>Order <strong>#{order.orderId}</strong></span>
                <span className={`mono-pill-status st-${order.status || 'unknown'}`}>
                  {DEFAULT_STEPS.find(s => s.key === order.status)?.label || "Unknown"}
                </span>
              </div>
              <div className="mono-progressbar-wrap" role="progressbar"
                aria-label="Order progress" aria-valuemin={0} aria-valuemax={100}
                aria-valuenow={progressPct} title={`Order progress: ${progressPct}%`}
              >
                <div className="mono-progressbar-bkg" />
                <div className="mono-progressbar-bar" style={{ width: `${progressPct}%` }} />
                <div className="mono-progressbar-steps">
                  {DEFAULT_STEPS.map((s, i) => (
                    <span
                      key={s.key}
                      className={`progress-step-label ${i <= stepIndex ? "progress-done" : ""}`}
                      title={s.label}
                    >
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* Status cards */}
            <div className="mono-card-split">
              <div className="mono-card-split-inner">
                <h4>Timeline</h4>
                <div className="mono-card-list">
                  <span><b>Placed:</b> {order.placedAt || "—"}</span>
                  <span><b>Confirmed:</b> {order.confirmedAt || "—"}</span>
                  <span><b>Shipped:</b> {order.shippedAt || "—"}</span>
                  <span><b>Out for delivery:</b> {order.outForDeliveryAt || "—"}</span>
                  <span><b>Delivered:</b> {order.deliveredAt || "—"}</span>
                </div>
              </div>
              <div className="mono-card-split-inner">
                <h4>Shipping</h4>
                <div className="mono-card-list">
                  <span><b>Recipient:</b> {order?.customer?.name || "—"}</span>
                  <span><b>Phone:</b> {order?.customer?.phone || "—"}</span>
                  <span><b>Address:</b> {order?.customer?.address || "—"}</span>
                </div>
              </div>
              <div className="mono-card-split-inner">
                <h4>Payment & totals</h4>
                <div className="mono-card-list">
                  <span><b>Items:</b> {Array.isArray(order?.items) ? order.items.length : 0}</span>
                  <span><b>Subtotal:</b> {order?.subtotal != null ? fmtUSD.format(Number(order.subtotal)) : "—"}</span>
                  <span><b>Shipping:</b> {order?.shipping != null ? fmtUSD.format(Number(order.shipping)) : "—"}</span>
                  <div className="mono-total-row">
                    <b>Total:</b>
                    <span>{order?.total != null ? fmtUSD.format(Number(order.total)) : "—"}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Items */}
            <div className="mono-order-items-area">
              <h4>Items</h4>
              <div className="mono-itemlist-row">
                {(order?.items || []).map((it, idx) => (
                  <div key={idx} className="mono-itemlist-cell">
                    <img
                      src={it.image}
                      alt=""
                      width={68}
                      height={68}
                      style={{ objectFit: "cover", borderRadius: 14, border: "1.5px solid #c9c9c9" }}
                      onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mono-itemlist-title" title={it.title}>{it.title}</div>
                      <div className="mono-itemlist-meta">Qty: {it.qty}</div>
                    </div>
                    <div className="mono-itemlist-cost">
                      {it.price != null ? fmtUSD.format(Number(it.price)) : "—"}
                    </div>
                  </div>
                ))}
                {(!order?.items || order.items.length === 0) && (
                  <div style={{ color: "#8f8f8f" }}>No items found</div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Monochrome CSS */}
      <style>{`
      .order-track-wrap {
        min-height: 100vh;
        background: #f1efef;
        display: flex; align-items: flex-start; justify-content: center;
      }
      .order-track-container {
        max-width: 800px; width: 100%; margin: 0 auto; padding: 38px 0;
      }
      .order-track-head { text-align: center; margin-bottom: 24px; }
      .order-track-head h1 { font-size: 2.15rem; font-weight: 800; color: #191919; }
      .order-track-head p { color: #333; margin-top: 12px; font-size: 1.07rem; }
      .order-track-form {
        display: flex; gap: 12px; align-items: center; justify-content: center; margin-bottom: 8px;
      }
      .mono-inpt {
        border: 1.4px solid #111;
        border-radius: 14px;
        background: #fff;
        color: #181818;
        font-size: 1.10rem;
        min-width: 0; padding: 11px 15px;
        transition: border 0.13s, box-shadow 0.18s;
        outline: none;
        font-weight: 500;
      }
      .mono-inpt:focus {
        border-color: #333; box-shadow: 0 0 0 2.7px #e1e1e1;
      }
      .mono-btn {
        background: #fff; color: #1a1a1a; font-weight: 700; border: 1.8px solid #191919;
        border-radius: 12px; font-size: 1rem; padding: 10px 26px;
        transition: background .17s, color .13s, border .15s;
        cursor: pointer;
      }
      .mono-btn-accent { background: #191919; color: #fff; }
      .mono-btn-accent:hover, .mono-btn-accent:focus { filter: brightness(1.065); color: #fff; border-color: #333;}
      .order-track-help { text-align: center; color: #4e4e4e; margin-bottom: 26px; font-size: .97rem;}
      .mono-state-hint { text-align: center; margin: 34px 0 0 0; color: #767676; font-size: 1.13rem; }
      .mono-card-wide {
        background: #fff;
        border-radius: 24px;
        box-shadow: 0 4px 32px -7px #1112, 0 1.5px 8px -2px #d3d3d3;
        padding: 28px 28px 34px 28px;
        margin-bottom: 28px;
        max-width: 1020px;
      }
      .order-progressbar-area {
        display: flex; flex-direction: column; gap: 15px; align-items: flex-start; margin-bottom: 18px;
      }
      .mono-pill-title {
        display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 13px;
        font-size: 1.02em; font-weight: 600; color: #181818;
      }
      .mono-pill-status {
        display: inline-block;
        border-radius: 60px; padding: 2.5px 17px;
        font-size: 1.0em; font-weight: 700; letter-spacing: .04em; margin-left: 10px;
        background: #efefef; color: #1a1a1a; border: 1.2px solid #141414;
      }
      .mono-pill-status.st-DELIVERED { background: #111; color: #fff; border-color: #000;}
      .mono-progressbar-wrap { width: 100%; margin-top: 4px; position: relative; }
      .mono-progressbar-bkg {
        background: #ededed; border-radius: 88px; width: 100%; height: 11px; position: absolute; left: 0; top: 0;
        border: 1.2px solid #b7b7b7; z-index: 0;
      }
      .mono-progressbar-bar {
        background: #191919;
        border-radius: 88px; height: 11px;
        z-index: 1; position: relative;
        transition: width 0.35s cubic-bezier(.68,.05,.63,.95);
      }
      .mono-progressbar-steps {
        display: flex; justify-content: space-between; margin-top: 13px; position: relative; z-index: 2;
      }
      .progress-step-label {
        font-size: .98em; color: #ababab; min-width: 64px; text-align: center; font-weight: 500; transition: color .12s;
      }
      .progress-done { color: #111; font-weight: 700; }
      .mono-card-split {
        display: flex; flex-wrap: wrap; gap: 22px; margin: 22px 0 5px 0;
      }
      .mono-card-split-inner {
        flex: 1 1 250px;
        background: #f6f6f6;
        border-radius: 11px;
        padding: 16px 21px; margin-bottom: 7px;
        box-shadow: 0 2.5px 11px -7px #bbb3;
      }
      .mono-card-split-inner h4 { font-size: 1.09em; font-weight: 700; margin-bottom: 10px; color: #222; }
      .mono-card-list span { display: block; font-size: .98em; color: #242424; margin-bottom: 4px;}
      .mono-total-row { display: flex; justify-content: space-between; align-items: center; font-size: 1.12em; color: #181818; margin-top: 11px;}
      .mono-order-items-area { margin-top: 1.2em; }
      .mono-itemlist-row { display: flex; flex-wrap: wrap; gap: 15px; }
      .mono-itemlist-cell { display: flex; align-items: center; gap: 14px; background: #f8f8f8; border-radius: 11px; padding: 10px 13px; flex: 1 1 235px; min-width: 183px; }
      .mono-itemlist-title { font-weight: 600; color: #121212; font-size: 1.03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
      .mono-itemlist-meta { color: #595959; font-size: .98em; }
      .mono-itemlist-cost { font-weight: 700; color: #222; font-size: 1.11em;}
      @media (max-width: 899px) {
        .order-track-container, .mono-card-wide { padding-left: 2vw; padding-right: 2vw; }
        .mono-card-split { flex-direction: column; }
      }
      @media (max-width: 600px) {
        .mono-card-wide, .order-track-container { padding: 6vw 1vw; }
        .mono-card-split-inner { padding: 13px 7px; }
        .mono-itemlist-row { flex-direction: column; gap:8px;}
      }
      `}</style>
    </div>
  );
}
