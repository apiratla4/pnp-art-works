import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, Grid, List, Search, XCircle } from "lucide-react";
import ProductCard from "../components/ProductCard";
import FancyButton from "../components/FancyButton";
import { useProducts } from "../hooks/useProducts";

// --- Canonical filters ---
const PRODUCT_FILTERS = {
  "All Products": [
    "Paintings", "Holiday gifts", "Landscapes", "Modern art", "Name sign",
    "Limited editions", "Pencil sketches", { label: "Digital prints", disabled: true }
  ],
  "Indian Products": [
    "Indian god paintings",
    "Musical Art paintings",
    {
      label: "Return gifts",
      children: [
        "Kolam coasters", "Kolam peetham", "Traditional magnets",
        "Trays", "Diya holders"
      ]
    }
  ]
};
const MAIN_CATEGORIES = Object.keys(PRODUCT_FILTERS);

const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const FALLBACK_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 600 600"><rect width="100%" height="100%" fill="white"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="20">No Image</text></svg>`
  );
const getCover = (item) => {
  if (typeof item?.image === "string" && item.image.trim()) return item.image.trim();
  if (Array.isArray(item?.images) && item.images.length > 0) {
    const first = item.images.find(Boolean);
    if (typeof first === "string" && first.trim()) return first.trim();
    if (first && typeof first === "object") {
      const v = first.secure_url ?? first.url ?? first.src ?? first.path ?? "";
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  const maybe = item?.thumbnail ?? item?.cover ?? item?.photo ?? item?.picture ?? "";
  if (typeof maybe === "string" && maybe.trim()) return maybe.trim();
  if (maybe && typeof maybe === "object") {
    const v = maybe.secure_url ?? maybe.url ?? maybe.src ?? maybe.path ?? "";
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
};
const handleImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_SVG;
};

const ShopPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  // Product REST hook
  const { items: allItems = [], loading, error } = useProducts();

  // URL-driven filter state
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(params.get("q") || "");
  const [sortUI, setSortUI] = useState(params.get("sort") || "newest");
  const [currentCat, setCurrentCat] = useState(params.get("category") || MAIN_CATEGORIES[0]);
  const [subcat, setSubcat] = useState(params.get("subcategory") || "");
  const [subsubcat, setSubsubcat] = useState(params.get("subsubcategory") || "");
  const [minPrice, setMinPrice] = useState(params.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("max") || "");

  // Keep state in sync with URL for deep links
  useEffect(() => {
    const ps = new URLSearchParams(location.search);
    setCurrentCat(ps.get("category") || MAIN_CATEGORIES[0]);
    setSubcat(ps.get("subcategory") || "");
    setSubsubcat(ps.get("subsubcategory") || "");
    setSearchTerm(ps.get("q") || "");
    setSortUI(ps.get("sort") || "newest");
    setMinPrice(ps.get("min") || "");
    setMaxPrice(ps.get("max") || "");
  }, [location.search]);

  // Write to URL on filter state change via handy handlers
  const updateUrl = (options = {}) => {
    const ps = new URLSearchParams();
    if (options.category) ps.set("category", options.category);
    if (options.subcategory) ps.set("subcategory", options.subcategory);
    if (options.subsubcategory) ps.set("subsubcategory", options.subsubcategory);
    if (searchTerm) ps.set("q", searchTerm);
    if (sortUI && sortUI !== "newest") ps.set("sort", sortUI);
    if (minPrice) ps.set("min", minPrice);
    if (maxPrice) ps.set("max", maxPrice);
    navigate(`/shop?${ps.toString()}`);
  };

  // Handlers for UI →
  const handleCategory = (cat) => {
    setCurrentCat(cat);
    setSubcat(""); setSubsubcat("");
    updateUrl({ category: cat });
  };
  const handleSubcat = (c) => {
    setSubcat(c);
    setSubsubcat("");
    updateUrl({ category: currentCat, subcategory: c });
  };
  const handleSubsubcat = (name) => {
    setSubsubcat(name);
    updateUrl({ category: currentCat, subcategory: subcat, subsubcategory: name });
  };

  const subcategories = PRODUCT_FILTERS[currentCat] || [];
  const selectedSubcatObj = subcategories.find(
    sc => typeof sc === "object" && sc.label === subcat
  );
  const subsubcatOptions = selectedSubcatObj ? selectedSubcatObj.children : [];

  const viewItems = useMemo(() => {
    let out = allItems.slice();

    // Categories
    if (currentCat && currentCat !== MAIN_CATEGORIES[0]) out = out.filter(p => (p.category || "") === currentCat);
    if (subcat) out = out.filter(p => (p.subcategory || "") === subcat);
    if (subsubcat) out = out.filter(p => (p.subsubcategory || "") === subsubcat);

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      out = out.filter(i =>
        [i.title, i.medium, i.description, i.category, i.year, i.subcategory, i.subsubcategory]
          .some(val => (val ? String(val).toLowerCase().includes(q) : false))
      );
    }

    // Price
    const min = minPrice.trim() ? parseFloat(minPrice) : undefined;
    const max = maxPrice.trim() ? parseFloat(maxPrice) : undefined;
    if (min !== undefined && !isNaN(min)) out = out.filter(p =>
      typeof p.price === "number" && p.price >= min
    );
    if (max !== undefined && !isNaN(max)) out = out.filter(p =>
      typeof p.price === "number" && p.price <= max
    );

    // Sorting
    if (sortUI === "price-low") out.sort((a, b) => (a.salePrice || a.price || 0) - (b.salePrice || b.price || 0));
    if (sortUI === "price-high") out.sort((a, b) => (b.salePrice || b.price || 0) - (a.salePrice || a.price || 0));
    if (sortUI === "name") out.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

    return out;
  }, [allItems, currentCat, subcat, subsubcat, searchTerm, minPrice, maxPrice, sortUI]);

  const niceCategory = currentCat || "All Artworks";
  const clearAll = () => {
    setSearchTerm(""); setMinPrice(""); setMaxPrice("");
    setSortUI("newest");
    handleCategory(MAIN_CATEGORIES[0]);
  };

  return (
    <div className="min-h-screen bg-[#f1efef] pb-12">
      {/* HERO */}
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-5 md:px-6 pt-8 sm:pt-10 pb-5">
        <h1 className="font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1">{niceCategory}</h1>
        <div className="mb-6 sm:mb-8 text-gray-700 text-base sm:text-lg md:text-xl font-medium">
          Discover unique, handcrafted artworks that bring beauty to your space.
        </div>
      </div>
      {/* CONTROLS */}
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-5 md:px-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end bg-white shadow rounded-2xl px-4 sm:px-5 md:px-6 py-3 sm:py-4 mb-6">
          {/* SEARCH */}
          <div className="flex items-center flex-1 bg-white border border-black/15 rounded-xl pr-2 w-full sm:max-w-[420px]">
            <Search size={22} className="text-black/80 mx-3" />
            <input
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); updateUrl({ category: currentCat, subcategory: subcat, subsubcategory: subsubcat }); }}
              placeholder="Search artworks…"
              className="flex-1 py-2.5 px-2 text-black font-normal focus:outline-none text-base bg-transparent"
            />
            {searchTerm && (
              <button type="button" className="ml-2 text-black/40 hover:text-black" onClick={() => { setSearchTerm(""); updateUrl({ category: currentCat, subcategory: subcat, subsubcategory: subsubcat }); }} aria-label="Clear search">
                <XCircle size={18} />
              </button>
            )}
          </div>
          {/* SORT + VIEW MODE TOGGLES */}
          <div className="flex flex-wrap sm:justify-end gap-2 items-center">
            <select value={sortUI}
              onChange={e => { setSortUI(e.target.value); updateUrl({ category: currentCat, subcategory: subcat, subsubcategory: subsubcat }); }}
              className="border font-semibold text-black border-black/20 rounded-lg py-2 px-3 bg-white focus:border-black outline-none w-full sm:w-auto sm:min-w-[150px]">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low - High</option>
              <option value="price-high">Price: High - Low</option>
              <option value="name">Name A-Z</option>
            </select>
            <button
              className={`p-2 rounded-xl border border-black/25 mr-1 font-bold ${viewMode === "grid" ? "bg-black text-white border-black" : "bg-white text-black"} hover:bg-black hover:text-white`}
              aria-label="Grid" onClick={() => setViewMode("grid")}
            >
              <Grid size={18} />
            </button>
            <button
              className={`p-2 rounded-xl border border-black/25 font-bold ${viewMode === "list" ? "bg-black text-white border-black" : "bg-white text-black"} hover:bg-black hover:text-white`}
              aria-label="List" onClick={() => setViewMode("list")}
            >
              <List size={18} />
            </button>
            <button
              className="border border-black/20 rounded-lg px-3 py-2 bg-white font-bold flex items-center gap-2 hover:bg-black hover:text-white transition"
              onClick={() => setShowFilters(v => !v)}
            >
              <Filter size={18} /> Filters
            </button>
          </div>
        </div>
        {/* FILTER PANEL */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="w-full bg-white rounded-2xl shadow px-4 sm:px-5 md:px-6 py-4 sm:py-6 mb-6">
            <div className="flex flex-wrap gap-3 mb-5">
              {MAIN_CATEGORIES.map(cat => (
                <button key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`px-5 py-2 rounded-full border transition text-base font-bold uppercase tracking-wide shrink-0 
                      ${currentCat === cat ? "bg-black text-white border-black" : "bg-white text-black border-black/30 hover:bg-black hover:text-white"}`}
                >{cat}</button>
              ))}
            </div>
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-5">
                {subcategories.map(sc =>
                  typeof sc === "string" ? (
                    <button key={sc}
                      onClick={() => handleSubcat(sc)}
                      className={`py-2 px-4 rounded-lg border font-medium text-base ${subcat === sc ? "bg-black text-white border-black" : "bg-white text-black border-black/30 hover:bg-black hover:text-white"}`}
                    >{sc}</button>
                  ) : (
                    <button key={sc.label}
                      onClick={() => handleSubcat(sc.label)}
                      className={`py-2 px-4 rounded-lg border font-medium text-base ${subcat === sc.label ? "bg-black text-white border-black" : "bg-white text-black border-black/30 hover:bg-black hover:text-white"} ${sc.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!!sc.disabled}
                    >{sc.label}</button>
                  )
                )}
              </div>
            )}
            {subsubcatOptions.length > 0 && subcat === selectedSubcatObj?.label && (
              <div className="flex flex-wrap gap-3 mb-5">
                {subsubcatOptions.map(ssc => (
                  <button key={ssc}
                    onClick={() => handleSubsubcat(ssc)}
                    className={`py-2 px-4 rounded-lg border font-medium text-base ${subsubcat === ssc ? "bg-black text-white border-black" : "bg-white text-black border-black/30 hover:bg-black hover:text-white"}`}
                  >{ssc}</button>
                ))}
              </div>
            )}
            {/* Price range filter */}
            <div className="flex flex-wrap gap-4 items-end mb-3 max-w-lg">
              <div>
                <label className="block mb-1 text-black font-bold">Min Price</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={e => { setMinPrice(e.target.value); updateUrl({ category: currentCat, subcategory: subcat, subsubcategory: subsubcat }); }}
                  placeholder="Min"
                  className="border border-black/30 rounded-lg py-2 px-3 w-28 text-black bg-white focus:border-black outline-none"
                  min={0}
                />
              </div>
              <div>
                <label className="block mb-1 text-black font-bold">Max Price</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => { setMaxPrice(e.target.value); updateUrl({ category: currentCat, subcategory: subcat, subsubcategory: subsubcat }); }}
                  placeholder="Max"
                  className="border border-black/30 rounded-lg py-2 px-3 w-28 text-black bg-white focus:border-black outline-none"
                  min={0}
                />
              </div>
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); updateUrl({ category: currentCat, subcategory: subcat, subsubcategory: subsubcat }); }}
                className="text-black border border-black/30 rounded-lg px-4 py-2 font-semibold hover:bg-black hover:text-white"
              >Clear Price</button>
            </div>
            <button
              onClick={clearAll}
              className="border border-black/25 rounded-full px-6 py-2 font-semibold bg-gray-100 text-black hover:bg-black hover:text-white mr-3"
            >Reset Filters</button>
          </motion.div>
        )}
      </div>
      {/* PRODUCT GRIDS/LIST - show all filtered, never paginated */}
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-5 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-black text-sm sm:text-base mb-4 sm:mb-5">
          <span>
            Showing {viewItems.length} of {allItems.length} result{allItems.length !== 1 ? "s" : ""}
          </span>
          {error && <span className="bg-red-200 text-red-700 px-3 py-1 rounded-lg">{error}</span>}
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mb-16">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-[310px] rounded-2xl bg-gray-200/40 animate-pulse" />
            ))}
          </div>
        ) : viewItems.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <div className="text-5xl mb-4">🎨</div>
            <div className="text-xl font-bold mb-2">No artworks found</div>
            <div className="text-base">Try adjusting filters or search terms</div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 mb-16">
            {viewItems.map((product, idx) => (
              <motion.div
                key={product.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5 mb-16">
            {viewItems.map((p, idx) => {
              const safeSrc = getCover(p) || FALLBACK_SVG;
              return (
                <motion.div
                  key={p.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-black/10 bg-white flex items-center gap-3 sm:gap-5 p-3 sm:p-4 shadow-sm"
                >
                  <Link to={`/product-details?id=${p.id}`} className="block w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-300 shrink-0">
                    <img src={safeSrc} alt={p.title} className="w-full h-full object-cover" onError={handleImgError} loading="lazy" />
                  </Link>
                  <Link to={`/product-details?id=${p.id}`} className="flex-1 ml-2 min-w-0">
                    <div className="font-bold text-lg truncate">{p.title}</div>
                    <div className="text-sm text-gray-500 truncate">{[p.category, p.subcategory, p.subsubcategory].filter(Boolean).join(' • ')}</div>
                    <div className="font-black mt-1 text-black">
                      {typeof p.salePrice === "number" && p.salePrice !== null ?
                        <>
                          <span className="line-through text-gray-400 mr-2">{fmtUSD.format(Number(p.price || 0))}</span>
                          <span>{fmtUSD.format(Number(p.salePrice))}</span>
                        </> :
                        fmtUSD.format(Number(p.price || 0))
                      }
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
