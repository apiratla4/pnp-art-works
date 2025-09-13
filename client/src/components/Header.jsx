// src/components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import CartDropdown from "./CartDropdown";
import "./Header.css";
import logo from "../assets/pnplogo2.svg";
import FancyButton from "./FancyButton";

const Header = () => {
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const dropdownRef = useRef(null);

  const { totalItems, dispatch } = useCart();
  const location = useLocation();

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setIsShopDropdownOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    setIsShopDropdownOpen(false);
    setIsOpen(false);
  }, [location.pathname]);

  const topCategories = [
    { label: "All Products", to: "/shop", end: true },
    { label: "Paintings", to: "/shop/category/paintings" },
    { label: "Workshops", to: "/shop/category/workshops" },
    { label: "Custom Orders", to: "/shop/category/custom-orders" },
    { label: "Digital Prints", to: "/shop/category/digital-prints" },
    { label: "Handcrafted Items", to: "/shop/category/handcrafted-items" },
    { label: "Limited Editions", to: "/shop/category/limited-editions" }
  ];

  const indianProducts = [
    { label: "Kolam coasters", to: "/shop/category/kolam-coasters" },
    { label: "Kolam peetham", to: "/shop/category/kolam-peetham" },
    { label: "Traditional magnets", to: "/shop/category/traditional-magnets" },
    { label: "Trays", to: "/shop/category/trays" },
    { label: "Diya holders", to: "/shop/category/diya-holders" }
  ];

  const handleCartClick = () => {
    if (dispatch) dispatch({ type: "TOGGLE_CART" });
  };

  const handleNavClick = () => {
    setIsOpen(false);
    setIsShopDropdownOpen(false);
  };

  const toggleNavbar = () => setIsOpen((v) => !v);
  const isShopActive = location.pathname.startsWith("/shop");

  return (
    <header className="shadow-sm fixed-top header-bg">
      <nav className="navbar navbar-expand-lg navbar-light header-bg">
        <div className="container">
          {/* Brand */}
          <Link className="navbar-brand d-flex align-items-center" to="/" onClick={handleNavClick}>
            <motion.img
              src={logo}
              alt="PnpArtStudio — by Priyanka Vasishta"
              className="brand-logo me-2"
              height={80}
              width={80}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>

          {/* Toggler */}
          <button
            className="navbar-toggler d-lg-none d-flex align-items-center justify-content-center"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={isOpen ? "true" : "false"}
            aria-controls="navbarNav"
            onClick={toggleNavbar}
          >
            {isOpen ? <X size={24} /> : <span className="navbar-toggler-icon" />}
          </button>

          {/* Collapsible */}
          <div id="navbarNav" className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
            {/* Center nav */}
            <div className="flex-grow-1 d-lg-flex justify-content-center">
              <ul className="navbar-nav mb-2 mb-lg-0 gap-lg-1">
                <li className="nav-item">
                  <NavLink end to="/" onClick={handleNavClick} className={({ isActive }) => `nav-link nav-hover ${isActive ? "active" : ""}`}>
                    Home
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/about" onClick={handleNavClick} className={({ isActive }) => `nav-link nav-hover ${isActive ? "active" : ""}`}>
                    About Us
                  </NavLink>
                </li>

                <li
                  ref={dropdownRef}
                  className={`nav-item dropdown ${canHover ? "" : "dropdown-center"}`}
                  onMouseEnter={canHover ? () => setIsShopDropdownOpen(true) : undefined}
                  onMouseLeave={canHover ? () => setIsShopDropdownOpen(false) : undefined}
                >
                  <Link
                    id="shopDropdown"
                    className={`nav-link dropdown-toggle nav-hover ${isShopActive ? "active" : ""}`}
                    to="#"
                    role="button"
                    aria-expanded={isShopDropdownOpen ? "true" : "false"}
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsShopDropdownOpen((open) => !open);
                    }}
                  >
                    <span className="shop-label">
                      Shop <span className={`caret-inline ${canHover ? "" : "caret-mobile"}`}>▾</span>
                    </span>
                  </Link>

                  <ul className={`dropdown-menu ${isShopDropdownOpen ? "show" : ""}`} aria-labelledby="shopDropdown" data-bs-display="static">
                    {topCategories.map((c) => (
                      <li key={c.label}>
                        <NavLink
                          to={c.to}
                          end={Boolean(c.end)}
                          onClick={handleNavClick}
                          className={({ isActive }) => `dropdown-item nav-hover ${isActive ? "active" : ""}`}
                        >
                          {c.label}
                        </NavLink>
                      </li>
                    ))}

                    <li><hr className="dropdown-divider" /></li>

                    {/* Indian Products submenu */}
                    <li
                      className="dropend"
                      onMouseEnter={canHover ? (e) => {
                        const toggle = e.currentTarget.querySelector(".dropdown-toggle");
                        const menu = e.currentTarget.querySelector(".dropdown-menu");
                        if (toggle) toggle.classList.add("show");
                        if (menu) menu.classList.add("show");
                      } : undefined}
                      onMouseLeave={canHover ? (e) => {
                        const toggle = e.currentTarget.querySelector(".dropdown-toggle");
                        const menu = e.currentTarget.querySelector(".dropdown-menu");
                        if (toggle) toggle.classList.remove("show");
                        if (menu) menu.classList.remove("show");
                      } : undefined}
                    >
                      <Link className="dropdown-item dropdown-toggle nav-hover" to="#" role="button" data-bs-toggle="dropdown" data-bs-display="static"
                        onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); }}>
                        Indian Products
                      </Link>
                      <ul className="dropdown-menu" data-bs-display="static">
                        {indianProducts.map((c) => (
                          <li key={c.label}>
                            <NavLink
                              to={c.to}
                              onClick={handleNavClick}
                              className={({ isActive }) => `dropdown-item nav-hover ${isActive ? "active" : ""}`}
                            >
                              {c.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <NavLink to="/art-classes" onClick={handleNavClick} className={({ isActive }) => `nav-link nav-hover ${isActive ? "active" : ""}`}>
                    Art Classes
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/custom-order" onClick={handleNavClick} className={({ isActive }) => `nav-link nav-hover ${isActive ? "active" : ""}`}>
                    Custom Art
                  </NavLink>
                </li>

                
                <li className="nav-item">
                  <NavLink to="/gallery" onClick={handleNavClick} className={({ isActive }) => `nav-link nav-hover ${isActive ? "active" : ""}`}>
                    Gallery
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/contact" onClick={handleNavClick} className={({ isActive }) => `nav-link nav-hover ${isActive ? "active" : ""}`}>
                    Contact
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Right actions */}
            <ul className="navbar-nav ms-lg-3 d-flex align-items-center flex-row gap-2 gap-mobile-icons mt-2 mt-lg-0">
              <li className="nav-item">
                <NavLink
                  to="/wishlist"
                  className={({ isActive }) => `nav-link d-flex align-items-center nav-hover ${isActive ? "active" : ""}`}
                  onClick={handleNavClick}
                  aria-label="Wishlist"
                  title="Wishlist"
                >
                  <Heart size={20} />
                </NavLink>
              </li>

              <li className="nav-item position-relative">
                <button
                  className="btn nav-link position-relative d-flex align-items-center nav-hover"
                  onClick={handleCartClick}
                  aria-label="Cart"
                  title="Cart"
                  type="button"
                >
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill badge-count">
                      {totalItems}
                    </span>
                  )}
                </button>
                <CartDropdown />
              </li>

              {/* Track Order CTA with Fancy button */}
              <li className="nav-item">
                <FancyButton to="/track-order" className="ms-lg-2 fancy-sm m-l 2" aria-label="Track Order">
                  Track Order
                </FancyButton>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
