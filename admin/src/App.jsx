// admin/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

// Layout + pages (create these files as provided earlier)
import AdminLayout from "./layout/AdminLayout.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ClassesPage from "./pages/ClassesPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import AdminRegister from "./pages/AdminRegister.jsx";
import CouponsPage from "./pages/CouponsPage.jsx";
import NewslettersPage from "./pages/NewslettersPage.jsx";

// Simple guard using sessionStorage accessToken; replace with real auth as needed
function RequireAdmin() {
  const location = useLocation();
  const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Protected admin area with nested routes and a shared layout */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="/admin/coupons" element={<CouponsPage />} />
            <Route path="/admin/newsletters" element={<NewslettersPage />} />
          </Route>
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
