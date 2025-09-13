// admin/src/layout/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Adminsidebar.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/pnplogo.png"; // Replace with your logo path

const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f1efef" }}>
      {/* Sidebar: visible on lg+, togglable drawer on < lg */}
      <aside
        id="admin-sidebar"
        className="border-end d-none d-lg-block"
        style={{ width: 260, position: "sticky", top: 0, height: "100vh", background: "#fff", color: "#000" }}
        aria-label="Admin sidebar"
      >
        <AdminSidebar />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="position-fixed top-0 start-0 h-100 w-100"
          style={{ background: "rgba(0,0,0,.2)", zIndex: 1040 }}
          onClick={() => setOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`position-fixed top-0 start-0 border-end d-lg-none ${open ? "" : "d-none"}`}
        style={{ width: 260, height: "100vh", zIndex: 1041, background: "#fff", color: "#000" }}
        aria-hidden={!open}
        aria-label="Admin sidebar drawer"
      >
        <div className="d-flex justify-content-end p-2">
          <button className="mono-btn mono-btn-sm" onClick={() => setOpen(false)} aria-label="Close sidebar">
            ×
          </button>
        </div>
        <AdminSidebar />
      </aside>

      {/* Main content */}
      <main className="flex-grow-1">
        {/* Top bar with hamburger (left) and logo (right) on mobile */}
        <div className="d-flex align-items-center px-3 py-2" style={{ background: "#fff", color: "#000", borderBottom: "1px solid #000" }}>
          <button
            className="mono-btn mono-btn-sm d-lg-none me-2"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
            aria-controls="admin-sidebar"
            aria-expanded={open}
            type="button"
          >
            ☰
          </button>

          {/* Spacer pushes logo to the right on mobile */}
          <div className="d-lg-none ms-auto">
            <img
              src={logo}
              alt="ArtistryStudio"
              height="28"
              className="d-inline-block align-middle"
            />
          </div>
        </div>

        <div className="container py-4">
          <Outlet />
        </div>
      </main>

      {/* Toasts once at layout level */}
      <ToastContainer position="top-right" autoClose={2000} newestOnTop />

      {/* Local monochrome + focus-visible styles */}
      <style>{`
        /* Mono buttons (black/white) */
        .mono-btn {
          border: 1px solid #000; background: #fff; color: #000;
          border-radius: 10px; padding: 8px 12px; font-weight: 700;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
          white-space: nowrap;
        }
        .mono-btn-sm { padding: 6px 10px; border-radius: 999px; }
        .mono-btn:hover { background: #000; color: #fff; }
        .mono-btn:active { transform: scale(0.98); }

        /* Keyboard-only focus indicator */
        .mono-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        .mono-btn:focus { outline: 2px solid #000; outline-offset: 2px; }
        .mono-btn:focus:not(:focus-visible) { outline: none; box-shadow: none; }
      `}</style>
    </div>
  );
};

export default AdminLayout;
