import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { TicketPercent, RefreshCw, Pencil, Trash2, Power, PowerOff, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const LIST_URL = `${API_BASE}/api/coupons`;

axios.defaults.withCredentials = true;

export default function CouponsPage() {
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState(10);
  const [maxUses, setMaxUses] = useState(0);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  // editor modal state
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({ code: "", percent: 10, maxUses: 0, expiresAt: "", active: true });

  const disabled = !code.trim() || percent <= 0 || percent > 100;

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(LIST_URL, { withCredentials: true });
      setList(Array.isArray(data?.items) ? data.items : []);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (disabled) return;
    try {
      setLoading(true);
      const payload = {
        code: code.trim().toUpperCase(),
        percent,
        maxUses: Number(maxUses) || 0,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
      };
      const { data } = await axios.post(LIST_URL, payload, { withCredentials: true });
      toast.success(`Coupon ${data?.code} added`);
      setCode(""); setPercent(10); setMaxUses(0); setExpiresAt("");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add coupon");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, next) => {
    try {
      await axios.patch(`${LIST_URL}/${id}/status`, { active: next }, { withCredentials: true });
      toast.success(`Coupon ${next ? "activated" : "deactivated"}`);
      load();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await axios.delete(`${LIST_URL}/${id}`, { withCredentials: true });
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (c) => {
    setEditing(c);
    setEditData({
      code: c.code || "",
      percent: c.percent || 10,
      maxUses: c.maxUses || 0,
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : "",
      active: !!c.active
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${LIST_URL}/${editing._id}`, {
        code: editData.code.trim().toUpperCase(),
        percent: Number(editData.percent),
        maxUses: Number(editData.maxUses) || 0,
        expiresAt: editData.expiresAt ? new Date(editData.expiresAt).toISOString() : null,
        active: !!editData.active
      }, { withCredentials: true });
      toast.success("Updated");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    }
  };

  return (
    <div className="mx-auto max-w-6xl w-full p-4 text-black min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold mb-0 select-none tracking-tight">
          <TicketPercent size={23} /> Coupons
        </h2>
        <button
          className="inline-flex gap-2 items-center border border-black rounded-full px-4 py-2 font-bold text-black bg-white hover:bg-black hover:text-white transition duration-150"
          onClick={load}
          disabled={loading}
          type="button"
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create form */}
        <div className="rounded-2xl bg-white shadow-lg p-6 border border-black/10">
          <h6 className="font-black mb-4 text-lg">Create coupon</h6>
          <form onSubmit={onCreate} className="flex flex-col gap-5">
            <div>
              <label className="block font-medium mb-1">Code</label>
              <input
                className="w-full rounded-lg border border-black px-3 py-2 focus:ring-2 focus:ring-black outline-none bg-white"
                placeholder="e.g. ART10"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <label className="block font-medium mb-1">Percent off</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className="w-full rounded-lg border border-black px-3 py-2 focus:ring-2 focus:ring-black bg-white outline-none"
                  value={percent}
                  onChange={(e) => setPercent(Number(e.target.value))}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">Max uses (0 = unlimited)</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-black px-3 py-2 focus:ring-2 focus:ring-black bg-white outline-none"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Expires at (optional)</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-black px-3 py-2 focus:ring-2 focus:ring-black bg-white outline-none"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <button
              className="w-full rounded-full border border-black bg-black text-white py-2 font-black text-base hover:bg-white hover:text-black transition-all duration-150"
              disabled={disabled || loading}
              type="submit"
            >
              {loading ? "Saving…" : "Save coupon"}
            </button>
          </form>
        </div>
        {/* List */}
        <div className="rounded-2xl bg-white shadow-lg p-6 border border-black/10">
          <h6 className="font-black mb-4 text-lg">All coupons</h6>
          <div className="flex flex-col md:hidden gap-5">
            {list.length === 0 ? (
              <div className="text-sm text-gray-400">No coupons yet</div>
            ) : (
              list.map((c) => (
                <div key={c._id} className="bg-white rounded-xl border border-black/10 py-3 px-4 space-y-1 flex flex-col shadow-sm relative">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black break-all uppercase">{c.code}</span>
                        <span className={`px-2 py-1 rounded-full border font-bold text-xs ml-1 select-none ${c.active ? "bg-black text-white border-black" : "bg-white text-black border-black"}`}>
                          {c.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1 font-mono">
                        {c.percent}% off • Uses {c.uses || 0}{c.maxUses === 0 ? " / ∞" : ` / ${c.maxUses}`}
                      </div>
                      <div className="text-xs mt-1 font-mono">Expires: {c.expiresAt ? new Date(c.expiresAt).toLocaleString() : ""}</div>
                    </div>
                    <div className="flex flex-col gap-2 items-end ml-2">
                      <button className="btn-mono" title="Edit" onClick={() => openEdit(c)}>
                        <Pencil size={16} />
                      </button>
                      {c.active ? (
                        <button className="btn-mono" title="Deactivate" onClick={() => toggleActive(c._id, false)}>
                          <PowerOff size={16} />
                        </button>
                      ) : (
                        <button className="btn-mono" title="Activate" onClick={() => toggleActive(c._id, true)}>
                          <Power size={16} />
                        </button>
                      )}
                      <button className="btn-mono" title="Delete" onClick={() => del(c._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-black/10">
            {list.length === 0 ? (
              <div className="text-sm text-gray-400 px-3 py-3">No coupons yet</div>
            ) : (
              <table className="min-w-full text-base">
                <thead>
                  <tr className="border-b border-black text-sm bg-white">
                    <th className="p-2 font-black text-left">Code</th>
                    <th className="p-2 font-black text-left">Percent</th>
                    <th className="p-2 font-black text-left">Uses</th>
                    <th className="p-2 font-black text-left">Max</th>
                    <th className="p-2 font-black text-left">Status</th>
                    <th className="p-2 font-black text-left">Expires</th>
                    <th className="p-2 font-black text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c) => (
                    <tr key={c._id} className="border-b border-gray-200 last:border-0">
                      <td className="p-2 font-extrabold wrap-break-word uppercase">{c.code}</td>
                      <td className="p-2">{c.percent}%</td>
                      <td className="p-2">{c.uses || 0}</td>
                      <td className="p-2">{c.maxUses === 0 ? "∞" : c.maxUses}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full border font-bold text-xs select-none ${c.active ? "bg-black text-white border-black" : "bg-white text-black border-black"}`}>
                          {c.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-2">{c.expiresAt ? new Date(c.expiresAt).toLocaleString() : ""}</td>
                      <td className="p-2 space-x-2">
                        <button className="btn-mono" title="Edit" onClick={() => openEdit(c)}>
                          <Pencil size={16} />
                        </button>
                        {c.active ? (
                          <button className="btn-mono" title="Deactivate" onClick={() => toggleActive(c._id, false)}>
                            <PowerOff size={16} />
                          </button>
                        ) : (
                          <button className="btn-mono" title="Activate" onClick={() => toggleActive(c._id, true)}>
                            <Power size={16} />
                          </button>
                        )}
                        <button className="btn-mono" title="Delete" onClick={() => del(c._id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 px-2 py-2">
          <div className="bg-white shadow-lg rounded-2xl w-full max-w-md flex flex-col relative p-7">
            <button className="absolute top-4 right-5 text-zinc-400 hover:text-black text-xl font-bold transition focus:outline-none" onClick={() => setEditing(null)} aria-label="Close">
              <X size={26} />
            </button>
            <h3 className="text-lg sm:text-2xl font-black mb-6">Edit coupon</h3>
            <form onSubmit={saveEdit} className="flex flex-col gap-4">
              <div>
                <label className="block font-medium mb-1">Code</label>
                <input className="w-full rounded-lg border border-black px-3 py-2 focus:ring-2 focus:ring-black bg-white outline-none"
                  value={editData.code}
                  onChange={(e) => setEditData({ ...editData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <label className="block font-medium mb-1">Percent</label>
                  <input type="number" min={1} max={100}
                    className="w-full rounded-lg border border-black px-3 py-2 focus:ring-2 focus:ring-black bg-white outline-none"
                    value={editData.percent}
                    onChange={(e) => setEditData({ ...editData, percent: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-medium mb-1">Max uses</label>
                  <input type="number" min={0}
                    className="w-full rounded-lg border border-black px-3 py-2 focus:ring-2 focus:ring-black bg-white outline-none"
                    value={editData.maxUses}
                    onChange={(e) => setEditData({ ...editData, maxUses: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Expires at</label>
                <input type="datetime-local"
                  className="w-full rounded-lg border border-black px-3 py-2 focus:ring-2 focus:ring-black bg-white outline-none"
                  value={editData.expiresAt}
                  onChange={(e) => setEditData({ ...editData, expiresAt: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="editActive"
                  className="rounded border border-black focus:ring-2 focus:ring-black"
                  type="checkbox"
                  checked={editData.active}
                  onChange={(e) => setEditData({ ...editData, active: e.target.checked })}
                />
                <label htmlFor="editActive" className="font-medium">Active</label>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" className="w-1/2 rounded-full border border-black bg-white text-black py-2 font-bold hover:bg-black hover:text-white transition" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="w-1/2 rounded-full border border-black bg-black text-white py-2 font-bold hover:bg-white hover:text-black transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BUTTON STYLE - apply globally or pull to tailwind config */}
      <style>{`
        .btn-mono {
          background: #fff;
          color: #000;
          border: 1.5px solid #000;
          border-radius: 9999px;
          padding: 5px 10px;
          font-weight: 600;
          transition: all 0.14s;
        }
        .btn-mono:hover, .btn-mono:focus {
          background: #000;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
