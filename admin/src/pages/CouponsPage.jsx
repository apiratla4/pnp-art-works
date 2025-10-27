import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  TicketPercent,
  RefreshCw,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  X,
  Plus,
  Search,
  TrendingUp,
  Users,
  Percent,
  Calendar,
  Tag,
} from "lucide-react";
import "./CouponsPage.css";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Editor modal state
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({
    code: "",
    percent: 10,
    maxUses: 0,
    expiresAt: "",
    active: true,
  });

  const disabled = !code.trim() || percent <= 0 || percent > 100;

  // Statistics
  const stats = useMemo(() => {
    const total = list.length;
    const active = list.filter((c) => c.active).length;
    const totalUses = list.reduce((sum, c) => sum + (c.uses || 0), 0);
    const avgDiscount =
      total > 0
        ? (list.reduce((sum, c) => sum + (c.percent || 0), 0) / total).toFixed(
            1
          )
        : 0;
    return { total, active, totalUses, avgDiscount };
  }, [list]);

  // Filtered coupons
  const filteredList = useMemo(() => {
    if (!searchTerm) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter((c) => c.code?.toLowerCase().includes(lower));
  }, [list, searchTerm]);

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

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (disabled) return;
    try {
      setLoading(true);
      const payload = {
        code: code.trim().toUpperCase(),
        percent,
        maxUses: Number(maxUses) || 0,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };
      const { data } = await axios.post(LIST_URL, payload, {
        withCredentials: true,
      });
      toast.success(`Coupon ${data?.code} created successfully`);
      setCode("");
      setPercent(10);
      setMaxUses(0);
      setExpiresAt("");
      setShowCreateModal(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, next) => {
    try {
      await axios.patch(
        `${LIST_URL}/${id}/status`,
        { active: next },
        { withCredentials: true }
      );
      toast.success(`Coupon ${next ? "activated" : "deactivated"}`);
      load();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this coupon permanently?")) return;
    try {
      await axios.delete(`${LIST_URL}/${id}`, { withCredentials: true });
      toast.success("Coupon deleted successfully");
      load();
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const openEdit = (c) => {
    setEditing(c);
    setEditData({
      code: c.code || "",
      percent: c.percent || 10,
      maxUses: c.maxUses || 0,
      expiresAt: c.expiresAt
        ? new Date(c.expiresAt).toISOString().slice(0, 16)
        : "",
      active: !!c.active,
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${LIST_URL}/${editing._id}`,
        {
          code: editData.code.trim().toUpperCase(),
          percent: Number(editData.percent),
          maxUses: Number(editData.maxUses) || 0,
          expiresAt: editData.expiresAt
            ? new Date(editData.expiresAt).toISOString()
            : null,
          active: !!editData.active,
        },
        { withCredentials: true }
      );
      toast.success("Coupon updated successfully");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update coupon");
    }
  };

  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div className="coupons-page">
      {/* Header */}
      <div className="coupons-header">
        <div className="coupons-header-content">
          <div className="coupons-title-section">
            <h1 className="coupons-title">Discount Coupons</h1>
            <p className="coupons-subtitle">
              Create and manage promotional discount codes
            </p>
          </div>
          <div className="coupons-actions">
            <button
              className="btn-icon-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} />
              <span>New Coupon</span>
            </button>
            <button
              className="btn-icon-secondary"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              <span className="hide-mobile">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">
              <Tag size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Coupons</p>
              <h3 className="stat-value">{stats.total}</h3>
            </div>
          </div>

          <div className="stat-card stat-card-green">
            <div className="stat-icon">
              <Power size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Active Coupons</p>
              <h3 className="stat-value">{stats.active}</h3>
            </div>
          </div>

          <div className="stat-card stat-card-blue">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Uses</p>
              <h3 className="stat-value">{stats.totalUses}</h3>
            </div>
          </div>

          <div className="stat-card stat-card-orange">
            <div className="stat-icon">
              <Percent size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Avg Discount</p>
              <h3 className="stat-value">{stats.avgDiscount}%</h3>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-toolbar">
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search coupon codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Coupons Grid - Desktop */}
      <div className="coupons-grid desktop-only">
        {loading ? (
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <span>Loading coupons...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="empty-card">
            <TicketPercent size={64} className="empty-icon" />
            <p className="empty-text">No coupons found</p>
            <p className="empty-subtext">
              {searchTerm
                ? "Try adjusting your search"
                : "Create your first discount coupon"}
            </p>
            {!searchTerm && (
              <button
                className="btn-create-empty"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={18} />
                Create Coupon
              </button>
            )}
          </div>
        ) : (
          filteredList.map((c) => {
            const expired = isExpired(c.expiresAt);
            const usagePercent =
              c.maxUses > 0 ? ((c.uses || 0) / c.maxUses) * 100 : 0;

            return (
              <div
                key={c._id}
                className={`coupon-card ${!c.active || expired ? "inactive" : ""}`}
              >
                <div className="coupon-card-header">
                  <div className="coupon-code-section">
                    <TicketPercent size={20} className="coupon-icon" />
                    <div>
                      <h3 className="coupon-code">{c.code}</h3>
                      <p className="coupon-discount">{c.percent}% OFF</p>
                    </div>
                  </div>
                  <div className="coupon-status-badges">
                    {expired && (
                      <span className="status-badge status-expired">
                        Expired
                      </span>
                    )}
                    <span
                      className={`status-badge ${c.active ? "status-active" : "status-inactive"}`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="coupon-card-body">
                  <div className="coupon-info-row">
                    <Users size={16} className="info-icon" />
                    <span className="info-label">Uses</span>
                    <span className="info-value">
                      {c.uses || 0} / {c.maxUses === 0 ? "∞" : c.maxUses}
                    </span>
                  </div>

                  {c.maxUses > 0 && (
                    <div className="usage-progress">
                      <div
                        className="usage-progress-bar"
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                  )}

                  <div className="coupon-info-row">
                    <Calendar size={16} className="info-icon" />
                    <span className="info-label">Expires</span>
                    <span className="info-value">
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Never"}
                    </span>
                  </div>
                </div>

                <div className="coupon-card-footer">
                  <button
                    className="btn-coupon-action btn-edit"
                    onClick={() => openEdit(c)}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  {c.active ? (
                    <button
                      className="btn-coupon-action btn-deactivate"
                      onClick={() => toggleActive(c._id, false)}
                      title="Deactivate"
                    >
                      <PowerOff size={16} />
                    </button>
                  ) : (
                    <button
                      className="btn-coupon-action btn-activate"
                      onClick={() => toggleActive(c._id, true)}
                      title="Activate"
                    >
                      <Power size={16} />
                    </button>
                  )}
                  <button
                    className="btn-coupon-action btn-delete"
                    onClick={() => del(c._id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Coupons List - Mobile */}
      <div className="coupons-mobile mobile-only">
        {loading ? (
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <span>Loading coupons...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="empty-card">
            <TicketPercent size={64} className="empty-icon" />
            <p className="empty-text">No coupons found</p>
            <p className="empty-subtext">
              {searchTerm
                ? "Try adjusting your search"
                : "Create your first coupon"}
            </p>
            {!searchTerm && (
              <button
                className="btn-create-empty"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={18} />
                Create Coupon
              </button>
            )}
          </div>
        ) : (
          filteredList.map((c) => {
            const expired = isExpired(c.expiresAt);
            const usagePercent =
              c.maxUses > 0 ? ((c.uses || 0) / c.maxUses) * 100 : 0;

            return (
              <div
                key={c._id}
                className={`mobile-coupon-card ${!c.active || expired ? "inactive" : ""}`}
              >
                <div className="mobile-coupon-header">
                  <div className="mobile-coupon-title">
                    <TicketPercent size={18} />
                    <h3>{c.code}</h3>
                  </div>
                  <div className="mobile-coupon-badges">
                    {expired && (
                      <span className="status-badge status-expired">
                        Expired
                      </span>
                    )}
                    <span
                      className={`status-badge ${c.active ? "status-active" : "status-inactive"}`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="mobile-coupon-discount">{c.percent}% OFF</div>

                <div className="mobile-coupon-info">
                  <div className="mobile-info-item">
                    <Users size={14} />
                    <span>
                      {c.uses || 0} / {c.maxUses === 0 ? "∞" : c.maxUses} uses
                    </span>
                  </div>
                  <div className="mobile-info-item">
                    <Calendar size={14} />
                    <span>
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString()
                        : "No expiry"}
                    </span>
                  </div>
                </div>

                {c.maxUses > 0 && (
                  <div className="usage-progress">
                    <div
                      className="usage-progress-bar"
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                )}

                <div className="mobile-coupon-actions">
                  <button
                    className="mobile-action-btn"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    className="mobile-action-btn"
                    onClick={() => toggleActive(c._id, !c.active)}
                  >
                    {c.active ? <PowerOff size={16} /> : <Power size={16} />}
                    {c.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="mobile-action-btn mobile-action-delete"
                    onClick={() => del(c._id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="modal-container" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Create New Coupon</h2>
                <p className="modal-subtitle">
                  Add a new discount code for customers
                </p>
              </div>
              <button
                className="btn-modal-close"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={onCreate} className="modal-content">
              <div className="form-group">
                <label className="form-label">
                  Coupon Code<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. SAVE20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
                <span className="form-hint">
                  Customers will enter this code at checkout
                </span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Discount Percent<span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="form-input"
                      value={percent}
                      onChange={(e) => setPercent(Number(e.target.value))}
                      required
                    />
                    <Percent size={18} className="input-icon-right" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Max Uses</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    placeholder="0 = unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expiration Date (Optional)</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
                <span className="form-hint">
                  Leave empty for no expiration
                </span>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={disabled || loading}
                >
                  {loading ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editing && (
        <>
          <div className="modal-overlay" onClick={() => setEditing(null)} />
          <div className="modal-container" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Edit Coupon</h2>
                <p className="modal-subtitle">Update coupon details</p>
              </div>
              <button
                className="btn-modal-close"
                onClick={() => setEditing(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveEdit} className="modal-content">
              <div className="form-group">
                <label className="form-label">
                  Coupon Code<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.code}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Discount Percent<span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="form-input"
                      value={editData.percent}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          percent: Number(e.target.value),
                        })
                      }
                      required
                    />
                    <Percent size={18} className="input-icon-right" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Max Uses</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    value={editData.maxUses}
                    onChange={(e) =>
                      setEditData({ ...editData, maxUses: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expiration Date</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={editData.expiresAt}
                  onChange={(e) =>
                    setEditData({ ...editData, expiresAt: e.target.value })
                  }
                />
              </div>

              <div className="form-check-group">
                <input
                  type="checkbox"
                  id="editActive"
                  className="form-checkbox"
                  checked={editData.active}
                  onChange={(e) =>
                    setEditData({ ...editData, active: e.target.checked })
                  }
                />
                <label htmlFor="editActive" className="form-check-label">
                  Active coupon
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
