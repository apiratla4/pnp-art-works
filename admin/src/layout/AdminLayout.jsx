import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AdminSidebar from "../components/AdminSidebar.jsx";
import "react-toastify/dist/ReactToastify.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen min-h-0 w-screen bg-[#f5f5f7] text-black font-sans flex">
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Main content panel */}
      <div className="flex-1 flex flex-col min-h-0 h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 w-full h-14 sm:h-16 bg-white border-b border-black flex items-center px-3 sm:px-4">
          <button
            className="mr-3 p-2 rounded border border-black lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            style={{ fontSize: 23, fontWeight: "bold", background: "#fff", minWidth: 42, minHeight: 42 }}
          >
            ☰
          </button>
          <span className="block lg:hidden font-black text-[1.2rem] pl-1 select-none">Dashboard</span>
          <div className="flex-1" />
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 w-full">
          <Outlet />
        </main>
        <ToastContainer position="top-right" autoClose={2000} newestOnTop />
      </div>
      <style>{`
        .sidebar-hide-scroll {
          scrollbar-width: none;
        }
        .sidebar-hide-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
