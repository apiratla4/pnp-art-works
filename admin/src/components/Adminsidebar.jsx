// admin/src/components/AdminSidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Package, GraduationCap, Images, Receipt, LogOut, TicketPercent, Send } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

const linkBase = "admin-link d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none";
const getClass = ({ isActive }) => `${linkBase} ${isActive ? "active" : ""}`;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const LOGOUT_URL = `${API_BASE}/api/auth/logout`;

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("accessToken");
      await axios.post(LOGOUT_URL, {}, { withCredentials: true });
      toast.success("Logged out");
      setTimeout(() => navigate("/admin/login", { replace: true }), 400);
    } catch {
      toast.error("Logout failed");
      setTimeout(() => navigate("/admin/login", { replace: true }), 400);
    }
  };

  return (
    <div className="d-flex flex-column h-100" style={{ backgroundColor: "#f1efef" }}>
      {/* Header with Admin + Logout */}
      <div className="px-3 py-3 border-bottom" style={{ background: "#fff", color: "#000" }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40, background: "#fff", color: "#000", border: "1px solid #000" }}
              aria-hidden="true"
            >
              <span className="fw-bold">A</span>
            </div>
            <div className="fw-bold">Admin</div>
          </div>

          <button
            type="button"
            className="mono-btn mono-btn-sm d-inline-flex align-items-center gap-2"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-2 d-flex flex-column gap-1">
        <div className="px-3 small mb-1" style={{ color: "#000" }}>Main</div>

        <NavLink to="/admin/products" className={getClass}>
          <Package size={18} /> <span>Products</span>
        </NavLink>
        <NavLink to="/admin/classes" className={getClass}>
          <GraduationCap size={18} /> <span>Classes</span>
        </NavLink>
        <NavLink to="/admin/gallery" className={getClass}>
          <Images size={18} /> <span>Gallery</span>
        </NavLink>
        <NavLink to="/admin/orders" className={getClass}>
          <Receipt size={18} /> <span>Orders</span>
        </NavLink>

        <NavLink to="/admin/coupons" className={getClass}>
          <TicketPercent size={18} /> <span>Coupons</span>
        </NavLink>

        <NavLink to="/admin/newsletters" className={getClass}>
          <Send size={18} /> <span>Newsletters</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="mt-auto p-3 d-flex align-items-center justify-content-end" style={{ color: "#000" }}>
        <span className="small">© {new Date().getFullYear()} ArtistryStudio</span>
      </div>

      {/* Local monochrome + focus-visible */}
      <style>{`
        .admin-link {
          color: #000;
          border: 1px solid transparent;
          background: transparent;
          transition: background-color .16s ease, color .16s ease, border-color .16s ease, box-shadow .12s ease, transform .12s ease;
        }
        .admin-link:hover {
          background: #fff;
          border-color: #000;
        }
        .admin-link.active {
          background: #000;
          color: #fff !important;
          border-color: #000;
        }
        .admin-link:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        .admin-link:focus { outline: 2px solid #000; outline-offset: 2px; }

        .mono-btn {
          border: 1px solid #000;
          background: #fff;
          color: #000;
          border-radius: 10px;
          padding: 8px 12px;
          font-weight: 700;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
          white-space: nowrap;
        }
        .mono-btn:hover { background: #000; color: #fff; }
        .mono-btn:active { transform: scale(0.98); }
        .mono-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .mono-btn:focus { outline: 2px solid #000; outline-offset: 2px; }
        .mono-btn-sm { padding: 6px 10px; border-radius: 999px; }
      `}</style>
    </div>
  );
}
