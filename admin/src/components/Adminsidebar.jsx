import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Package, GraduationCap, Images, Receipt, LogOut, TicketPercent, Send, Star
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

const linkBase = "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-base transition select-none border border-transparent";
const getClass = ({ isActive }) =>
  `${linkBase} ${isActive ? "bg-black text-white border-black" : "bg-transparent text-black hover:bg-white hover:border-black hover:text-black"}`;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const LOGOUT_URL = `${API_BASE}/api/auth/logout`;

const AdminSidebar = () => {
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
    <div className="flex flex-col h-full min-h-screen bg-[#f4f4f4]">
      {/* Admin header */}
      <div className="px-5 py-4 border-b border-black/20 bg-white">
        <div className="flex items-center gap-2">
          <span
            className="rounded-full flex items-center justify-center w-10 h-10 border border-black bg-white text-black font-extrabold text-lg shadow-sm"
            aria-hidden="true"
          >
            A
          </span>
          <span className="text-lg font-black">Admin</span>
        </div>
      </div>
      <nav className="flex-1 flex flex-col p-3 gap-2 overflow-y-auto">
        <div className="px-1.5 pt-1 pb-1 text-xs font-bold tracking-wide uppercase text-gray-500">Main</div>
        <NavLink to="/admin/products" className={getClass}><Package size={18} /> Products</NavLink>
        <NavLink to="/admin/classes" className={getClass}><GraduationCap size={18} /> Classes</NavLink>
        <NavLink to="/admin/gallery" className={getClass}><Images size={18} /> Gallery</NavLink>
        <NavLink to="/admin/orders" className={getClass}><Receipt size={18} /> Orders</NavLink>
        <NavLink to="/admin/store-pickup-orders" className={getClass}><Receipt size={18} />Store Orders</NavLink>
        <NavLink to="/admin/hero-sliders" className={getClass}><Images size={18} /> Hero Sliders</NavLink>
        <NavLink to="/admin/testimonials" className={getClass}><Star size={18} /> Testimonials</NavLink>
        <NavLink to="/admin/coupons" className={getClass}><TicketPercent size={18} /> Coupons</NavLink>
        <NavLink to="/admin/newsletters" className={getClass}><Send size={18} /> Newsletters</NavLink>
      </nav>
      <footer className="mt-auto w-full px-4 py-4 bg-[#f4f4f4] flex flex-col gap-3">
        <button
          type="button"
          className="btn-logout flex items-center gap-2 w-full justify-center"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
        <span className="block text-center w-full text-xs text-black/60 select-none">
          © {new Date().getFullYear()} ArtistryStudio
        </span>
        <style>{`
          .btn-logout {
            border: 1.5px solid #991b1b;
            background: #fff;
            color: #991b1b;
            border-radius: 9999px;
            padding: 10px 0;
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
    </div>
  );
};

export default AdminSidebar;
