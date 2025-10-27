import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Receipt, Eye, X, CheckCircle2, XCircle, RefreshCw, Search, Filter,
  Download, Calendar, DollarSign, Package, User, ChevronRight, TrendingUp
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
      const res = await axios.get(ORDERS_URL);
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.patch(`${ORDERS_URL}/${id}`, { status });
      setItems((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, status: data?.status ?? status } : o
        )
      );
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };
  const markFulfilled = (id) => updateStatus(id, "fulfilled");
  const markUnfulfilled = (id) => updateStatus(id, "unfulfilled");

  const getStatusConfig = (status) =>
    STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div className="orders-header-top">
          <div>
            <h1 className="orders-title">Orders Management</h1>
            <div className="orders-subtitle">
              Manage all customer orders here
            </div>
          </div>
          <div className="orders-actions">
            <button className="order-btn-main" onClick={load} disabled={loading}>
              <RefreshCw size={19} className={loading ? "spin" : ""} />Refresh
            </button>
            <button className="order-btn-outline">
              <Download size={18} />Export
            </button>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon stat-primary"><Package size={22} /></div><div><div className="stat-val">{stats.total}</div><div className="stat-lab">Total Orders</div></div></div>
          <div className="stat-card"><div className="stat-icon stat-green"><DollarSign size={22} /></div><div><div className="stat-val">${stats.totalRevenue.toFixed(2)}</div><div className="stat-lab">Total Revenue</div></div></div>
          <div className="stat-card"><div className="stat-icon stat-pending"><TrendingUp size={22} /></div><div><div className="stat-val">{stats.pending}</div><div className="stat-lab">Pending</div></div></div>
          <div className="stat-card"><div className="stat-icon stat-fulfilled"><CheckCircle2 size={22} /></div><div><div className="stat-val">{stats.fulfilled}</div><div className="stat-lab">Fulfilled</div></div></div>
        </div>
        <div className="orders-toolbar">
          <div className="searchbar">
            <Search size={18} className="sbicon" />
            <input
              className="sbinput"
              placeholder="Search by customer or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filterbar">
            <Filter size={17} />
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

      {/* Desktop Table */}
      <div className="orders-table-wrap desktop-only">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="ord-table-wait">Loading...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="ord-table-empty">
                  <Package size={36} /><div>No orders found</div>
                </td>
              </tr>
            ) : filteredItems.map((o) => {
              const id = o._id || "";
              const short = (o.orderNo || id || "").toString().slice(-6);
              const dateStr = o.createdAt
                ? new Date(o.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })
                : "-";
              const totalStr = `$${Number(o.total || 0).toFixed(2)}`;
              const statusConfig = getStatusConfig(o.status);
              return (
                <tr key={id}>
                  <td><span className="ord-id">#{short}</span></td>
                  <td>
                    <span className="ord-cust">
                      <User size={16} />{o.customer?.name || o.customerName || "-"}
                    </span>
                  </td>
                  <td>{totalStr}</td>
                  <td>
                    <span className={`status-badge sb-${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td>{dateStr}</td>
                  <td>
                    <div className="ord-action-row">
                      <button className="ord-btn ord-btn-view" title="View"
                        onClick={() => setOpenId(id)}><Eye size={16}/></button>
                      <button className="ord-btn ord-btn-ok" title="Fulfill"
                        onClick={() => markFulfilled(id)}><CheckCircle2 size={16}/></button>
                      <button className="ord-btn ord-btn-warn" title="Unfulfill"
                        onClick={() => markUnfulfilled(id)}><XCircle size={16}/></button>
                      <button className="ord-btn ord-btn-outline" title="Invoice"><Receipt size={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="orders-cardlist mobile-only">
        {loading ? (<div>Loading…</div>) : filteredItems.length === 0 ? (
          <div className="empty-card">
            <Package size={44}/><div>No orders</div>
          </div>
        ) : filteredItems.map((o) => {
          const id = o._id || "";
          const short = (o.orderNo || id || "").toString().slice(-6);
          const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-";
          const totalStr = `$${Number(o.total || 0).toFixed(2)}`;
          const statusConfig = getStatusConfig(o.status);
          return (
            <div className="order-card" key={id}>
              <div className="order-card-header">
                <div className="order-card-id">#{short}</div>
                <span className={`status-badge sb-${statusConfig.color}`}>{statusConfig.label}</span>
              </div>
              <div className="order-card-row"><User size={15}/>&nbsp;{o.customer?.name || o.customerName || "-"}</div>
              <div className="order-card-row"><DollarSign size={15}/>&nbsp;{totalStr}</div>
              <div className="order-card-row"><Calendar size={15}/>&nbsp;{dateStr}</div>
              <div className="order-card-actions">
                <button className="ord-btn ord-btn-view" onClick={()=>setOpenId(id)}><Eye size={15}/></button>
                <button className="ord-btn ord-btn-ok" onClick={()=>markFulfilled(id)}><CheckCircle2 size={15}/></button>
                <button className="ord-btn ord-btn-warn" onClick={()=>markUnfulfilled(id)}><XCircle size={15}/></button>
                <button className="ord-btn ord-btn-outline"><Receipt size={15}/></button>
              </div>
            </div>
          )
        })}
      </div>

      {/* RIGHT SIDE DRAWER */}
      {openOrder && (
        <>
          <div className="orders-drawer-backdrop" onClick={()=>setOpenId("")} />
          <aside className="orders-drawer">
            <header className="orders-drawer-head">
              <div>
                <div className="orders-drawer-title">
                  Order <span>#{openOrder.orderNo || (openOrder._id || "").slice(-6)}</span>
                </div>
                <div className="orders-drawer-date">
                  <Calendar size={16} style={{verticalAlign:"-2px"}} />
                  <span>
                    {openOrder.createdAt ? new Date(openOrder.createdAt).toLocaleString() : "-"}
                  </span>
                </div>
              </div>
              <button className="orders-drawer-close" onClick={()=>setOpenId("")} title="Close">
                <X size={24}/>
              </button>
            </header>
            <div className="orders-drawer-content">
              <div className="drawer-section">
                <div className="drawer-section-header">Customer</div>
                <div className="drawer-section-body">
                  <span className="drawer-user">
                    <User size={17}/> {openOrder.customer?.name || openOrder.customerName || "-"}
                  </span>
                  <div className="drawer-small">
                    {openOrder.customer?.email && <>✉ {openOrder.customer.email} <br/></>}
                    {openOrder.customer?.phone && <>📞 {openOrder.customer.phone}</>}
                  </div>
                </div>
              </div>
              <div className="drawer-section">
                <div className="drawer-section-header">Status</div>
                <div className="drawer-section-body" style={{display:'flex',alignItems:'center',gap: "1em"}}>
                  <span className={`status-badge sb-${getStatusConfig(openOrder.status).color}`}>
                    {getStatusConfig(openOrder.status).label}
                  </span>
                  <select className="orders-dstatus-dd" value={openOrder.status || "pending"}
                      onChange={e => updateStatus(openOrder._id, e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="drawer-section">
                <div className="drawer-section-header">Items</div>
                <div className="drawer-section-body">
                  <table className="drawer-items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(openOrder.items || []).map((it, idx) => {
                        const name = it.name || it.title || it.productId || "-";
                        const qty = Number(it.qty || it.quantity || 0);
                        const price = Number(it.price || 0);
                        return (
                          <tr key={idx}>
                            <td>
                              <span className="drawer-table-product">{name}</span>
                              {it.variant && <span className="drawer-table-meta">Variant: {it.variant}</span>}
                              {it.sku && <span className="drawer-table-meta">SKU: {it.sku}</span>}
                            </td>
                            <td>${price.toFixed(2)}</td>
                            <td>{qty}</td>
                            <td>${(qty * price).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="drawer-section">
                <div className="drawer-section-header">Payment Summary</div>
                <div className="orders-dsummary">
                  <div><span>Subtotal</span> <span>${Number(openOrder.totals?.subtotal || openOrder.subTotal || 0).toFixed(2)}</span></div>
                  {openOrder.discounts && openOrder.discounts.length > 0 && (
                  <div><span>Discounts</span>
                      <span>- ${openOrder.discounts.reduce((s, d) => s + Number(d?.amount || 0), 0).toFixed(2)}</span></div>
                  )}
                  <div><span>Shipping</span> <span>${Number(openOrder.totals?.shipping || openOrder.shipping?.amount || 0).toFixed(2)}</span></div>
                  <div><span>Tax</span> <span>${Number(openOrder.totals?.tax || openOrder.tax || 0).toFixed(2)}</span></div>
                  <div className="orders-dsummary-final"><span>Total</span> <span>${Number(openOrder.totals?.grandTotal || openOrder.total || 0).toFixed(2)}</span></div>
                </div>
              </div>
              {openOrder.shippingAddress &&
                <div className="drawer-section">
                  <div className="drawer-section-header">Shipping Address</div>
                  <div className="orders-dship-box">
                    <div>{openOrder.shippingAddress.fullName}</div>
                    <div>{openOrder.shippingAddress.line1}</div>
                    {openOrder.shippingAddress.line2 && <div>{openOrder.shippingAddress.line2}</div>}
                    <div>
                      {openOrder.shippingAddress.city}, {openOrder.shippingAddress.state} {openOrder.shippingAddress.postalCode}
                    </div>
                    <div>{openOrder.shippingAddress.countryCode}</div>
                  </div>
                </div>
              }
              {openOrder.notes &&
                <div className="drawer-section">
                  <div className="drawer-section-header">Notes</div>
                  <div className="orders-dnotes">{openOrder.notes}</div>
                </div>
              }
            </div>
            <div className="orders-drawer-footer">
              <button className="ord-btn ord-btn-ok" onClick={()=>markFulfilled(openOrder._id)}><CheckCircle2 size={16}/> Fulfill</button>
              <button className="ord-btn ord-btn-warn" onClick={()=>markUnfulfilled(openOrder._id)}><XCircle size={16}/> Unfulfill</button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default OrdersPage;
