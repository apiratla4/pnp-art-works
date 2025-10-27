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
  const [editing, setEditing] = useState(null); // coupon object or null
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

  // Actions
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
    <div className="container py-4 theme-monochrome">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h2 className="h4 d-flex align-items-center gap-2 mb-0">
          <TicketPercent size={20} /> Coupons
        </h2>
        <button
          className="mono-btn mono-btn-sm d-inline-flex align-items-center gap-2"
          onClick={load}
          disabled={loading}
          type="button"
          aria-label="Refresh"
          title="Refresh"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="row g-4">
        {/* Create form */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Create coupon</h6>
              <form onSubmit={onCreate} className="vstack gap-3">
                <div>
                  <label className="form-label">Code</label>
                  <input
                    className="form-control"
                    placeholder="e.g. ART10"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Percent off</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="form-control"
                      value={percent}
                      onChange={(e) => setPercent(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Max uses (0 = unlimited)</label>
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Expires at (optional)</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
                <button className="mono-btn" disabled={disabled || loading} type="submit">
                  {loading ? "Saving…" : "Save coupon"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">All coupons</h6>

              {list.length === 0 ? (
                <div className="small">No coupons yet</div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="d-block d-md-none vstack gap-3">
                    {list.map((c) => (
                      <div key={c._id} className="coupon-card p-3 rounded-3 border">
                        <div className="d-flex align-items-start justify-content-between gap-2">
                          <div className="min-w-0">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <span className="fw-bold text-break">{c.code}</span>
                              <span className={`mono-badge ${c.active ? "active" : ""}`}>
                                {c.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="small mt-1 text-muted">
                              {c.percent}% off • Uses {c.uses || 0}
                              {c.maxUses === 0 ? " / ∞" : ` / ${c.maxUses}`}
                            </div>
                            <div className="small mt-1">
                              Expires: {c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "—"}
                            </div>
                          </div>
                          <div className="d-flex flex-wrap gap-2 justify-content-end">
                            <button className="mono-btn mono-btn-sm" title="Edit" type="button" onClick={() => openEdit(c)}>
                              <span className="visually-hidden">Edit</span>
                              <Pencil size={16} />
                            </button>
                            {c.active ? (
                              <button className="mono-btn mono-btn-sm" title="Deactivate" type="button" onClick={() => toggleActive(c._id, false)}>
                                <span className="visually-hidden">Deactivate</span>
                                <PowerOff size={16} />
                              </button>
                            ) : (
                              <button className="mono-btn mono-btn-sm" title="Activate" type="button" onClick={() => toggleActive(c._id, true)}>
                                <span className="visually-hidden">Activate</span>
                                <Power size={16} />
                              </button>
                            )}
                            <button className="mono-btn mono-btn-sm" title="Delete" type="button" onClick={() => del(c._id)}>
                              <span className="visually-hidden">Delete</span>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="d-none d-md-block table-responsive mono-scroll">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th className="text-nowrap">Code</th>
                          <th className="text-nowrap">Percent</th>
                          <th className="text-nowrap">Uses</th>
                          <th className="text-nowrap">Max</th>
                          <th className="text-nowrap">Status</th>
                          <th className="text-nowrap">Expires</th>
                          <th className="text-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((c) => (
                          <tr key={c._id}>
                            <td className="fw-semibold text-break">{c.code}</td>
                            <td>{c.percent}%</td>
                            <td>{c.uses || 0}</td>
                            <td>{c.maxUses === 0 ? "∞" : c.maxUses}</td>
                            <td>
                              <span className={`mono-badge ${c.active ? "active" : ""}`}>
                                {c.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "—"}</td>
                            <td className="text-nowrap">
                              <div className="d-flex flex-wrap gap-2">
                                <button className="mono-btn mono-btn-sm" title="Edit" type="button" onClick={() => openEdit(c)}>
                                  <Pencil size={16} />
                                </button>
                                {c.active ? (
                                  <button className="mono-btn mono-btn-sm" title="Deactivate" type="button" onClick={() => toggleActive(c._id, false)}>
                                    <PowerOff size={16} />
                                  </button>
                                ) : (
                                  <button className="mono-btn mono-btn-sm" title="Activate" type="button" onClick={() => toggleActive(c._id, true)}>
                                    <Power size={16} />
                                  </button>
                                )}
                                <button className="mono-btn mono-btn-sm" title="Delete" type="button" onClick={() => del(c._id)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.4)" }} onClick={() => setEditing(null)}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit coupon</h5>
                <button type="button" className="mono-btn mono-btn-sm" onClick={() => setEditing(null)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={saveEdit}>
                <div className="modal-body vstack gap-3">
                  <div>
                    <label className="form-label">Code</label>
                    <input
                      className="form-control"
                      value={editData.code}
                      onChange={(e) => setEditData({ ...editData, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label">Percent</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        className="form-control"
                        value={editData.percent}
                        onChange={(e) => setEditData({ ...editData, percent: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label">Max uses</label>
                      <input
                        type="number"
                        min={0}
                        className="form-control"
                        value={editData.maxUses}
                        onChange={(e) => setEditData({ ...editData, maxUses: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Expires at</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={editData.expiresAt}
                      onChange={(e) => setEditData({ ...editData, expiresAt: e.target.value })}
                    />
                  </div>
                  <div className="form-check">
                    <input
                      id="editActive"
                      className="form-check-input"
                      type="checkbox"
                      checked={editData.active}
                      onChange={(e) => setEditData({ ...editData, active: e.target.checked })}
                    />
                    <label htmlFor="editActive" className="form-check-label">Active</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="mono-btn mono-btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                  <button type="submit" className="mono-btn mono-btn-sm">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Local monochrome + responsive helpers */}
      <style>{`
        .theme-monochrome { background-color: #f1efef; color: #000; }
        .theme-monochrome .card, .theme-monochrome .modal-content { background: #fff; color: #000; }
        .theme-monochrome .form-control, .theme-monochrome .form-select { background-color: #fff; color: #000; border-color: #ccc; }
        .theme-monochrome .form-check-input { accent-color: #000; }

        /* Inputs/selects focus in black */
        .form-control:focus, .form-select:focus { border-color: #000 !important; box-shadow: none !important; }

        /* Buttons */
        .mono-btn {
          border: 1px solid #000; background: #fff; color: #000;
          border-radius: 10px; padding: 8px 12px; font-weight: 700;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
          white-space: nowrap;
        }
        .mono-btn-sm { padding: 6px 10px; border-radius: 999px; }
        .mono-btn:hover { background: #000; color: #fff; }
        .mono-btn:active { transform: scale(0.98); }

        /* Badges */
        .mono-badge {
          display: inline-block; padding: 4px 10px; border-radius: 999px;
          border: 1px solid #000; background: #fff; color: #000; font-weight: 700;
          font-size: 0.8em; white-space: nowrap;
        }
        .mono-badge.active { background: #000; color: #fff; }

        /* Keyboard focus */
        .mono-btn:focus-visible,
        a:focus-visible,
        .form-control:focus-visible,
        .form-select:focus-visible,
        .form-check-input:focus-visible + .form-check-label {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 4px #fff;
        }
        .mono-btn:focus, a:focus, .form-control:focus, .form-select:focus { outline: 2px solid #000; outline-offset: 2px; }
        .mono-btn:focus:not(:focus-visible),
        a:focus:not(:focus-visible),
        .form-control:focus:not(:focus-visible),
        .form-select:focus:not(:focus-visible) { outline: none; box-shadow: none; }

        /* Table responsiveness helpers */
        .mono-scroll { -webkit-overflow-scrolling: touch; }
        .table td, .table th { vertical-align: middle; }

        /* Mobile coupon card */
        .coupon-card { background: #fff; }
        .coupon-card .mono-badge { font-size: 0.72rem; }

        /* Modal sizing on very small screens */
        @media (max-width: 575.98px) {
          .modal-dialog { max-width: 95vw; margin: 1rem auto; }
        }
      `}</style>
    </div>
  );
}
