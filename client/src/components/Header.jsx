import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";
import CartDropdown from "./CartDropdown";
import logo from "../assets/pnplogoblack1.png";
import FancyButton from "./FancyButton";

// Multi-level shop links
const allProducts = [
  { label: "Paintings", to: `/shop?category=All Products&subcategory=Paintings` },
  { label: "Holiday gifts", to: `/shop?category=All Products&subcategory=Holiday gifts` },
  { label: "Landscapes", to: `/shop?category=All Products&subcategory=Landscapes` },
  { label: "Modern art", to: `/shop?category=All Products&subcategory=Modern art` },
  { label: "Name sign", to: `/shop?category=All Products&subcategory=Name sign` },
  { label: "Limited editions", to: `/shop?category=All Products&subcategory=Limited editions` },
  { label: "Pencil sketches", to: `/shop?category=All Products&subcategory=Pencil sketches` },
  { label: "Digital prints", to: `/shop?category=All Products&subcategory=Digital prints`, disabled: true }
];
const indianProductsMain = [
  { label: "Indian god paintings", to: `/shop?category=Indian Products&subcategory=Indian god paintings` },
  { label: "Musical Art paintings", to: `/shop?category=Indian Products&subcategory=Musical Art paintings` }
];
const returnGifts = [
  { label: "Kolam coasters", to: `/shop?category=Indian Products&subcategory=Return gifts&subsubcategory=Kolam coasters` },
  { label: "Kolam peetham", to: `/shop?category=Indian Products&subcategory=Return gifts&subsubcategory=Kolam peetham` },
  { label: "Traditional magnets", to: `/shop?category=Indian Products&subcategory=Return gifts&subsubcategory=Traditional magnets` },
  { label: "Trays", to: `/shop?category=Indian Products&subcategory=Return gifts&subsubcategory=Trays` },
  { label: "Diya holders", to: `/shop?category=Indian Products&subcategory=Return gifts&subsubcategory=Diya holders` }
];
const navLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Shop", to: "/shop" },
  { label: "Art Classes", to: "/art-classes" },
  { label: "Custom Art", to: "/custom-order" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" }
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false); // desktop shop menu
  const [shopSubPage, setShopSubPage] = useState(""); // '', 'all', 'indian', 'return'
  const [mobileShopStep, setMobileShopStep] = useState(""); // '', 'all', 'indian', 'return'
  const { totalItems, state, dispatch } = useCart();
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); setShopOpen(false); setShopSubPage(""); setMobileShopStep(""); }, [location.pathname]);
  const wishlistCount = (state?.wishlist || []).length || 0;

  // Detect desktop/mobile for UI consistency
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : false);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") { setMenuOpen(false); setShopOpen(false); setShopSubPage(""); setMobileShopStep(""); } };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);
  const handleCartClick = () => { dispatch?.({ type: "TOGGLE_CART" }); };

  return (
    <header className="w-full bg-white border-b border-gray-200 fixed z-40 top-0 left-0" style={{ minHeight: 80 }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 md:px-6 py-2" style={{ minHeight: 80 }}>
        {/* Logo */}
        <Link to="/" aria-label="Home" className="flex items-center gap-3 min-w-8">
          <motion.img
            src={logo}
            alt="PnPArtStudio"
            className="h-20 md:h-24 w-auto"
            height={88}
            width={140}
            whileHover={{ scale: 1.02 }}
            style={{ maxHeight: 88 }}
          />
          {isDesktop && (
            <span>
              <span className="font-bold text-[1.7rem] ml-1 tracking-tight text-gray-900 leading-tight block">PnPArtStudio</span>
              <span className="block text-sm text-gray-500 font-medium ml-1 leading-none">by priyanka vasista</span>
            </span>
          )}
        </Link>
        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-4 py-1 relative">
          {navLinks.map(({ label, to }) =>
            label !== "Shop" ? (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `font-semibold text-base px-2 transition-all border-b-2 ${
                      isActive
                        ? "text-black border-black"
                        : "text-gray-900 border-transparent hover:border-black hover:text-black"
                    } pb-0.5`
                  }
                  style={{ fontWeight: 600, letterSpacing: -0.5 }}
                >
                  {label}
                </NavLink>
              </li>
            ) : (
              <li key="Shop" className="relative">
                <button
                  className="font-semibold text-base px-2 pb-0.5 border-b-2 border-transparent hover:border-black focus:border-black text-gray-900 hover:text-black flex items-center gap-1"
                  onClick={() => { setShopOpen(v => !v); setShopSubPage(""); }}
                  style={{ fontWeight: 600, letterSpacing: -0.5 }}
                  aria-expanded={shopOpen}
                  aria-controls="desktop-shop-menu"
                >
                  Shop
                  <ChevronDown size={16} className={`transition-transform ${shopOpen ? "rotate-180" : ""}`} />
                </button>
                {/* Click-based Step Navigation */}
                {shopOpen && (
                  <div id="desktop-shop-menu" className="absolute left-0 top-8 bg-white border border-gray-300 rounded-lg shadow min-w-[220px] text-base py-2 z-40">
                    {shopSubPage === "" && (
                      <>
                        <button
                          className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 w-full text-left rounded"
                          onClick={() => setShopSubPage("all")}
                        >
                          All Products <ChevronRight size={18} />
                        </button>
                        <button
                          className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 w-full text-left rounded"
                          onClick={() => setShopSubPage("indian")}
                        >
                          Indian Products <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                    {shopSubPage === "all" && (
                      <>
                        <button className="px-3 py-2 text-black mb-1" onClick={() => setShopSubPage("")}>← Back</button>
                        {allProducts.map(({ label, to, disabled }) =>
                          disabled
                            ? <span key={to} className="block px-4 py-2 opacity-60 cursor-not-allowed">{label} (soon)</span>
                            : <NavLink key={to} to={to} className="block px-4 py-2 rounded hover:bg-gray-100" onClick={() => setShopOpen(false)}>{label}</NavLink>
                        )}
                      </>
                    )}
                    {shopSubPage === "indian" && (
                      <>
                        <button className="px-3 py-2 text-black mb-1" onClick={() => setShopSubPage("")}>← Back</button>
                        {indianProductsMain.map(({ label, to }) => (
                          <NavLink key={to} to={to} className="block px-4 py-2 rounded hover:bg-gray-100" onClick={() => setShopOpen(false)}>{label}</NavLink>
                        ))}
                        <button className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 w-full text-left rounded font-semibold mt-1" onClick={() => setShopSubPage("return")}>
                          Return gifts <ChevronRight size={15} />
                        </button>
                      </>
                    )}
                    {shopSubPage === "return" && (
                      <>
                        <button className="px-3 py-2 text-black mb-1" onClick={() => setShopSubPage("indian")}>← Back</button>
                        {returnGifts.map(({ label, to }) => (
                          <NavLink key={to} to={to} className="block px-4 py-2 rounded hover:bg-gray-100" onClick={() => setShopOpen(false)}>{label}</NavLink>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </li>
            )
          )}
        </ul>
        {/* Right actions: wishlist always, tracker only desktop, cart always */}
        <div className="flex items-center gap-2 md:gap-3 min-w-28">
          <NavLink to="/wishlist" className="p-2 rounded-full hover:bg-gray-100 relative" title="Wishlist">
            <Heart size={25} className="text-gray-700" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-pink-700 text-white rounded-full text-xs font-bold w-5 h-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </NavLink>
          {isDesktop && (
            <FancyButton
              to="/track-order"
              className="rounded-xl font-bold bg-black text-white px-6 py-2 text-base tracking-tight hover:bg-gray-900 shadow-none transition"
              style={{ minWidth: 140 }}
            >
              Track Order
            </FancyButton>
          )}
          <button
            className="relative p-2 rounded-full hover:bg-gray-100"
            aria-label="Cart"
            title="Cart"
            onClick={handleCartClick}
          >
            <ShoppingCart size={26} className="text-gray-900" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-pink-600 text-white rounded-full text-xs font-bold w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <CartDropdown />
          <button
            className="block lg:hidden p-2 rounded hover:bg-gray-200 ml-1"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>
      {/* Mobile drawer - unchanged, already click-based step-by-step */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="bg-black/30 absolute inset-0" onClick={() => setMenuOpen(false)} />
          <nav className="absolute right-0 top-0 h-full w-5/6 max-w-xs bg-white shadow-2xl flex flex-col px-6 pt-7 pb-5">
            <button className="self-end mb-6 text-gray-500" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={28} /></button>
            <div className="flex flex-col gap-2 mt-2">
              {/* Step-based mobile shop nav */}
              {mobileShopStep === "" && (
                <>
                  {navLinks.map(link =>
                    link.label === "Shop" ? (
                      <button
                        key="Shop"
                        className="text-lg font-semibold px-2 py-2 text-gray-900 rounded hover:bg-gray-100 flex items-center"
                        onClick={() => setMobileShopStep("shop")}
                      >
                        Shop
                        <ChevronRight size={18} className="ml-auto" />
                      </button>
                    ) : (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className="text-lg font-semibold px-2 py-2 text-gray-900 rounded hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        {link.label}
                      </NavLink>
                    )
                  )}
                  <NavLink
                    to="/wishlist"
                    className="flex items-center gap-2 text-lg font-semibold px-2 py-2 text-gray-900 rounded hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Heart size={22} className="text-gray-700" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="inline-flex items-center justify-center bg-pink-700 text-white rounded-full text-xs font-bold w-5 h-5 ml-1">{wishlistCount}</span>
                    )}
                  </NavLink>
                </>
              )}
              {mobileShopStep === "shop" && (
                <>
                  <button className="text-lg font-semibold px-2 py-2 text-black rounded hover:bg-gray-100 flex items-center" onClick={() => setMobileShopStep("")}>← Back</button>
                  <button className="font-semibold px-3 py-2 text-gray-900 rounded hover:bg-gray-100 flex items-center" onClick={() => setMobileShopStep("all")}>
                    All Products <ChevronRight size={15} className="ml-auto" />
                  </button>
                  <button className="font-semibold px-3 py-2 text-gray-900 rounded hover:bg-gray-100 flex items-center" onClick={() => setMobileShopStep("indian")}>
                    Indian Products <ChevronRight size={15} className="ml-auto" />
                  </button>
                </>
              )}
              {mobileShopStep === "all" && (
                <>
                  <button className="text-lg font-semibold px-2 py-2 text-black rounded hover:bg-gray-100 flex items-center" onClick={() => setMobileShopStep("shop")}>← Back</button>
                  {allProducts.map(({ label, to, disabled }) =>
                    disabled ? (
                      <span key={to} className="block px-4 py-2 opacity-60 cursor-not-allowed">{label} (soon)</span>
                    ) : (
                      <NavLink key={to} to={to} className="block px-4 py-2 rounded hover:bg-gray-100 text-base text-black" onClick={() => setMenuOpen(false)}>{label}</NavLink>
                    )
                  )}
                </>
              )}
              {mobileShopStep === "indian" && (
                <>
                  <button className="text-lg font-semibold px-2 py-2 text-black rounded hover:bg-gray-100 flex items-center" onClick={() => setMobileShopStep("shop")}>← Back</button>
                  {indianProductsMain.map(({ label, to }) => (
                    <NavLink key={to} to={to} className="block px-4 py-2 rounded hover:bg-gray-100 text-base text-black" onClick={() => setMenuOpen(false)}>{label}</NavLink>
                  ))}
                  <button className="font-semibold px-3 py-2 text-gray-900 rounded hover:bg-gray-100 flex items-center" onClick={() => setMobileShopStep("return")} >Return gifts <ChevronRight size={15} className="ml-auto" /></button>
                </>
              )}
              {mobileShopStep === "return" && (
                <>
                  <button className="text-lg font-semibold px-2 py-2 text-black rounded hover:bg-gray-100 flex items-center" onClick={() => setMobileShopStep("indian")}>← Back</button>
                  {returnGifts.map(({ label, to }) => (
                    <NavLink key={to} to={to} className="block px-4 py-2 rounded hover:bg-gray-100 text-base text-black" onClick={() => setMenuOpen(false)}>{label}</NavLink>
                  ))}
                </>
              )}
            </div>
            <div className="mt-auto pt-7">
              <FancyButton
                to="/track-order"
                className="w-full rounded-xl font-bold bg-black text-white px-0 py-3 text-lg shadow-none hover:bg-gray-900"
                onClick={() => setMenuOpen(false)}
              >Track Order</FancyButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
