// src/pages/TrackOrderPage.jsx
import React, { useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Steps
const DEFAULT_STEPS = [
  { key: "PLACED", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" }
];

// USD currency formatter
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
    <div className="min-vh-100" style={{ backgroundColor: "#f1efef" }}>
      <div className="container py-5">
        <header className="text-center mb-4">
          <h1 className="fw-bold" style={{ color: "#000" }}>Track your order</h1>
          <p className="mb-0" style={{ color: "#000" }}>Enter the Order ID to see live status and details</p>
        </header>

        {/* Search form */}
        <form className="row g-3 justify-content-center mb-4" onSubmit={onSubmit} noValidate>
          <div className="col-12 col-md-8">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="orderIdInput"
                placeholder="ORD-123456"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                aria-describedby="orderIdHelp"
                inputMode="text"
                autoComplete="off"
              />
              <label htmlFor="orderIdInput">Order ID</label>
            </div>
            <div id="orderIdHelp" className="form-text" style={{ color: "#000" }}>
              Example: ORD-123456 (as in the email confirmation)
            </div>
          </div>
          <div className="col-auto d-flex align-items-end">
            <button type="submit" className="mono-btn mono-btn-lg" disabled={loading}>
              {loading ? "Loading…" : "Track"}
            </button>
          </div>
        </form>

        {/* Empty state */}
        {!order && !loading && (
          <div className="text-center mt-4" style={{ color: "#000" }}>
            Enter an Order ID above to see status and details
          </div>
        )}

        {/* Results */}
        {order && (
          <section className="rounded-4 shadow-sm p-4" style={{ background: "#fff", color: "#000" }}>
            {/* Header + progress */}
            <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-lg-between gap-3 mb-4">
              <div className="text-truncate">
                <h2 className="h4 mb-1 text-truncate" style={{ color: "#000" }}>Order #{order.orderId}</h2>
                <span className="mono-badge">
                  {DEFAULT_STEPS.find(s => s.key === order.status)?.label || "Unknown"}
                </span>
              </div>

              {/* Accessible progress with label */}
              <div
                className="w-100 w-lg-50"
                role="progressbar"
                aria-label="Order progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPct}
                title={`Order progress: ${progressPct}%`}
              >
                <div className="mono-progress">
                  <div className="mono-progress-bar" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="d-flex justify-content-between mt-2 small" style={{ color: "#000" }}>
                  {DEFAULT_STEPS.map((s, i) => (
                    <span
                      key={s.key}
                      className={`text-truncate ${i <= stepIndex ? "fw-semibold" : ""}`}
                      style={{ maxWidth: i === 2 ? 110 : 92 }}
                      title={s.label}
                    >
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Status + shipping + totals */}
            <div className="row row-cols-1 row-cols-lg-3 g-4 align-items-stretch">
              <div className="col d-flex">
                <div className="card border-0 shadow-sm w-100 h-100" style={{ background: "#fff", color: "#000" }}>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title" style={{ color: "#000" }}>Timeline</h5>
                    <ul className="list-unstyled mb-0 small" style={{ color: "#000" }}>
                      <li className="mb-2"><span className="fw-semibold">Placed:</span> {order.placedAt || "—"}</li>
                      <li className="mb-2"><span className="fw-semibold">Confirmed:</span> {order.confirmedAt || "—"}</li>
                      <li className="mb-2"><span className="fw-semibold">Shipped:</span> {order.shippedAt || "—"}</li>
                      <li className="mb-2"><span className="fw-semibold">Out for delivery:</span> {order.outForDeliveryAt || "—"}</li>
                      <li><span className="fw-semibold">Delivered:</span> {order.deliveredAt || "—"}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col d-flex">
                <div className="card border-0 shadow-sm w-100 h-100" style={{ background: "#fff", color: "#000" }}>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title" style={{ color: "#000" }}>Shipping</h5>
                    <div className="small mb-1" style={{ color: "#000" }}>Recipient</div>
                    <div className="mb-2 text-truncate" style={{ color: "#000" }}>{order?.customer?.name || "—"}</div>
                    <div className="small mb-1" style={{ color: "#000" }}>Phone</div>
                    <div className="mb-2" style={{ color: "#000" }}>{order?.customer?.phone || "—"}</div>
                    <div className="small mb-1" style={{ color: "#000" }}>Address</div>
                    <div className="mb-0" style={{ color: "#000" }}>{order?.customer?.address || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="col d-flex">
                <div className="card border-0 shadow-sm w-100 h-100" style={{ background: "#fff", color: "#000" }}>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title" style={{ color: "#000" }}>Payment & totals</h5>
                    <div className="d-flex justify-content-between">
                      <span className="small" style={{ color: "#000" }}>Items</span>
                      <span style={{ color: "#000" }}>{Array.isArray(order?.items) ? order.items.length : 0}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="small" style={{ color: "#000" }}>Subtotal</span>
                      <span style={{ color: "#000" }}>{order?.subtotal != null ? fmtUSD.format(Number(order.subtotal)) : "—"}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="small" style={{ color: "#000" }}>Shipping</span>
                      <span style={{ color: "#000" }}>{order?.shipping != null ? fmtUSD.format(Number(order.shipping)) : "—"}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-semibold mt-auto">
                      <span style={{ color: "#000" }}>Total</span>
                      <span style={{ color: "#000" }}>{order?.total != null ? fmtUSD.format(Number(order.total)) : "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mt-4">
              <div className="card border-0 shadow-sm" style={{ background: "#fff", color: "#000" }}>
                <div className="card-body">
                  <h5 className="card-title mb-3" style={{ color: "#000" }}>Items</h5>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                    {(order?.items || []).map((it, idx) => (
                      <div key={idx} className="col d-flex">
                        <div className="d-flex gap-3 align-items-center p-2 rounded border w-100" style={{ borderColor: "#000" }}>
                          <img
                            src={it.image}
                            alt=""
                            width={64}
                            height={64}
                            style={{ objectFit: "cover", borderRadius: 8 }}
                            onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                          />
                          <div className="flex-grow-1">
                            <div className="fw-semibold text-truncate" title={it.title} style={{ color: "#000" }}>{it.title}</div>
                            <div className="small" style={{ color: "#000" }}>Qty: {it.qty}</div>
                          </div>
                          <div className="fw-semibold" style={{ color: "#000" }}>
                            {it.price != null ? fmtUSD.format(Number(it.price)) : "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!order?.items || order.items.length === 0) && (
                      <div className="col">
                        <div className="small" style={{ color: "#000" }}>No items found</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Local monochrome + focus-visible + inputs */}
      <style>{`
        /* Inputs focus in black */
        .form-control:focus {
          border-color: #000 !important;
          box-shadow: none !important;
        }

        /* Mono button */
        .mono-btn {
          border: 1px solid #000;
          background: #fff;
          color: #000;
          border-radius: 10px;
          padding: 10px 16px;
          font-weight: 700;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
          white-space: nowrap;
        }
        .mono-btn:hover { background: #000; color: #fff; }
        .mono-btn:active { transform: scale(0.98); }
        .mono-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .mono-btn:focus { outline: 2px solid #000; outline-offset: 2px; }
        .mono-btn-lg { padding: 12px 20px; border-radius: 999px; }

        /* Mono badge */
        .mono-badge {
          display: inline-block;
          padding: 6px 12px;
          border: 1px solid #000;
          border-radius: 999px;
          background: #fff;
          color: #000;
          font-weight: 700;
        }

        /* Mono progress */
        .mono-progress {
          width: 100%;
          height: 10px;
          background: #fff;
          border: 1px solid #000;
          border-radius: 999px;
          overflow: hidden;
        }
        .mono-progress-bar {
          height: 100%;
          background: #000;
          transition: width .25s ease;
        }

        /* Links focus ring */
        a:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        a:focus { outline: 2px solid #000; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
