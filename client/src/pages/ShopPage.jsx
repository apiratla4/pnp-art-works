// src/pages/ShopPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, Grid, List, Search } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import FancyButton from "../components/FancyButton";

// --- Canonical filters ---
const PRODUCT_FILTERS = {
  "All Products": [
    "Paintings",
    "Holiday gifts",
    "Landscapes",
    "Modern art",
    "Name sign",
    "Limited editions",
    "Pencil sketches",
    { label: "Digital prints", disabled: true },
  ],
  "Indian Products": [
    "Indian god paintings",
    "Musical Art paintings",
    {
      label: "Return gifts",
      children: [
        "Kolam coasters",
        "Kolam peetham",
        "Traditional magnets",
        "Trays",
        "Diya holders"
      ]
    }
  ]
};
const MAIN_CATEGORIES = Object.keys(PRODUCT_FILTERS);

// USD formatter
const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// fallback SVG thumbnail
const FALLBACK_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 600 600">
       <rect width="100%" height="100%" fill="white"/>
       <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="20">No Image</text>
     </svg>`
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

export default function ShopPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, total, loading, error, params, updateParam } = useProducts();

  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(params.q || "");
  const [min, setMin] = useState(params.minPrice || "");
  const [max, setMax] = useState(params.maxPrice || "");
  const [sortUI, setSortUI] = useState(() => {
    if (params.sort === "price_asc") return "price-low";
    if (params.sort === "price_desc") return "price-high";
    if (params.sort === "name") return "name";
    if (params.sort === "featured") return "featured";
    return "newest";
  });

  // Canonical state for all filter levels
  const [currentCat, setCurrentCat] = useState(params.category || MAIN_CATEGORIES[0]);
  const [subcat, setSubcat] = useState(params.subcategory || "");
  const [subsubcat, setSubsubcat] = useState(params.subsubcategory || "");

  // --- Deep links/query param support for every filter ---
  useEffect(() => {
    // Always set from query, not from URL slug/path
    const cat = searchParams.get("category") || MAIN_CATEGORIES[0];
    const sub = searchParams.get("subcategory") || "";
    const subsub = searchParams.get("subsubcategory") || "";
    setCurrentCat(cat);
    setSubcat(sub);
    setSubsubcat(subsub);

    updateParam("category", cat === MAIN_CATEGORIES[0] ? "" : cat);
    updateParam("subcategory", sub);
    updateParam("subsubcategory", subsub);
    // eslint-disable-next-line
  }, [location.search]);

  useEffect(() => { setSearchTerm(params.q || ""); }, [params.q]);
  useEffect(() => { setMin(params.minPrice || ""); setMax(params.maxPrice || ""); }, [params.minPrice, params.maxPrice]);
  useEffect(() => {
    if (params.sort === "price_asc") setSortUI("price-low");
    else if (params.sort === "price_desc") setSortUI("price-high");
    else if (params.sort === "name") setSortUI("name");
    else if (params.sort === "featured") setSortUI("featured");
    else setSortUI("newest");
  }, [params.sort]);

  const viewItems = useMemo(() => {
    let out = items.slice();
    if (sortUI === "featured") out.sort((a, b) => Number(b.featured) - Number(a.featured));
    else if (sortUI === "name") out.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return out;
  }, [items, sortUI]);

  const applySearch = () => updateParam("q", searchTerm.trim());
  const applyPrice = (e) => { e?.preventDefault?.(); updateParam("minPrice", min.trim()); updateParam("maxPrice", max.trim()); };
  const handleSort = (val) => {
    setSortUI(val);
    if (val === "price-low") updateParam("sort", "price_asc");
    else if (val === "price-high") updateParam("sort", "price_desc");
    else if (val === "name") updateParam("sort", "name");
    else if (val === "featured") updateParam("sort", "featured");
    else updateParam("sort", "newest");
  };

  // Filter logic all levels
  const handleCategoryChange = (label) => {
    setCurrentCat(label);
    updateParam("category", label === MAIN_CATEGORIES[0] ? "" : label);
    setSubcat(""); setSubsubcat("");
    updateParam("subcategory", "");
    updateParam("subsubcategory", "");
  };
  const handleSubcatChange = (label) => {
    setSubcat(label);
    updateParam("subcategory", label);
    setSubsubcat("");
    updateParam("subsubcategory", "");
  };
  const handleSubsubcatChange = (label) => {
    setSubsubcat(label);
    updateParam("subsubcategory", label);
  };

  const clearAll = () => {
    ["q", "category", "subcategory", "subsubcategory", "minPrice", "maxPrice", "inStock", "sort", "page", "limit"].forEach((k) => updateParam(k, ""));
    setSearchTerm(""); setMin(""); setMax(""); setSortUI("newest"); setCurrentCat(MAIN_CATEGORIES[0]); setSubcat(""); setSubsubcat("");
  };

  const niceCategory = useMemo(() => (currentCat || "All Artworks"), [currentCat]);
  const canLoadMore = viewItems.length < total;
  const loadMore = () => {
    const next = Number(params.limit || 12) + 12;
    updateParam("limit", next);
  };

  const subcategories = (PRODUCT_FILTERS[currentCat] || []);
  const selectedSubcatObj = subcategories.find(
    sc => typeof sc === "object" && sc.label === subcat
  );
  const subsubcatOptions = selectedSubcatObj ? selectedSubcatObj.children : [];

  // Nav menu/Sidebar generator - using query params only for deep links
  // You can render this for your site nav/sidebar:
  // <Link to={`/shop?category=Indian Products&subcategory=Return gifts&subsubcategory=Kolam coasters`}>Kolam Coasters</Link>
  // ...repeat for every subcat/subsubcategory...

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f1efef" }}>
      <div className="container py-4 py-lg-5">
        <div className="mb-4">
          <h1 className="fw-bold display-6 mb-2" style={{ color: "#000" }}>{niceCategory}</h1>
          <p className="mb-0" style={{ color: "#000" }}>Discover unique, handcrafted artworks that bring beauty to your space</p>
        </div>
        <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ background: "#fff", color: "#000" }}>
          <div className="card-body">
            <div className="d-flex flex-column flex-lg-row gap-3 align-items-stretch align-items-lg-center justify-content-between">
              <div className="w-100" style={{ maxWidth: 480 }}>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: "#fff", color: "#000", borderColor: "#000" }}>
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search artworks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") applySearch(); }}
                    onBlur={applySearch}
                    className="form-control"
                    aria-label="Search artworks"
                    style={{ color: "#000", borderColor: "#000" }}
                  />
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <select
                  value={sortUI}
                  onChange={(e) => handleSort(e.target.value)}
                  className="form-select"
                  style={{ minWidth: 200, color: "#000", borderColor: "#000" }}
                  aria-label="Sort products"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
                <div className="d-inline-flex gap-1" role="group" aria-label="View mode">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`icon-toggle ${viewMode === "grid" ? "active" : ""}`}
                    title="Grid"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`icon-toggle ${viewMode === "list" ? "active" : ""}`}
                    title="List"
                  >
                    <List size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="mono-btn d-inline-flex align-items-center gap-2"
                >
                  <Filter size={16} />
                  <span>Filters</span>
                </button>
              </div>
            </div>
            {/* Advanced Filters */}
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4" style={{ borderTop: "1px solid #000" }}>
                <div className="row g-4">
                  {/* Main category */}
                  <div className="col-12 col-md-4">
                    <h6 className="fw-semibold mb-3" style={{ color: "#000" }}>Main Category</h6>
                    <div className="vstack gap-2">
                      {MAIN_CATEGORIES.map((cat) => (
                        <label key={cat} className="d-flex align-items-center gap-2" style={{ color: "#000" }}>
                          <input
                            type="radio"
                            name="maincat"
                            className="form-check-input"
                            checked={currentCat === cat}
                            onChange={() => handleCategoryChange(cat)}
                          />
                          <span className="small">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Subcategories */}
                  {subcategories.length > 0 && (
                    <div className="col-12 col-md-4">
                      <h6 className="fw-semibold mb-3" style={{ color: "#000" }}>Subcategory</h6>
                      <div className="vstack gap-2">
                        {subcategories.map((sc) =>
                          typeof sc === "string" ? (
                            <label key={sc} className="d-flex align-items-center gap-2" style={{ color: "#000" }}>
                              <input
                                type="radio"
                                name="subcat"
                                className="form-check-input"
                                checked={subcat === sc}
                                onChange={() => handleSubcatChange(sc)}
                              />
                              <span className="small">{sc}</span>
                            </label>
                          ) : (
                            <label key={sc.label} className="d-flex align-items-center gap-2" style={{ color: "#888" }}>
                              <input
                                type="radio"
                                name="subcat"
                                className="form-check-input"
                                checked={subcat === sc.label}
                                disabled={!!sc.disabled}
                                onChange={() => handleSubcatChange(sc.label)}
                              />
                              <span className="small">{sc.label}{sc.disabled ? " (Coming soon)" : ""}</span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {/* Subsubcategory */}
                  {subsubcatOptions.length > 0 && subcat === selectedSubcatObj?.label && (
                    <div className="col-12 col-md-4">
                      <h6 className="fw-semibold mb-3" style={{ color: "#000" }}>{selectedSubcatObj.label} Items</h6>
                      <div className="vstack gap-2">
                        {subsubcatOptions.map((ssc) => (
                          <label key={ssc} className="d-flex align-items-center gap-2" style={{ color: "#000" }}>
                            <input
                              type="radio"
                              name="subsubcat"
                              className="form-check-input"
                              checked={subsubcat === ssc}
                              onChange={() => handleSubsubcatChange(ssc)}
                            />
                            <span className="small">{ssc}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Price/Stock filter can be added here as shown in previous examples */}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Results count and errors */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <p className="mb-0" style={{ color: "#000" }}>Showing {viewItems.length} of {total} result{total !== 1 ? "s" : ""}</p>
          {error && <div className="mono-alert mb-0 py-1 px-2">Failed to load products: {error}</div>}
        </div>

        {/* Loading / Empty / Grid / List */}
        {loading ? (
          <div className="row g-3 g-lg-4">
            {Array.from({ length: Number(params.limit || 12) }).map((_, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4 col-xl-3">
                <div className="card border-0 shadow-sm rounded-4" style={{ height: 320, background: "#fff" }}>
                  <div className="w-100 h-100 rounded-4" style={{ background: "#f6f6f6" }} />
                </div>
              </div>
            ))}
          </div>
        ) : viewItems.length === 0 ? (
          <div className="text-center py-5">
            <div className="display-3 mb-2">🎨</div>
            <h3 className="h5 fw-semibold mb-2" style={{ color: "#000" }}>No artworks found</h3>
            <p className="mb-0" style={{ color: "#000" }}>Try adjusting filters or search terms</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="row g-3 g-lg-4 mb-4">
            {viewItems.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.06 }}
                viewport={{ once: true }}
                className="col-12 col-md-6 col-lg-4 col-xl-3"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="vstack gap-3 mb-4">
            {viewItems.map((p, index) => {
              const safeSrc = getCover(p) || FALLBACK_SVG;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.06 }}
                  viewport={{ once: true }}
                  className="card border-0 shadow-sm rounded-4"
                  style={{ background: "#fff", color: "#000" }}
                >
                  <Link to={`/product-details?id=${p.id}`} className="text-decoration-none">
                    <div className="card-body d-flex align-items-center gap-3">
                      <div className="shrink-0 rounded-3 overflow-hidden" style={{ width: 96, height: 96, border: "1px solid #000" }}>
                        <img
                          src={safeSrc}
                          alt={`${p.title} thumbnail`}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                          onError={handleImgError}
                          loading="lazy"
                        />
                      </div>
                      <div className="grow">
                        <div className="fw-semibold mb-1" style={{ color: "#000" }}>{p.title}</div>
                        <div className="small mb-1" style={{ color: "#000" }}>
                          {p.category}
                          {p.subcategory && ` • ${p.subcategory}`}
                          {p.subsubcategory && ` • ${p.subsubcategory}`}
                        </div>
                        <div className="fw-bold" style={{ color: "#000" }}>
                          {typeof p.salePrice === "number" && p.salePrice !== null ? (
                            <>
                              <span style={{ textDecoration: "line-through", color: "#888", marginRight: 8 }}>
                                {fmtUSD.format(Number(p.price || 0))}
                              </span>
                              <span>{fmtUSD.format(Number(p.salePrice))}</span>
                            </>
                          ) : (
                            fmtUSD.format(Number(p.price || 0))
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && viewItems.length > 0 && (
          <div className="text-center">
            <FancyButton
              as="button"
              type="button"
              className="fancy-sm"
              onClick={loadMore}
              disabled={!canLoadMore}
              aria-disabled={!canLoadMore}
              title={canLoadMore ? "Load more artworks" : "All results loaded"}
            >
              {canLoadMore ? "Load More Artworks" : "All results loaded"}
            </FancyButton>
          </div>
        )}
      </div>

       <style>{`
        .mono-badge {
          display: inline-block;
          padding: 6px 10px;
          border: 1px solid #000;
          border-radius: 999px;
          background: #fff;
          color: #000;
          font-weight: 700;
        }

        .wish-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1px solid #000;
          background: #fff;
          color: #000;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
        }
        .wish-btn:hover { background: #000; color: #fff; }
        .wish-btn.active { background: #000; color: #fff; }
        .wish-btn:active { transform: scale(0.98); }
        .wish-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .wish-btn:focus { outline: 2px solid #000; outline-offset: 2px; }

        .mono-btn {
          border: 1px solid #000; background: #fff; color: #000; padding: 8px 12px; font-weight: 700; border-radius: 8px;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
          white-space: nowrap;
        }
        .mono-btn:hover { background: #000; color: #fff; }
        .mono-btn:active { transform: scale(0.98); }
        .mono-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .mono-btn:focus { outline: 2px solid #000; outline-offset: 2px; }
        .mono-btn-sm { padding: 6px 10px; border-radius: 999px; }
      `}</style>
    </div>
  );
}
