import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Receipt, Eye, X, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import "./admin.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const ORDERS_URL = `${API_BASE}/api/orders`;

const STATUS_OPTIONS = [
  { value: "Placed", display: "Placed" },
  { value: "Confirmed", display: "Confirmed" },
  { value: "Shipped", display: "Shipped" },
  { value: "Out for delivery", display: "Out for delivery" },
  { value: "Delivered", display: "Delivered" },
  { value: "cancelled", display: "Cancelled" },
  { value: "refunded", display: "Refunded" },
  { value: "failed", display: "Failed" },
];

const STATUS_MAP = {
  Placed: "pending",
  Confirmed: "confirmed",
  Shipped: "shipped",
  "Out for delivery": "out_for_delivery",
  Delivered: "delivered",
  cancelled: "cancelled",
  refunded: "refunded",
  failed: "failed",
};

function displayStatusText(status) {
  if (!status || status === "pending" || status === "Placed") return "Placed";
  if (status === "confirmed") return "Confirmed";
  if (status === "shipped") return "Shipped";
  if (status === "out_for_delivery") return "Out for delivery";
  if (status === "delivered") return "Delivered";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const statusPillStyle = (status) => {
  switch (displayStatusText(status)) {
    case "Delivered":
      return "bg-green-100 text-green-700";
    case "Placed":
      return "bg-yellow-100 text-yellow-800";
    case "Confirmed":
      return "bg-blue-100 text-blue-700";
    case "Shipped":
      return "bg-indigo-100 text-indigo-700";
    case "Out for delivery":
      return "bg-cyan-100 text-cyan-800";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    case "Refunded":
      return "bg-amber-100 text-amber-800";
    case "Failed":
      return "bg-red-200 text-red-900";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

const OrdersPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openId, setOpenId] = useState("");
  const openOrder = useMemo(
    () => items.find(i => (i._id || "") === openId),
    [items, openId]
  );

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

  const updateStatus = async (id, status) => {
    const backendStatus = STATUS_MAP[status] || status;
    try {
      const { data } = await axios.patch(
        `${ORDERS_URL}/${id}`,
        { status: backendStatus },
        { withCredentials: true }
      );
      setItems(prev =>
        prev.map(o =>
          o._id === id
            ? { ...o, status: data?.status ? displayStatusText(data.status) : status }
            : o
        )
      );
      toast.success(`Status updated to ${status}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    }
  };

  const markFulfilled = id => updateStatus(id, "Delivered");
  const markUnfulfilled = id => updateStatus(id, "Placed");

  return (
    <div className="max-w-7xl mx-auto w-full px-2 py-5">
      <div className="flex flex-col md:flex-row items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl font-black mb-0 text-black tracking-tight">Orders</h1>
          <div className="text-gray-600 text-sm">Order history &amp; real-time status</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1 border border-black bg-white rounded-full px-4 py-1.5 text-base font-semibold shadow-sm hover:bg-gray-100 transition"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          {loading && (
            <span className="text-gray-400 text-sm">Loading…</span>
          )}
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl shadow bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-bold text-xs tracking-wider text-gray-700">#</th>
              <th className="px-4 py-3 font-bold text-xs tracking-wider text-gray-700">Customer</th>
              <th className="px-4 py-3 font-bold text-xs tracking-wider text-gray-700 hidden md:table-cell">Total</th>
              <th className="px-4 py-3 font-bold text-xs tracking-wider text-gray-700">Status</th>
              <th className="px-4 py-3 font-bold text-xs tracking-wider text-gray-700 hidden md:table-cell">Date</th>
              <th className="px-4 py-3 font-bold text-xs tracking-wider text-gray-700 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o, idx) => {
              const id = o._id || "";
              const short = (o.orderNo || id || "").toString().slice(-6);
              const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString() : "-";
              const totalStr = `$${Number(o.total || 0).toFixed(2)}`;
              const displayStatus = displayStatusText(o.status);

              return (
                <tr
                  key={id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="pl-4 pr-1 py-3 align-top font-mono text-sm">{short}</td>
                  <td className="px-2 py-3 align-top">{o.customer?.name || o.customerName || "-"}</td>
                  <td className="px-2 py-3 align-top hidden md:table-cell">{totalStr}</td>
                  <td className="px-2 py-3 align-top">
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${statusPillStyle(displayStatus)}`}>
                      {displayStatus}
                    </span>
                    <select
                      className="ml-3 border rounded px-2 py-1 text-xs bg-white"
                      value={displayStatus}
                      onChange={e => updateStatus(id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.display}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-3 align-top hidden md:table-cell">{dateStr}</td>
                  <td className="pr-4 pl-1 py-3 align-top text-end">
                    <div className="inline-flex gap-2">
                      <button
                        className="inline-flex items-center px-3 py-1 border rounded-full font-bold bg-gray-100 hover:bg-blue-50 text-blue-600 transition"
                        title="View details" onClick={() => setOpenId(id)}>
                        <Eye size={15} />
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1 border rounded-full font-bold bg-green-50 hover:bg-green-100 text-green-800 transition"
                        title="Mark delivered" onClick={() => markFulfilled(id)}>
                        <CheckCircle2 size={15} />
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1 border rounded-full font-bold bg-yellow-50 hover:bg-yellow-100 text-yellow-700 transition"
                        title="Mark placed" onClick={() => markUnfulfilled(id)}>
                        <XCircle size={15} />
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1 border rounded-full font-bold bg-gray-50 hover:bg-gray-200 text-gray-600 transition"
                        title="View invoice" onClick={() => toast.info('Invoice view coming soon!')}>
                        <Receipt size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8 text-lg tracking-wide font-bold">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details panel (modern offcanvas) */}
      {openOrder && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setOpenId("")}
            aria-label="Close order details overlay"
          />
          <div
            className="fixed top-0 right-0 bg-white shadow-2xl z-50"
            style={{ width: "100%", maxWidth: 540, height: "100%", overflowY: "auto" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Order</div>
                <h2 className="text-xl font-black text-black mb-0">{openOrder.orderNo || (openOrder._id || "").toString().slice(-6)}</h2>
              </div>
              <button className="border rounded-full px-2 py-1 text-xl text-gray-700 hover:bg-gray-100" onClick={() => setOpenId("")} aria-label="Close">
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div className="px-5 py-3">
              <div className="mb-4">
                <div className="text-xs text-gray-400">Customer</div>
                <div className="font-bold text-black">{openOrder.customer?.name || openOrder.customerName || "-"}</div>
                <div className="text-gray-500 text-xs">{openOrder.customer?.email || "-"}</div>
                <div className="text-gray-500 text-xs">{openOrder.customer?.phone || "-"}</div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded px-2 py-1 text-xs bg-white"
                    value={displayStatusText(openOrder.status)}
                    onChange={async (e) => {
                      const next = e.target.value;
                      await updateStatus(openOrder._id, next);
                    }}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.display}</option>
                    ))}
                  </select>
                  <button className="btn btn-outline-success btn-xs" onClick={() => markFulfilled(openOrder._id)}>
                    <CheckCircle2 size={14} className="me-1" /> Delivered
                  </button>
                  <button className="btn btn-outline-secondary btn-xs" onClick={() => markUnfulfilled(openOrder._id)}>
                    <XCircle size={14} className="me-1" /> Placed
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-1">Items</div>
                <div className="table-responsive">
                  <table className="w-full text-xs border ">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-2 py-2">Title</th>
                        <th className="text-right px-2 py-2">Qty</th>
                        <th className="text-right px-2 py-2">Price</th>
                        <th className="text-right px-2 py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(openOrder.items || []).map((it, idx) => {
                        const qty = Number(it.qty ?? it.quantity ?? 0);
                        const price = Number(it.price ?? 0);
                        return (
                          <tr key={idx}>
                            <td className="px-2 py-2">{it.title}</td>
                            <td className="text-right px-2 py-2">{qty}</td>
                            <td className="text-right px-2 py-2">${price.toFixed(2)}</td>
                            <td className="text-right px-2 py-2">${(qty * price).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-1">Totals</div>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${Number(openOrder.subTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discounts</span>
                    <span>
                      -${Array.isArray(openOrder.discounts)
                        ? openOrder.discounts.reduce((s, d) => s + Number(d?.amount || 0), 0).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${Number(openOrder.shipping?.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${Number(openOrder.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${Number(openOrder.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {openOrder.shippingAddress && (
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-1">Shipping Address</div>
                  <div className="text-xs">
                    {openOrder.shippingAddress.firstName} {openOrder.shippingAddress.lastName}<br />
                    {openOrder.shippingAddress.address1}<br />
                    {openOrder.shippingAddress.city}, {openOrder.shippingAddress.state} {openOrder.shippingAddress.postalCode}<br />
                    {openOrder.shippingAddress.country}
                  </div>
                </div>
              )}

              {openOrder.notes && (
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-1">Notes</div>
                  <div className="text-xs">{openOrder.notes}</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersPage;
