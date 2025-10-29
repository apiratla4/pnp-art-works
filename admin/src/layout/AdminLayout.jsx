import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AdminSidebar from "../components/Adminsidebar.jsx";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/pnplogo.png";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f5f5f7] text-black font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 border-r border-black bg-white z-10">
        <AdminSidebar />
      </aside>

      {/* Mobile: overlay + sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 transition"
          onClick={() => setSidebarOpen(false)}
          aria-hidden={!sidebarOpen}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-screen w-60 bg-white border-r border-black z-50 transform transition-transform duration-200 lg:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Admin sidebar mobile"
        aria-hidden={!sidebarOpen}
      >
        <div className="flex justify-end p-2 border-b border-black/10">
          <button
            className="btn-mono-sm text-xl"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >×</button>
        </div>
        <AdminSidebar />
      </aside>

      {/* Main Content Panel */}
      <div className="flex-1 flex flex-col min-w-0 w-0">
        {/* Topbar */}
        <div className="flex items-center px-4 py-3 bg-white border-b border-black w-full sticky top-0 z-20">
          {/* Hamburger only on < lg */}
          <button
            className="btn-mono-sm mr-2 block lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            type="button"
          >
            ☰
          </button>
          <div className="flex-1" />
          <img src={logo} alt="Logo" className="h-8 w-auto block lg:hidden" />
        </div>
        {/* Content */}
        <main className="w-full flex-1 px-2 xs:px-2 sm:px-4 lg:px-8 py-6 transition-all">
          <Outlet />
        </main>
        <ToastContainer position="top-right" autoClose={2000} newestOnTop />
      </div>
      <style>{`
        .btn-mono-sm {
          border: 1.5px solid #000;
          background: #fff;
          color: #000;
          border-radius: 9999px;
          padding: 7px 16px;
          font-weight: 700;
          font-size: 1.12em;
          transition: all .16s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-mono-sm:hover, .btn-mono-sm:focus {
          background: #000;
          color: #fff;
        }
        .btn-mono-sm:active { transform: scale(0.97); }
        .btn-mono-sm:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
