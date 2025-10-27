// admin/src/pages/OrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Receipt,
  Eye,
  X,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Package,
  User,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import "./OrdersPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const ORDERS_URL = `${API_BASE}/api/orders`;

axios.defaults.withCredentials = true;

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "warning" },
  { value: "paid", label: "Paid", color: "success" },
  { value: "fulfilled", label: "Fulfilled", color: "primary" },
  { value: "unfulfilled", label: "Unfulfilled", color: "secondary" },
  { value: "cancelled", label: "Cancelled", color: "danger" },
  { value: "refunded", label: "Refunded", color: "info" },
  { value: "failed", label: "Failed", color: "danger" },
];

const OrdersPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => {
    const total = items.length;
    const totalRevenue = items.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const pending = items.filter((o) => o.status === "pending").length;
    const fulfilled = items.filter((o) => o.status === "fulfilled").length;
    return { total, totalRevenue, pending, fulfilled };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((o) => {
      const matchesSearch =
        searchTerm === "" ||
        (o.customer?.name || o.customerName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (o.orderNo || o._id || "").toString().includes(searchTerm);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const openOrder = useMemo(
    () => items.find((i) => (i._id || "") === openId),
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

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.patch(
        `${ORDERS_URL}/${id}`,
        { status },
        { withCredentials: true }
      );
      setItems((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, status: data?.status ?? status } : o
        )
      );
      toast.success(`Status updated to ${status}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    }
  };

  const markFulfilled = (id) => updateStatus(id, "fulfilled");
  const markUnfulfilled = (id) => updateStatus(id, "unfulfilled");

  const getStatusConfig = (status) => {
    return (
      STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0]
    );
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div className="orders-header-content">
          <div className="orders-title-section">
            <h1 className="orders-title">Orders Management</h1>
            <p className="orders-subtitle">
              Track and manage all your orders in one place
            </p>
          </div>
          <div className="orders-actions">
            <button
              className="btn-icon-primary"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
            <button className="btn-icon-secondary">
              <Download size={18} />
              <span className="hide-mobile">Export</span>
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Orders</p>
              <h3 className="stat-value">{stats.total}</h3>
            </div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Revenue</p>
              <h3 className="stat-value">${stats.totalRevenue.toFixed(2)}</h3>
            </div>
          </div>

          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Pending</p>
              <h3 className="stat-value">{stats.pending}</h3>
            </div>
          </div>

          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Fulfilled</p>
              <h3 className="stat-value">{stats.fulfilled}</h3>
            </div>
          </div>
        </div>

        <div className="orders-toolbar">
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by customer name or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-wrapper">
            <Filter size={18} />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="orders-table-container desktop-only">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-row">
                  <div className="loading-spinner"></div>
                  <span>Loading orders...</span>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  <Package size={48} className="empty-icon" />
                  <p className="empty-text">No orders found</p>
                  <p className="empty-subtext">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Orders will appear here once customers place them"}
                  </p>
                </td>
              </tr>
            ) : (
              filteredItems.map((o) => {
                const id = o._id || "";
                const short = (o.orderNo || id || "").toString().slice(-6);
                const dateStr = o.createdAt
                  ? new Date(o.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "-";
                const totalStr = `$${Number(o.total || 0).toFixed(2)}`;
                const statusConfig = getStatusConfig(o.status);

                return (
                  <tr key={id} className="order-row">
                    <td>
                      <span className="order-id">#{short}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-avatar">
                          <User size={16} />
                        </div>
                        <span className="customer-name">
                          {o.customer?.name || o.customerName || "-"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="order-amount">{totalStr}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td>
                      <span className="order-date">{dateStr}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => setOpenId(id)}
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-action btn-success"
                          onClick={() => markFulfilled(id)}
                          title="Mark fulfilled"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          className="btn-action btn-secondary"
                          onClick={() => markUnfulfilled(id)}
                          title="Mark unfulfilled"
                        >
                          <XCircle size={16} />
                        </button>
                        <button className="btn-action btn-primary" title="Invoice">
                          <Receipt size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="orders-cards-container mobile-only">
        {loading ? (
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <span>Loading orders...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-card">
            <Package size={64} className="empty-icon" />
            <p className="empty-text">No orders found</p>
            <p className="empty-subtext">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Orders will appear here"}
            </p>
          </div>
        ) : (
          filteredItems.map((o) => {
            const id = o._id || "";
            const short = (o.orderNo || id || "").toString().slice(-6);
            const dateStr = o.createdAt
              ? new Date(o.createdAt).toLocaleDateString()
              : "-";
            const totalStr = `$${Number(o.total || 0).toFixed(2)}`;
            const statusConfig = getStatusConfig(o.status);

            return (
              <div key={id} className="order-card" onClick={() => setOpenId(id)}>
                <div className="order-card-header">
                  <span className="order-card-id">#{short}</span>
                  <span className={`status-badge status-${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-card-row">
                    <User size={16} className="order-card-icon" />
                    <span className="order-card-label">Customer</span>
                    <span className="order-card-value">
                      {o.customer?.name || o.customerName || "-"}
                    </span>
                  </div>

                  <div className="order-card-row">
                    <DollarSign size={16} className="order-card-icon" />
                    <span className="order-card-label">Amount</span>
                    <span className="order-card-value order-card-amount">
                      {totalStr}
                    </span>
                  </div>

                  <div className="order-card-row">
                    <Calendar size={16} className="order-card-icon" />
                    <span className="order-card-label">Date</span>
                    <span className="order-card-value">{dateStr}</span>
                  </div>
                </div>

                <div className="order-card-footer">
                  <button className="order-card-action">
                    View Details
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {openOrder && (
        <>
          <div
            className="details-overlay"
            onClick={() => setOpenId("")}
            aria-label="Close order details"
          />
          <div className="details-panel" role="dialog" aria-modal="true">
            <div className="details-header">
              <div className="details-title-section">
                <span className="details-label">Order Details</span>
                <h2 className="details-title">
                  #{openOrder.orderNo || (openOrder._id || "").slice(-6)}
                </h2>
              </div>
              <button
                className="btn-close"
                onClick={() => setOpenId("")}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="details-content">
              <div className="details-section">
                <h3 className="section-title">Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <User size={16} className="info-icon" />
                    <div>
                      <p className="info-label">Name</p>
                      <p className="info-value">
                        {openOrder.customer?.name || openOrder.customerName || "-"}
                      </p>
                    </div>
                  </div>
                  {openOrder.customer?.email && (
                    <div className="info-item">
                      <span className="info-icon">✉</span>
                      <div>
                        <p className="info-label">Email</p>
                        <p className="info-value">{openOrder.customer.email}</p>
                      </div>
                    </div>
                  )}
                  {openOrder.customer?.phone && (
                    <div className="info-item">
                      <span className="info-icon">📞</span>
                      <div>
                        <p className="info-label">Phone</p>
                        <p className="info-value">{openOrder.customer.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="details-section">
                <h3 className="section-title">Order Status</h3>
                <div className="status-controls">
                  <select
                    className="status-select"
                    value={openOrder.status || "pending"}
                    onChange={(e) => updateStatus(openOrder._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn-quick-action btn-success"
                    onClick={() => markFulfilled(openOrder._id)}
                  >
                    <CheckCircle2 size={16} />
                    Fulfill
                  </button>
                  <button
                    className="btn-quick-action btn-secondary"
                    onClick={() => markUnfulfilled(openOrder._id)}
                  >
                    <XCircle size={16} />
                    Unfulfill
                  </button>
                </div>
              </div>

              <div className="details-section">
                <h3 className="section-title">Order Items</h3>
                <div className="items-list">
                  {(openOrder.items || []).map((it, idx) => {
                    const displayName = it.name || it.title || it.productId || "-";
                    const qty = Number(it.qty || it.quantity || 0);
                    const price = Number(it.price || 0);
                    return (
                      <div key={idx} className="item-row">
                        <div className="item-info">
                          <span className="item-title">{displayName}</span>
                          {it.variant && <span className="item-meta">Variant: {it.variant}</span>}
                          <span className="item-meta">Qty: {qty} × ${price.toFixed(2)}</span>
                          {it.category && <span className="item-meta">Category: {it.category}</span>}
                          {it.sku && <span className="item-meta">SKU: {it.sku}</span>}
                        </div>
                        <span className="item-total">${(qty * price).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="details-section">
                <h3 className="section-title">Payment Summary</h3>
                <div className="totals-list">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>${Number(openOrder.totals?.subtotal || openOrder.subTotal || 0).toFixed(2)}</span>
                  </div>
                  {openOrder.discounts && openOrder.discounts.length > 0 && (
                    <div className="total-row total-discount">
                      <span>Discounts</span>
                      <span>
                        -${openOrder.discounts
                          .reduce((s, d) => s + Number(d?.amount || 0), 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="total-row">
                    <span>Shipping</span>
                    <span>${Number(openOrder.totals?.shipping || openOrder.shipping?.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax</span>
                    <span>${Number(openOrder.totals?.tax || openOrder.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="total-row total-final">
                    <span>Total</span>
                    <span>${Number(openOrder.totals?.grandTotal || openOrder.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {openOrder.shippingAddress && (
                <div className="details-section">
                  <h3 className="section-title">Shipping Address</h3>
                  <div className="address-box">
                    <p>{openOrder.shippingAddress.fullName}</p>
                    <p>{openOrder.shippingAddress.line1}</p>
                    {openOrder.shippingAddress.line2 && <p>{openOrder.shippingAddress.line2}</p>}
                    <p>
                      {openOrder.shippingAddress.city}, {openOrder.shippingAddress.state} {openOrder.shippingAddress.postalCode}
                    </p>
                    <p>{openOrder.shippingAddress.countryCode}</p>
                  </div>
                </div>
              )}

              {openOrder.notes && (
                <div className="details-section">
                  <h3 className="section-title">Notes</h3>
                  <div className="notes-box">{openOrder.notes}</div>
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
