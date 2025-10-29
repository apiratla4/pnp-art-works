import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Receipt, Eye, X, CheckCircle2, XCircle, RefreshCw, Calendar, Search } from "lucide-react";
import { toast } from "react-toastify";

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
    case "Delivered": return "bg-green-100 text-green-700";
    case "Placed": return "bg-yellow-100 text-yellow-800";
    case "Confirmed": return "bg-blue-100 text-blue-700";
    case "Shipped": return "bg-indigo-100 text-indigo-700";
    case "Out for delivery": return "bg-cyan-100 text-cyan-800";
    case "Cancelled": return "bg-red-100 text-red-700";
    case "Refunded": return "bg-amber-100 text-amber-800";
    case "Failed": return "bg-red-200 text-red-900";
    default: return "bg-gray-200 text-gray-800";
  }
};

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}
function isThisWeek(date) {
  const now = new Date();
  const target = new Date(date);
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return target >= weekStart && target < weekEnd;
}
function inRange(date, from, to) {
  const d = new Date(date);
  return (!from || d >= from) && (!to || d <= to);
}

const OrdersPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState("");
  const openOrder = useMemo(() => items.find(i => (i._id || "") === openId), [items, openId]);

  const [dateFilter, setDateFilter] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(ORDERS_URL, { withCredentials: true });
      const arr = Array.isArray(res.data?.items) ? res.data.items.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
      setItems(arr);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredItems = useMemo(() => {
    let filtered = items;
    if (dateFilter === "today") {
      filtered = filtered.filter(o => o.createdAt && isSameDay(new Date(o.createdAt), new Date()));
    }
    if (dateFilter === "week") {
      filtered = filtered.filter(o => o.createdAt && isThisWeek(new Date(o.createdAt)));
    }
    if (dateFilter === "custom") {
      const from = customFrom ? new Date(customFrom) : null;
      const to = customTo ? new Date(customTo) : null;
      filtered = filtered.filter(o => o.createdAt && inRange(new Date(o.createdAt), from, to));
    }
    return filtered.slice(0, 10);
  }, [items, dateFilter, customFrom, customTo]);

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
    <div className="max-w-7xl mx-auto w-full px-2 py-5 h-full min-h-0 flex flex-col">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-3 gap-3">
        <div>
          <h1 className="text-2xl font-black mb-0 text-black tracking-tight">Orders</h1>
          <div className="text-gray-600 text-sm">Latest 10 orders, date filtering, realtime status</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className={`btn-mono-sm px-4 ${dateFilter === "today" && "bg-black text-white"}`} onClick={() => setDateFilter("today")}>
            <Calendar size={16} className="inline me-1" /> Today
          </button>
          <button className={`btn-mono-sm px-4 ${dateFilter === "week" && "bg-black text-white"}`} onClick={() => setDateFilter("week")}>
            <Calendar size={16} className="inline me-1" /> This Week
          </button>
          <button className={`btn-mono-sm px-4 ${dateFilter === "custom" && "bg-black text-white"}`} onClick={() => setDateFilter("custom")}>
            <Calendar size={16} className="inline me-1" /> Custom
          </button>
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
      {dateFilter === "custom" && (
        <div className="flex items-center gap-3 mb-5">
          <span>From:</span>
          <input type="date" className="border px-2 py-1 rounded" value={customFrom}
            onChange={e => setCustomFrom(e.target.value)} />
          <span>To:</span>
          <input type="date" className="border px-2 py-1 rounded" value={customTo}
            onChange={e => setCustomTo(e.target.value)} />
          <button className="btn-mono-sm" onClick={load} title="Reload orders">
            <Search size={15} />
            Search
          </button>
        </div>
      )}
      {/* Card list UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 flex-1 min-h-0">
        {filteredItems.length === 0 && !loading && (
          <div className="col-span-full text-center text-gray-400 py-10 text-lg font-bold tracking-wide">
            No orders found for period.
          </div>
        )}
        {filteredItems.map(o => {
          const id = o._id;
          const short = (o.orderNo || id || "").toString().slice(-6);
          const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString() : "-";
          const totalStr = `$${Number(o.total || 0).toFixed(2)}`;
          const displayStatus = displayStatusText(o.status);
          return (
            <div key={id} className="rounded-2xl shadow bg-white border border-black/10 p-6 flex flex-col gap-1 relative hover:shadow-lg transition">
              {/* Top row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">{short}</span>
                  <span className={`font-semibold px-3 py-1.5 rounded-full text-xs capitalize ${statusPillStyle(displayStatus)}`}>
                    {displayStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-mono-sm" title="View" onClick={() => setOpenId(id)}><Eye size={18}/></button>
                  <button className="btn-mono-sm" title="Mark Delivered" onClick={() => markFulfilled(id)}><CheckCircle2 size={18}/></button>
                  <button className="btn-mono-sm" title="Mark Placed" onClick={() => markUnfulfilled(id)}><XCircle size={18}/></button>
                </div>
              </div>
              <div className="font-bold text-lg mb-0 text-black">{o.customer?.name || o.customerName || "-"}</div>
              <div className="text-xs text-gray-500 mb-0.5">{dateStr}</div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-black text-sm font-bold">{totalStr}</div>
                <div className="flex gap-2">
                  <select
                    className="border border-black rounded px-3 py-1 text-sm bg-white focus:ring-2 focus:ring-black font-semibold"
                    value={displayStatus}
                    onChange={e => updateStatus(id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.display}</option>
                    ))}
                  </select>
                  <button
                    className="btn-mono-sm"
                    onClick={() => toast.info('Invoice view coming soon!')}
                    title="View invoice"
                  ><Receipt size={18}/></button>
                </div>
              </div>
              <div className="text-xs text-gray-600 line-clamp-1">{Array.isArray(o.items) ? o.items.map(i => i.title).join(", ") : ""}</div>
            </div>
          );
        })}
      </div>
      {/* Offcanvas details panel */}
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
                  <button className="btn-mono-sm" onClick={() => markFulfilled(openOrder._id)}>
                    <CheckCircle2 size={14} className="me-1" /> Delivered
                  </button>
                  <button className="btn-mono-sm" onClick={() => markUnfulfilled(openOrder._id)}>
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
      <style>{`
        .btn-mono-sm {
          border: 1.5px solid #000;
          background: #fff;
          color: #000;
          border-radius: 9999px;
          padding: 7px 16px;
          font-weight: 700;
          font-size: 1.09em;
          transition: all .16s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-mono-sm:hover, .btn-mono-sm:focus {
          background: #000;
          color: #fff;
        }
        .btn-mono-sm:active { transform: scale(0.97); }
        .btn-mono-sm:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default OrdersPage;
