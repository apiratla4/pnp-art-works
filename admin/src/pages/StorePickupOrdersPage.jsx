import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const PICKUP_URL = `${API_BASE}/api/store-pickup-orders`;

const STATUS_OPTIONS = ["Pending", "Fulfilled", "Cancelled"];
const PAGE_SIZE = 10;

function isSameDay(a, b) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}
function isThisWeek(d) {
  const now = new Date();
  const dt = new Date(d);
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return dt >= weekStart && dt < weekEnd;
}
function inRange(d, from, to) {
  const x = new Date(d);
  return (!from || x >= from) && (!to || x <= to);
}

const StorePickupOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(PICKUP_URL);
      setOrders(Array.isArray(data?.items) ? data.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (filter === "today") {
      filtered = filtered.filter(o => o.createdAt && isSameDay(new Date(o.createdAt), new Date()));
    } else if (filter === "week") {
      filtered = filtered.filter(o => o.createdAt && isThisWeek(new Date(o.createdAt)));
    } else if (filter === "custom") {
      const from = customFrom ? new Date(customFrom) : null;
      const to = customTo ? new Date(customTo) : null;
      filtered = filtered.filter(o => o.createdAt && inRange(new Date(o.createdAt), from, to));
    }
    return filtered;
  }, [orders, filter, customFrom, customTo]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  const pageCount = Math.ceil(filteredOrders.length / PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filter, customFrom, customTo, orders.length]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${PICKUP_URL}/${orderId}`, { status: newStatus });
      setOrders(orders => orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await axios.delete(`${PICKUP_URL}/${orderId}`);
      setOrders(orders => orders.filter(o => o._id !== orderId));
      toast.success("Order deleted");
    } catch {
      toast.error("Failed to delete order.");
    }
  };

  const statusStyle = (status) =>
    status === "Fulfilled"
      ? "inline-block px-3 py-1 rounded-full border border-black font-bold text-xs bg-black text-white"
      : "inline-block px-3 py-1 rounded-full border border-black font-bold text-xs bg-white text-black";

  return (
    <div className="max-w-5xl mx-auto p-4">
      <ToastContainer position="top-right" autoClose={2300} hideProgressBar />
      <h1 className="text-2xl font-black mb-5 text-black">Store Pickup Orders</h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center mb-7">
        <button className={`btn-mono-sm ${filter==="today" ? "bg-black text-white" : ""}`} onClick={() => setFilter("today")}>Today</button>
        <button className={`btn-mono-sm ${filter==="week" ? "bg-black text-white" : ""}`} onClick={() => setFilter("week")}>Week</button>
        <button className={`btn-mono-sm ${filter==="custom" ? "bg-black text-white" : ""}`} onClick={() => setFilter("custom")}>Custom</button>
        {filter==="custom" && (
          <>
            <input type="date" value={customFrom} className="border px-2 rounded mx-1"
              onChange={e => setCustomFrom(e.target.value)} />
            <span className="mx-1">to</span>
            <input type="date" value={customTo} className="border px-2 rounded mx-1"
              onChange={e => setCustomTo(e.target.value)} />
          </>
        )}
        <button className="btn-mono-sm" onClick={load} disabled={loading}>Reload</button>
      </div>
      {/* Order Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {paginatedOrders.length === 0 && (
          <div className="text-center text-gray-400 py-20 col-span-full text-lg font-semibold">No store pickup orders found.</div>
        )}
        {paginatedOrders.map((o, idx) => (
          <div
            key={o._id}
            className="flex flex-col gap-3 bg-white border border-black rounded-2xl shadow-sm px-6 py-5 transition hover:shadow-lg relative"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-xl font-black tracking-wide">
                #{((page-1)*PAGE_SIZE) + idx + 1}
              </div>
              <button className="modern-icon-btn" onClick={() => deleteOrder(o._id)} title="Delete"><Trash2 size={18}/></button>
            </div>
            <div>
              <div className="font-bold text-lg mb-0.5">{o.fullName}</div>
              <div className="text-sm text-black font-mono">{o.phone}</div>
              <div className="text-xs text-gray-700">{o.email}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div>
                <span className="font-bold text-xs">Items:</span>
                <ul className="text-xs list-disc pl-4">
                  {o.items.map((it, i) =>
                    <li key={i} className="">
                      <span className="font-medium">{it.name}</span> × {it.qty}
                      {it.variant && <span> [{it.variant}]</span>}
                      {" — "}
                      <span className="font-mono">${Number(it.price).toFixed(2)}</span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="ml-auto text-right whitespace-nowrap pl-4">
                <div className="font-bold text-2xl text-black">${Number(o.total).toFixed(2)}</div>
              </div>
            </div>
            {/* Status Changer */}
            <div className="flex gap-2 items-center mt-3">
              <select
                className="rounded-full border px-3 py-1 font-bold text-xs bg-white text-black border-black focus:ring-2 focus:ring-black"
                value={o.status}
                onChange={e => updateStatus(o._id, e.target.value)}
              >
                {STATUS_OPTIONS.map(opt =>
                  <option key={opt} value={opt}>{opt}</option>
                )}
              </select>
              <span className={statusStyle(o.status)}>
                {o.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination controls */}
      {pageCount > 1 && (
        <div className="flex gap-2 justify-center items-center mt-7">
          <button className="btn-mono-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Prev</button>
          {[...Array(pageCount)].map((_, idx) => (
            <button
              key={idx+1}
              className={`btn-mono-sm px-3 ${page === idx+1 ? "bg-black text-white" : ""}`}
              onClick={() => setPage(idx+1)}
              style={{ minWidth: 36 }}
            >{idx+1}</button>
          ))}
          <button className="btn-mono-sm" onClick={() => setPage(p => Math.min(pageCount, p+1))} disabled={page === pageCount}>Next</button>
        </div>
      )}
      <style>{`
        .btn-mono-sm {
          border: 1.5px solid #000;
          background: #fff;
          color: #000;
          border-radius: 9999px;
          padding: 7px 18px;
          font-weight: 700;
          font-size: .99em;
          transition: all .16s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-mono-sm:hover, .btn-mono-sm:focus { background: #000; color: #fff; }
        .modern-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          color: #181818;
          border: 1.5px solid #000;
          border-radius: 9999px;
          height: 40px;
          width: 40px;
          font-weight: 700;
          transition: all 0.18s;
        }
        .modern-icon-btn:hover,.modern-icon-btn:focus { background: #000; color: #fff; }
        .shadow-sm { box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.09); }
        .hover\\:shadow-lg:hover { box-shadow: 0 6px 24px 0 rgb(0 0 0 / 0.12); }
      `}</style>
    </div>
  );
};

export default StorePickupOrdersPage;
