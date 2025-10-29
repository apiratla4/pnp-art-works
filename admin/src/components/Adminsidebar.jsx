import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Package, GraduationCap, Images, Receipt, LogOut, TicketPercent, Send, Star, X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

const linkBase = "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-base transition select-none border border-transparent";
const getClass = ({ isActive }) =>
  `${linkBase} ${isActive ? "bg-black text-white border-black" : "bg-transparent text-black hover:bg-white hover:border-black hover:text-black"}`;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const LOGOUT_URL = `${API_BASE}/api/auth/logout`;

const AdminSidebar = ({ open, onClose }) => {
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
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/40 z-98 transition-opacity lg:hidden ${open ? "block" : "hidden"}`}
        aria-hidden={!open}
        onClick={onClose}
      />
      {/* Sidebar */}
      <aside
        className={`
          fixed z-99 top-0 left-0 w-[90vw] max-w-xs h-full bg-[#f4f4f4] shadow-2xl border-r border-black/10 flex flex-col
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:shadow-none lg:max-w-[260px]
        `}
        role="navigation"
        aria-label="Admin Sidebar"
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-black/15 bg-white shrink-0 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-full flex items-center justify-center w-11 h-11 border border-black bg-black/80 text-white font-black text-2xl shadow-sm" aria-hidden="true">
              A
            </span>
            <span className="text-xl font-black tracking-tight text-black">Admin</span>
          </div>
          {/* Close icon, only mobile */}
          <button
            className="lg:hidden block absolute right-4 top-4 text-black/70 hover:text-black transition"
            aria-label="Close sidebar"
            style={{ zIndex: 110 }}
            onClick={onClose}
            tabIndex={open ? 0 : -1}
          >
            <X size={28}/>
          </button>
        </div>
        {/* Main nav */}
        <nav className="flex-1 flex flex-col p-3 gap-1.5 overflow-y-auto min-h-0">
          <div className="px-1.5 pt-1 pb-1 text-xs font-bold tracking-wide uppercase text-gray-500">Management</div>
          <NavLink to="/admin/products" className={getClass} onClick={onClose}><Package size={20} /> Products</NavLink>
          <NavLink to="/admin/classes" className={getClass} onClick={onClose}><GraduationCap size={19} /> Classes</NavLink>
          <NavLink to="/admin/gallery" className={getClass} onClick={onClose}><Images size={19} /> Gallery</NavLink>
          <NavLink to="/admin/orders" className={getClass} onClick={onClose}><Receipt size={19} /> Orders</NavLink>
          <NavLink to="/admin/store-pickup-orders" className={getClass} onClick={onClose}><Receipt size={19} />Store Orders</NavLink>
          <NavLink to="/admin/hero-sliders" className={getClass} onClick={onClose}><Images size={19} /> Hero Sliders</NavLink>
          <NavLink to="/admin/testimonials" className={getClass} onClick={onClose}><Star size={18} /> Testimonials</NavLink>
          <NavLink to="/admin/coupons" className={getClass} onClick={onClose}><TicketPercent size={19} /> Coupons</NavLink>
          <NavLink to="/admin/newsletters" className={getClass} onClick={onClose}><Send size={18} /> Newsletters</NavLink>
        </nav>
        {/* Footer */}
        <footer className="mt-auto w-full px-6 py-5 bg-[#f4f4f4] flex flex-col gap-3 border-t border-black/15 shrink-0">
          <button
            type="button"
            className="btn-logout flex items-center gap-2 w-full justify-center"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
          <span className="block text-center w-full text-xs text-black/60 select-none mt-2">
            © {new Date().getFullYear()} ArtistryStudio
          </span>
          <style>{`
            .btn-logout {
              border: 1.5px solid #991b1b;
              background: #fff;
              color: #991b1b;
              border-radius: 9999px;
              padding: 12px 0;
              font-weight: 700;
              font-size: 1.09em;
              letter-spacing: .01em;
              transition: all .17s cubic-bezier(.6,.1,.13,1.02);
              width: 100%;
              text-align: center;
            }
            .btn-logout:hover, .btn-logout:focus {
              background: #991b1b;
              color: #fff;
              border-color: #991b1b;
            }
            .btn-logout:active { transform: scale(0.97); }
            .btn-logout:focus-visible {
              outline: none;
              box-shadow: 0 0 0 2px #991b1b, 0 0 0 4px #fff;
            }
          `}</style>
        </footer>
      </aside>
    </>
  );
};

export default AdminSidebar;
