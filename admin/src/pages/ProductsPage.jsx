// admin/src/pages/ProductsPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Layers,
  Plus,
  Star,
  Info,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import "./admin.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const PRODUCTS_URL = `${API_BASE}/api/products`;

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

axios.defaults.withCredentials = true;

// USD formatter
const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const CATEGORIES = [
  "Paintings",
  "Indian Products",
  "Pencil Sketches",
  "Digital Prints",
  "Limited Editions"
];

const INDIAN_SUBCATEGORIES = [
  "Kolam coasters",
  "Kolam peetham",
  "Traditional magnets",
  "Trays",
  "Diya holders"
];

const currentYear = new Date().getFullYear();

const EMPTY_PRODUCT = {
  id: "",
  title: "",
  category: "Paintings",
  subcategory: "",
  price: "",
  salePrice: "",
  stock: 1,
  images: [], // array of string URLs (DB truth)
  description: "",
  published: true,
  dimensions: "",
  medium: "",
  year: currentYear,
  inStock: true,
  featured: false
};

const mapProductFromApi = (doc) => {
  const images = Array.isArray(doc?.images) ? doc.images.filter(Boolean) : [];
  return {
    id: doc._id,
    title: doc.title || "",
    category: doc.category || "Paintings",
    subcategory: doc.subcategory || "",
    price: typeof doc.price === "number" ? doc.price : 0,
    salePrice: doc.salePrice === null ? null : (typeof doc.salePrice === "number" ? doc.salePrice : null),
    stock: typeof doc.stock === "number" ? doc.stock : 0,
    images,
    description: doc.description || "",
    published: !!doc.published,
    slug: doc.slug || "",
    dimensions: doc.dimensions || "",
    medium: doc.medium || "",
    year: Number.isInteger(doc?.year) ? doc.year : currentYear,
    inStock:
      typeof doc?.inStock === "boolean"
        ? doc.inStock
        : typeof doc?.stock === "number"
        ? doc.stock > 0
        : true,
    featured: !!doc?.featured
  };
};

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// Unsigned Cloudinary upload: file + upload_preset (+ folder if preset allows)
async function uploadToCloudinary(file, folder = "pnpartproducts") {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary env missing (VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET)");
  }
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", folder); // folder allowed only if preset permits it

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd
  });
  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }
  return { url: String(data.secure_url), publicId: data.public_id };
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(EMPTY_PRODUCT);

  const [uploadingImgs, setUploadingImgs] = useState(false);
  const fileInputRef = useRef(null);

  // Details modal state
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [slide, setSlide] = useState(0);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(PRODUCTS_URL, { withCredentials: true });
      const items = Array.isArray(res.data?.items) ? res.data.items.map(mapProductFromApi) : [];
      setProducts(items);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Upload -> URLs -> array of strings
  const handleFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    try {
      setUploadingImgs(true);
      const urls = [];
      for (const f of list) {
        const { url } = await uploadToCloudinary(f);
        urls.push(String(url));
      }
      setForm((prev) => {
        const next = Array.from(new Set([...(prev.images || []), ...urls]));
        return { ...prev, images: next };
      });
      toast.success("Images uploaded");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Cloudinary upload failed");
    } finally {
      setUploadingImgs(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImageAt = (idx) => {
    setForm((f) => ({
      ...f,
      images: (f.images || []).filter((_, i) => i !== idx)
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_PRODUCT);
    setEditingId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const refetchAfter = async (fn) => {
    await fn();
    await load();
  };

  const saveProduct = async (e) => {
    e?.preventDefault?.();

    if (!form.title.trim()) {
      toast.warning("Product title is required");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.warning("Valid price is required");
      return;
    }
    if (form.category === "Indian Products" && !form.subcategory) {
      toast.warning("Select a subcategory");
      return;
    }
    if (form.salePrice !== "" && form.salePrice !== null && Number(form.salePrice) > Number(form.price)) {
      toast.warning("Sale price cannot exceed price");
      return;
    }
    const y = Number(form.year);
    if (!Number.isInteger(y) || y < 1900 || y > currentYear) {
      toast.warning(`Enter a valid year between 1900 and ${currentYear}`);
      return;
    }

    try {
      const payload = {
        title: form.title,
        category: form.category,
        subcategory: form.category === "Indian Products" ? form.subcategory : undefined,
        price: Number(form.price),
        salePrice: form.salePrice !== "" && form.salePrice !== null ? Number(form.salePrice) : null,
        stock: Number(form.stock || 0),
        images: Array.isArray(form.images) ? form.images.map(String) : [], // DB: array of strings
        description: form.description || "",
        published: !!form.published,
        dimensions: form.dimensions || "",
        medium: form.medium || "",
        year: y,
        inStock: !!form.inStock,
        featured: !!form.featured
      };

      if (editingId) {
        await refetchAfter(async () => {
          await axios.put(`${PRODUCTS_URL}/${editingId}`, payload, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" }
          });
          toast.success("Product updated");
        });
      } else {
        await refetchAfter(async () => {
          await axios.post(PRODUCTS_URL, payload, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" }
          });
          toast.success("Product created");
        });
      }
      resetForm();
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "Failed to save product";
      const det = e?.response?.data?.details ? ` (${Object.values(e.response.data.details).join(", ")})` : "";
      toast.error(msg + det);
    }
  };

  const editProduct = (id) => {
    const found = products.find((p) => p.id === id);
    if (!found) return;
    setEditingId(id);
    setForm({
      id,
      title: found.title || "",
      category: found.category || "Paintings",
      subcategory: found.category === "Indian Products" ? found.subcategory || "" : "",
      price: found.price ?? "",
      salePrice: found.salePrice ?? "",
      stock: typeof found.stock === "number" ? found.stock : 0,
      images: Array.isArray(found.images) ? found.images : [],
      description: found.description || "",
      published: !!found.published,
      dimensions: found.dimensions || "",
      medium: found.medium || "",
      year: Number.isInteger(found.year) ? found.year : currentYear,
      inStock:
        typeof found.inStock === "boolean"
          ? found.inStock
          : typeof found.stock === "number"
          ? found.stock > 0
          : true,
      featured: !!found.featured
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await refetchAfter(async () => {
        await axios.delete(`${PRODUCTS_URL}/${id}`, { withCredentials: true });
        toast.success("Product deleted");
      });
      if (editingId === id) resetForm();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete product");
    }
  };

  // SINGLE thumbnail ONLY for table
  const firstUrl = (p) => (Array.isArray(p.images) && p.images.length ? String(p.images) : "");
  const short = (s, n = 80) => (s && s.length > n ? s.slice(0, n) + "…" : s || "-");

  // Details modal
  const openDetails = (p) => {
    setActive(p);
    setSlide(0);
    setOpen(true);
  };
  const closeDetails = () => setOpen(false);
  const prev = () =>
    setSlide((i) => {
      const len = active?.images?.length || 0;
      return len ? (i - 1 + len) % len : 0;
    });
  const next = () =>
    setSlide((i) => {
      const len = active?.images?.length || 0;
      return len ? (i + 1) % len : 0;
    });

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="h4 fw-bold mb-0" style={{ color: "#000" }}>
            Products
          </h1>
          <small style={{ color: "#000" }}>
            Table shows only one image URL (first), expand to view all details and images
          </small>
        </div>
        {loading && (
          <span className="small" style={{ color: "#000" }}>
            Loading…
          </span>
        )}
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card border-0 shadow-sm rounded-4 mb-4"
        style={{ background: "#fff", color: "#000" }}
      >
        <div className="card-body p-3 p-lg-4">
          <div className="d-flex align-items-center justify-content-between">
            <h2 className="h6 fw-semibold mb-3" style={{ color: "#000" }}>
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
          </div>

          <form onSubmit={saveProduct}>
            <div className="row g-3">
              {/* Title */}
              <div className="col-12 col-sm-6 col-lg-6">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  Title
                </label>
                <input
                  className="form-control"
                  placeholder="e.g., Sunset Over Waves"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              {/* Category */}
              <div className="col-6 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  Category
                </label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((f) => ({
                      ...f,
                      category: value,
                      subcategory: value === "Indian Products" ? f.subcategory : ""
                    }));
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              {form.category === "Indian Products" && (
                <div className="col-6 col-sm-6 col-lg-3">
                  <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                    Subcategory
                  </label>
                  <select
                    className="form-select"
                    value={form.subcategory}
                    onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))}
                    required
                  >
                    <option value="">Select…</option>
                    {INDIAN_SUBCATEGORIES.map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Slug */}
              <div className="col-6 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  Slug
                </label>
                <input className="form-control" value={slugify(form.title)} disabled />
              </div>

              {/* Price */}
              <div className="col-6 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  <DollarSign size={14} className="me-1" />
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>

              {/* Sale Price */}
              <div className="col-6 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  <Tag size={14} className="me-1" />
                  Sale Price (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={form.salePrice}
                  onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                />
              </div>

              {/* Stock */}
              <div className="col-6 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  <Layers size={14} className="me-1" />
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value || 0) }))}
                />
              </div>

              {/* Visibility */}
              <div className="col-6 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  Visibility
                </label>
                <select
                  className="form-select"
                  value={form.published ? "published" : "draft"}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.value === "published" }))}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Dimensions */}
              <div className="col-6 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  Dimensions
                </label>
                <input
                  className="form-control"
                  placeholder="e.g., A5"
                  value={form.dimensions}
                  onChange={(e) => setForm((f) => ({ ...f, dimensions: e.target.value }))}
                />
              </div>

              {/* Medium */}
              <div className="col-6 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  Medium
                </label>
                <input
                  className="form-control"
                  placeholder="e.g., Mixed Materials"
                  value={form.medium}
                  onChange={(e) => setForm((f) => ({ ...f, medium: e.target.value }))}
                />
              </div>

              {/* Year */}
              <div className="col-6 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  Year
                </label>
                <input
                  type="number"
                  className="form-control"
                  min={1900}
                  max={currentYear}
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value || currentYear) }))}
                />
              </div>

              {/* In Stock */}
              <div className="col-6 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  In Stock
                </label>
                <select
                  className="form-select"
                  value={form.inStock ? "true" : "false"}
                  onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.value === "true" }))}
                >
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>

              {/* Featured */}
              <div className="col-6 col-sm-6 col-lg-3">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  Featured
                </label>
                <select
                  className="form-select"
                  value={form.featured ? "true" : "false"}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.value === "true" }))}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {/* Description */}
              <div className="col-12">
                <label className="form-label small fw-semibold" style={{ color: "#000" }}>
                  <Info size={14} className="me-1" />
                  Description
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Product details for storefront and SEO."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Images */}
              <div className="col-12">
                <label className="form-label small fw-semibold d-block" style={{ color: "#000" }}>
                  Images
                </label>
                <div className="d-flex gap-2 flex-wrap">
                  {Array.isArray(form.images) &&
                    form.images.length > 0 &&
                    form.images.map((src, i) => (
                      <div key={`img-${i}`} className="img-tile">
                        <img src={src} alt={`img-${i}`} />
                        <button
                          type="button"
                          className="btn btn-sm btn-light remove"
                          onClick={() => removeImageAt(i)}
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                  <label className="img-uploader m-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFiles(e.target.files)}
                      disabled={uploadingImgs}
                      hidden
                    />
                    <ImageIcon size={18} className="me-1" />
                    {uploadingImgs ? "Uploading…" : "Add images"}
                  </label>
                </div>
                <small className="text-muted d-block mt-1">
                  The first image URL is used in the table; click Expand in the list to view all images and details.
                </small>
              </div>

              {/* Submit + Reset */}
              <div className="col-12 d-flex flex-column flex-sm-row gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="mono-btn d-inline-flex align-items-center justify-content-center gap-2"
                  disabled={uploadingImgs}
                >
                  {editingId ? <Edit size={18} /> : <Plus size={18} />}
                  {editingId ? "Update Product" : "Create Product"}
                </motion.button>
                <button
                  type="button"
                  className="mono-btn mono-btn-outline"
                  onClick={resetForm}
                  disabled={uploadingImgs}
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>

      {/* List: single image URL only in Image column */}
      <div className="card border-0 shadow-sm rounded-4" style={{ background: "#fff", color: "#000" }}>
        <div className="card-body p-0">
          <div className="table-responsive-sm">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: 64, borderBottom: "1px solid #000", color: "#000" }}>Image</th>
                  <th style={{ borderBottom: "1px solid #000", color: "#000" }}>Title</th>
                  <th className="d-none d-sm-table-cell" style={{ borderBottom: "1px solid #000", color: "#000" }}>
                    Category
                  </th>
                  <th className="d-none d-lg-table-cell" style={{ borderBottom: "1px solid #000", color: "#000" }}>
                    Subcategory
                  </th>
                  <th className="d-none d-xl-table-cell" style={{ borderBottom: "1px solid #000", color: "#000" }}>
                    Description
                  </th>
                  <th className="text-end" style={{ borderBottom: "1px solid #000", color: "#000" }}>
                    Price
                  </th>
                  <th className="text-end d-none d-sm-table-cell" style={{ borderBottom: "1px solid #000", color: "#000" }}>
                    Stock
                  </th>
                  <th className="d-none d-md-table-cell" style={{ borderBottom: "1px solid #000", color: "#000" }}>
                    Status
                  </th>
                  <th style={{ width: 170, borderBottom: "1px solid #000", color: "#000" }} className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const cover = firstUrl(p);
                  const priceNum = Number(p.price || 0);
                  const sale = p.salePrice !== null ? Number(p.salePrice) : null;

                  return (
                    <tr key={p.id}>
                      <td>
                        {cover ? (
                          <img
                            src={cover}
                            alt={p.title}
                            style={{
                              width: 48,
                              height: 48,
                              objectFit: "cover",
                              borderRadius: 8,
                              border: "1px solid #000"
                            }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{ width: 48, height: 48, borderRadius: 8, border: "1px solid #000" }}
                            title="No image"
                          >
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </td>
                      <td className="fw-semibold" style={{ color: "#000" }}>
                        {p.title}
                      </td>
                      <td className="d-none d-sm-table-cell" style={{ color: "#000" }}>
                        {p.category}
                      </td>
                      <td className="d-none d-lg-table-cell" style={{ color: "#000" }}>
                        {p.category === "Indian Products" ? p.subcategory || "-" : "-"}
                      </td>
                      <td className="d-none d-xl-table-cell" style={{ color: "#000" }}>
                        {short(p.description, 60)}
                      </td>
                      <td className="text-end" style={{ color: "#000" }}>
                        {sale !== null ? (
                          <>
                            <span className="text-muted text-decoration-line-through me-1">
                              {fmtUSD.format(priceNum)}
                            </span>
                            <span className="fw-semibold">{fmtUSD.format(sale)}</span>
                          </>
                        ) : (
                          <span className="fw-semibold">{fmtUSD.format(priceNum)}</span>
                        )}
                      </td>
                      <td className="text-end d-none d-sm-table-cell" style={{ color: "#000" }}>
                        {p.stock}
                      </td>
                      <td className="d-none d-md-table-cell">
                        <div className="d-flex gap-1 flex-wrap">
                          <span className={`mono-badge ${p.published ? "active" : ""}`}>
                            {p.published ? "Published" : "Draft"}
                          </span>
                          {p.featured ? <span className="mono-badge">Featured</span> : null}
                          {!p.inStock || Number(p.stock || 0) === 0 ? <span className="mono-badge">Out</span> : null}
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-1">
                          <button
                            className="mono-btn mono-btn-sm"
                            onClick={() => editProduct(p.id)}
                            title="Edit"
                            type="button"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="mono-btn mono-btn-sm"
                            onClick={() => deleteProduct(p.id)}
                            title="Delete"
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            className="mono-btn mono-btn-sm"
                            onClick={() => openDetails(p)}
                            title="Expand"
                            type="button"
                          >
                            <Maximize2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="text-center py-4" style={{ color: "#000" }}>
                      No products yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details modal: all DB info + gallery */}
      {open && active && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.85)", zIndex: 1050 }}
          onClick={closeDetails}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="position-absolute top-50 start-50 translate-middle bg-white rounded-4 shadow p-3 p-md-4"
            style={{ width: "min(1000px, 95vw)", maxHeight: "90vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-semibold" style={{ color: "#000" }}>
                {active.title}
              </div>
              <button className="mono-btn mono-btn-sm" onClick={closeDetails} type="button">
                <X size={16} />
              </button>
            </div>

            {/* Gallery */}
            <div className="d-flex align-items-center justify-content-center mb-3" style={{ minHeight: 260 }}>
              {active.images?.length ? (
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="mono-btn mono-btn-sm"
                    onClick={prev}
                    disabled={active.images.length <= 1}
                    type="button"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <img
                    src={active.images[slide]}
                    alt={`img-${slide}`}
                    style={{
                      maxWidth: "70vw",
                      maxHeight: "60vh",
                      objectFit: "contain",
                      borderRadius: 8,
                      border: "1px solid #000"
                    }}
                  />
                  <button
                    className="mono-btn mono-btn-sm"
                    onClick={next}
                    disabled={active.images.length <= 1}
                    type="button"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="small" style={{ color: "#000" }}>
                  No images
                </div>
              )}
            </div>
            {active.images?.length > 1 && (
              <div className="d-flex flex-wrap gap-2 mb-3">
                {active.images.map((u, i) => (
                  <img
                    key={i}
                    src={u}
                    alt={`thumb-${i}`}
                    onClick={() => setSlide(i)}
                    style={{
                      width: 56,
                      height: 56,
                      objectFit: "cover",
                      borderRadius: 8,
                      outline: i === slide ? "2px solid #000" : "1px solid #000",
                      cursor: "pointer"
                    }}
                  />
                ))}
              </div>
            )}

            {/* DB Details */}
            <div className="row g-2 small" style={{ color: "#000" }}>
              <div className="col-6">
                <strong>Category:</strong> {active.category || "-"}
              </div>
              <div className="col-6">
                <strong>Subcategory:</strong>{" "}
                {active.category === "Indian Products" ? active.subcategory || "-" : "-"}
              </div>
              <div className="col-6">
                <strong>Price:</strong> {fmtUSD.format(Number(active.price || 0))}
              </div>
              <div className="col-6">
                <strong>Sale Price:</strong>{" "}
                {active.salePrice !== null ? fmtUSD.format(Number(active.salePrice)) : "-"}
              </div>
              <div className="col-6">
                <strong>Stock:</strong> {active.stock}
              </div>
              <div className="col-6">
                <strong>In Stock:</strong> {active.inStock ? "Yes" : "No"}
              </div>
              <div className="col-6">
                <strong>Published:</strong> {active.published ? "Yes" : "No"}
              </div>
              <div className="col-6">
                <strong>Featured:</strong> {active.featured ? "Yes" : "No"}
              </div>
              <div className="col-6">
                <strong>Dimensions:</strong> {active.dimensions || "-"}
              </div>
              <div className="col-6">
                <strong>Medium:</strong> {active.medium || "-"}
              </div>
              <div className="col-6">
                <strong>Year:</strong> {active.year || "-"}
              </div>
              <div className="col-12">
                <strong>Description:</strong> {active.description || "-"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Local monochrome + focus-visible */}
      <style>{`
        /* Inputs/selects focus in black */
        .form-control:focus, .form-select:focus {
          border-color: #000 !important;
          box-shadow: none !important;
        }

        /* Mono buttons */
        .mono-btn {
          border: 1px solid #000; background: #fff; color: #000;
          border-radius: 10px; padding: 8px 12px; font-weight: 700;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
          white-space: nowrap;
        }
        .mono-btn:hover { background: #000; color: #fff; }
        .mono-btn:active { transform: scale(0.98); }
        .mono-btn-sm { padding: 6px 10px; border-radius: 999px; }

        /* Outline variant */
        .mono-btn-outline {
          background: #fff; color: #000; border: 1px solid #000;
        }
        .mono-btn-outline:hover { background: #000; color: #fff; }

        /* Mono badge */
        .mono-badge {
          display: inline-block; padding: 4px 10px; border-radius: 999px;
          border: 1px solid #000; background: #fff; color: #000; font-weight: 700;
        }
        .mono-badge.active { background: #000; color: #fff; }

        /* Keyboard-only focus indicator */
        .mono-btn:focus-visible,
        a:focus-visible,
        .form-control:focus-visible,
        .form-select:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        .mono-btn:focus, a:focus, .form-control:focus, .form-select:focus {
          outline: 2px solid #000; outline-offset: 2px;
        }
        .mono-btn:focus:not(:focus-visible),
        a:focus:not(:focus-visible),
        .form-control:focus:not(:focus-visible),
        .form-select:focus:not(:focus-visible) {
          outline: none; box-shadow: none;
        }
      `}</style>
    </div>
  );
}
