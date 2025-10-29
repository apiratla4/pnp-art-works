import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const PICKUP_URL = `${API_BASE}/api/store-pickup-orders`;

const StorePickupOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(PICKUP_URL);
      setOrders(Array.isArray(data?.items) ? data.items : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black">Store Pickup Orders</h1>
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-3 text-left">#</th>
              <th className="py-3 px-3 text-left">Customer</th>
              <th className="py-3 px-3 text-left">Phone</th>
              <th className="py-3 px-3 text-left">Email</th>
              <th className="py-3 px-3 text-left">Items</th>
              <th className="py-3 px-3 text-right">Total</th>
              <th className="py-3 px-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr key={o._id} className="hover:bg-gray-50">
                <td className="px-3 py-4">{idx + 1}</td>
                <td className="px-3 py-4 font-semibold">{o.fullName}</td>
                <td className="px-3 py-4">{o.phone}</td>
                <td className="px-3 py-4">{o.email}</td>
                <td className="px-3 py-4">
                  <ul className="text-xs">
                    {o.items.map((it, i) =>
                      <li key={i}>
                        <span className="font-medium">{it.name}</span> × {it.qty}
                        {it.variant && <span> [{it.variant}]</span>}
                        — <span className="text-gray-600">${Number(it.price).toFixed(2)}</span>
                      </li>
                    )}
                  </ul>
                </td>
                <td className="px-3 py-4 text-right font-bold">${Number(o.total).toFixed(2)}</td>
                <td className="px-3 py-4">{o.status}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">No store pickup orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StorePickupOrdersPage;
