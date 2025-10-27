// admin/src/pages/OrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Receipt, Eye, X, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import "./admin.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const ORDERS_URL = `${API_BASE}/api/orders`;

axios.defaults.withCredentials = true;

const STATUS_OPTIONS = [
  "pending",
  "paid",
  "fulfilled",
  "unfulfilled",
  "cancelled",
  "refunded",
  "failed"
];

const OrdersPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Details panel
  const [openId, setOpenId] = useState("");
  const openOrder = useMemo(() => items.find(i => (i._id || "") === openId), [items, openId]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(ORDERS_URL, { withCredentials: true });
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // PATCH status
  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.patch(`${ORDERS_URL}/${id}`, { status }, { withCredentials: true });
      setItems(prev => prev.map(o => (o._id === id ? { ...o, status: data?.status ?? status } : o)));
      toast.success(`Status updated to ${status}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    }
  };

  // Quick actions
  const markFulfilled = (id) => updateStatus(id, "fulfilled");
  const markUnfulfilled = (id) => updateStatus(id, "unfulfilled");

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="h4 fw-bold mb-0">Orders</h1>
          <small className="text-muted">Order history and status</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? "me-1 spinner-border spinner-border-sm" : "me-1"} />
            Refresh
          </button>
          {loading && <span className="text-muted small">Loading…</span>}
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          {/* Scroll on small screens only */}
          <div className="table-responsive-sm">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 56 }}>#</th>
                  <th>Customer</th>
                  <th className="d-none d-sm-table-cell">Total</th>
                  <th>Status</th>
                  <th className="d-none d-md-table-cell">Date</th>
                  <th style={{ width: 220 }} className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => {
                  const id = o._id || "";
                  const short = (o.orderNo || id || "").toString().slice(-6);
                  const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString() : "-";
                  const totalStr = `$${Number(o.total || 0).toFixed(2)}`;
                  return (
                    <tr key={id}>
                      <td>{short}</td>
                      <td>{o.customer?.name || o.customerName || "-"}</td>
                      <td className="d-none d-sm-table-cell">{totalStr}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge ${
                            o.status === "paid" ? "bg-success-subtle text-success" :
                            o.status === "pending" ? "bg-warning-subtle text-warning" :
                            o.status === "fulfilled" ? "bg-primary-subtle text-primary" :
                            o.status === "unfulfilled" ? "bg-secondary-subtle text-secondary" :
                            o.status === "cancelled" ? "bg-danger-subtle text-danger" :
                            o.status === "refunded" ? "bg-info-subtle text-info" :
                            "bg-secondary-subtle text-secondary"
                          }`}>
                            {o.status || "unknown"}
                          </span>
                          <select
                            className="form-select form-select-sm w-auto"
                            value={o.status || "pending"}
                            onChange={(e) => updateStatus(id, e.target.value)}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="d-none d-md-table-cell">{dateStr}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-secondary" title="View details" onClick={() => setOpenId(id)}>
                            <Eye size={16} />
                          </button>
                          <button className="btn btn-outline-success" title="Mark fulfilled" onClick={() => markFulfilled(id)}>
                            <CheckCircle2 size={16} />
                          </button>
                          <button className="btn btn-outline-secondary" title="Mark unfulfilled" onClick={() => markUnfulfilled(id)}>
                            <XCircle size={16} />
                          </button>
                          <button className="btn btn-outline-secondary" title="View invoice">
                            <Receipt size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && !loading && (
                  <tr><td colSpan={6} className="text-center text-muted py-4">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details panel (simple offcanvas) */}
      {openOrder && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: "rgba(0,0,0,.2)", zIndex: 1050 }}
            onClick={() => setOpenId("")}
            aria-label="Close order details overlay"
          />
          <div
            className="position-fixed top-0 end-0 bg-white shadow p-3 p-md-4"
            style={{ width: "100%", maxWidth: 520, height: "100%", zIndex: 1051, overflowY: "auto" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <div className="small text-muted">Order</div>
                <h2 className="h5 fw-semibold mb-0">{openOrder.orderNo || (openOrder._id || "").toString().slice(-6)}</h2>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setOpenId("")} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="mb-3">
              <div className="small text-muted">Customer</div>
              <div className="fw-semibold">{openOrder.customer?.name || openOrder.customerName || "-"}</div>
              <div className="text-muted small">{openOrder.customer?.email || "-"}</div>
              <div className="text-muted small">{openOrder.customer?.phone || "-"}</div>
            </div>

            <div className="mb-3">
              <div className="small text-muted">Status</div>
              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select form-select-sm w-auto"
                  value={openOrder.status || "pending"}
                  onChange={async (e) => {
                    const next = e.target.value;
                    await updateStatus(openOrder._id, next);
                  }}
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn btn-outline-success btn-sm" onClick={() => markFulfilled(openOrder._id)}>
                  <CheckCircle2 size={14} className="me-1" /> Fulfilled
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => markUnfulfilled(openOrder._id)}>
                  <XCircle size={14} className="me-1" /> Unfulfilled
                </button>
              </div>
            </div>

            <div className="mb-3">
              <div className="small text-muted">Items</div>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th className="text-end">Qty</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(openOrder.items || []).map((it, idx) => {
                      const qty = Number(it.qty || 0);
                      const price = Number(it.price || 0);
                      return (
                        <tr key={idx}>
                          <td>{it.title}</td>
                          <td className="text-end">{qty}</td>
                          <td className="text-end">${price.toFixed(2)}</td>
                          <td className="text-end">${(qty * price).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-3">
              <div className="small text-muted">Totals</div>
              <div className="d-flex flex-column gap-1 small">
                <div className="d-flex justify-content-between">
                  <span>Subtotal</span>
                  <span>${Number(openOrder.subTotal || 0).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Discounts</span>
                  <span>-${Array.isArray(openOrder.discounts) ? openOrder.discounts.reduce((s, d) => s + Number(d?.amount || 0), 0).toFixed(2) : "0.00"}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Shipping</span>
                  <span>${Number(openOrder.shipping?.amount || 0).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Tax</span>
                  <span>${Number(openOrder.tax || 0).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between fw-semibold">
                  <span>Total</span>
                  <span>${Number(openOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {openOrder.shippingAddress && (
              <div className="mb-3">
                <div className="small text-muted">Shipping address</div>
                <div className="small">
                  {openOrder.shippingAddress.firstName} {openOrder.shippingAddress.lastName}<br />
                  {openOrder.shippingAddress.address1}<br />
                  {openOrder.shippingAddress.city}, {openOrder.shippingAddress.state} {openOrder.shippingAddress.postalCode}<br />
                  {openOrder.shippingAddress.country}
                </div>
              </div>
            )}

            {openOrder.notes && (
              <div className="mb-3">
                <div className="small text-muted">Notes</div>
                <div className="small">{openOrder.notes}</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersPage;
