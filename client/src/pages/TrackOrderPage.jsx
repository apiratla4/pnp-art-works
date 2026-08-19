import React, { useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const DEFAULT_STEPS = [
  { key: "pending", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" }
];

const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const cleanId = orderId.trim();

  const stepIndex = useMemo(() => {
    if (!order?.status) return -1;
    const normalizedStatus = (order.status || "").toLowerCase();
    const idx = DEFAULT_STEPS.findIndex(s => s.key === normalizedStatus);
    return idx >= 0 ? idx : 0;
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
        const url = `${API_BASE}/api/orders/ref/${encodeURIComponent(cleanId)}`;
        const { data } = await axios.get(url, { withCredentials: true });
        if (!data || !data.order) {
          const err = new Error("Order not found");
          err.code = "NOT_FOUND";
          throw err;
        }
        const order = data.order;
        setOrder({
          ...order,
          subtotal: order.totals?.subtotal ?? 0,
          shipping: order.totals?.shipping ?? 0,
          total: order.totals?.grandTotal ?? 0,
          status: (order.status || "pending").toLowerCase()
        });
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
    <div className="min-h-screen bg-[#f1efef] flex items-start justify-center">
      <div className="w-full max-w-2xl px-4 py-10 mx-auto">
        {/* HEADER */}
        <div className="text-center mb-7">
          <h1 className="font-black text-3xl md:text-4xl text-black mb-2 tracking-tight">Track your order</h1>
          <p className="text-gray-700 text-lg mb-2">Enter your Order ID to see live status and details.</p>
        </div>
        {/* SEARCH */}
        <form
          className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-3"
          onSubmit={onSubmit}
          noValidate
        >
          <input
            type="text"
            id="orderIdInput"
            placeholder="e.g. ORD-123456"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="border border-black/70 rounded-lg bg-white text-black text-lg px-4 py-3 focus:outline-none focus:border-black font-semibold shadow-sm w-full max-w-xs min-w-0"
            inputMode="text"
            autoComplete="off"
            disabled={loading}
            style={{ letterSpacing: 1 }}
          />
          <button
            type="submit"
            className="bg-black text-white rounded-lg px-6 py-3 font-bold shrink-0 transition hover:bg-gray-900 text-lg shadow"
            disabled={loading}
          >
            {loading ? "Loading…" : "Track"}
          </button>
        </form>
        <div className="text-center text-gray-500 mb-7 text-base">
          Example: <span className="font-mono px-2 py-0.5 rounded bg-gray-100">ORD-123456</span>
        </div>

        {!order && !loading && (
          <div className="text-center my-8 text-black font-medium text-lg opacity-60">
            Enter an Order ID above to see status and details.
          </div>
        )}

        {order && (
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl shadow-lg bg-white px-6 py-7 mb-9"
          >
            {/* PROGRESS HEADER */}
            <div className="mb-8">
              <div className="flex flex-col justify-between gap-2 sm:gap-0 sm:flex-row items-start sm:items-center">
                <span className="text-black font-bold text-lg">
                  Order <span className="font-mono font-black">#{order.referenceId}</span>
                </span>
                <span className={`inline-block rounded-full px-4 py-1.5 border text-base font-bold 
                  ${order.status === "delivered"
                    ? "bg-black text-white border-black"
                    : "bg-gray-100 text-black border-black/30"}`}>
                  {DEFAULT_STEPS.find(s => s.key === order.status)?.label || "Unknown"}
                </span>
              </div>
              {/* Progress bar */}
              <div className="relative mt-4 mb-2 w-full">
                <div className="h-3 rounded-full bg-gray-200 w-full" />
                <div
                  className="h-3 rounded-full bg-black absolute left-0 top-0 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
                <div className="flex justify-between absolute left-0 right-0 top-4 pointer-events-none select-none">
                  {DEFAULT_STEPS.map((s, i) => (
                    <span key={s.key}
                          className={`text-xs mt-2 whitespace-nowrap font-bold transition-colors duration-200 ${i <= stepIndex ? "text-black" : "text-gray-400"}`}>{s.label}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* ORDER DETAIL CARDS */}
            <div className="grid md:grid-cols-3 gap-5 mb-7">
              <div className="bg-gray-50 rounded-xl p-5 shadow-sm overflow-auto">
                <h4 className="text-lg font-bold mb-3 text-black">Timeline</h4>
                <div className="space-y-2 text-gray-800 text-sm leading-relaxed">
                  <div><b>Placed:</b> {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</div>
                  <div><b>Status:</b> {order.status}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 shadow-sm overflow-auto">
                <h4 className="text-lg font-bold mb-3 text-black">Shipping</h4>
                <div className="space-y-2 text-gray-800 text-sm leading-relaxed">
                  <div><b>Recipient:</b> {order.customer?.firstName} {order.customer?.lastName}</div>
                  <div><b>Phone:</b> {order.shippingAddress?.phone || ""}</div>
                  <div><b>Address:</b> {(order.shippingAddress?.line1 || "") + " " + (order.shippingAddress?.line2 || "")}, {order.shippingAddress?.city} {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 shadow-sm overflow-auto">
                <h4 className="text-lg font-bold mb-3 text-black">Payment & Totals</h4>
                <div className="space-y-2 text-gray-800 text-sm leading-relaxed">
                  <div><b>Items:</b> {Array.isArray(order.items) ? order.items.length : 0}</div>
                  <div><b>Subtotal:</b> {order?.subtotal != null ? fmtUSD.format(Number(order.subtotal)) : ""}</div>
                  <div><b>Shipping:</b> {order?.shipping != null ? fmtUSD.format(Number(order.shipping)) : ""}</div>
                  <div className="flex items-center gap-1">
                    <b>Total:</b>
                    <span className="text-lg font-black ml-1">{order?.total != null ? fmtUSD.format(Number(order.total)) : ""}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* ITEMS */}
            <div>
              <h4 className="text-lg font-bold mb-3 text-black">Items</h4>
              <div className="flex flex-col gap-3">
                {(order?.items || []).map((it, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-3">
                    <img
                      src={it.image}
                      alt=""
                      width={68}
                      height={68}
                      style={{ objectFit: "cover" }}
                      className="rounded-xl border border-gray-300 bg-white shrink-0"
                      onError={e => (e.currentTarget.style.visibility = "hidden")}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate text-black" title={it.title}>{it.title}</div>
                      <div className="text-gray-600 text-sm">Qty: {it.qty || it.quantity || it.qtyOrdered || 1}</div>
                    </div>
                    <div className="font-black text-black text-lg pl-2 min-w-20 text-right">
                      {it.price != null ? fmtUSD.format(Number(it.price)) : ""}
                    </div>
                  </div>
                ))}
                {(!order?.items || order.items.length === 0) && (
                  <div className="text-gray-400 italic text-center">No items found</div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
