// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./index.css";

// Toasts
import { Toaster } from "react-hot-toast";

// Layout
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ShopPage from "./pages/ShopPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import CustomOrderPage from "./pages/CustomOrderPage";
import SignupPage from "./pages/SignupPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProductViewPage from "./pages/ProductViewPage";
import PageNotFound from "./pages/PageNotFound";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ReturnsPage from "./pages/ReturnsPage";
import ShippingPage from "./pages/ShippingPage";
import ArtClassesPage from "./pages/ArtClassesPage";
import OrderSuccess from "./pages/OrderSuccess";
import TrackOrderPage from "./pages/TrackOrderPage";
import OrderConfirmation from "./pages/OrderConfirmation";

import { CartProvider } from "./context/CartContext";

// Utils
import ScrollToTop from "./components/ScrollToTop";
import BackToTop from "./components/BackToTop";

// Floating cart
import FallingCart from "./components/FallingCart";

// Helper rendered inside Router so useLocation works
const RouteAwareFallingCart = () => {
  const location = useLocation(); // safe inside <Router> [10]
  const showFallingCart = location.pathname === "/" || location.pathname.startsWith("/shop");
  if (!showFallingCart) return null;
  return (
    <FallingCart
      right={16}
      bottomOffset={84}
      speedFactor={2.2}
      maxStart={1.1}
      size={22}
      navigateTo="/cart"
    />
  );
};

const App = () => {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />

        {/* Sticky-footer wrapper */}
        <div className="d-flex flex-column min-vh-100"> {/* [8][17] */}
          <Header />

          <main className="flex-grow-1 pt-nav">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/category/:category" element={<ShopPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/custom-order" element={<CustomOrderPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/product-details" element={<ProductViewPage />} />
              <Route path="/art-classes" element={<ArtClassesPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/order/success" element={<OrderSuccess />} />
              <Route path="/order/confirmation" element={<OrderSuccess />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
              <Route path="/order/success-alt" element={<OrderConfirmation />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </main>

          <Footer />

          {/* Render only on "/" and "/shop..." */}
          <RouteAwareFallingCart />

          <BackToTop />
        </div>

        {/* Global toast provider */}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3000,
            style: { fontSize: 14 }
          }}
        /> {/* [3][4] */}
      </Router>
    </CartProvider>
  );
};

export default App;
