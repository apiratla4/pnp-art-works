import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Edit, Trash2, Image as ImageIcon, Plus, Info,
  Maximize2, X, ChevronLeft, ChevronRight
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const PRODUCTS_URL = `${API_BASE}/api/products`;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

axios.defaults.withCredentials = true;

const PRODUCT_CATEGORIES = {
  "All Products": [
    "Paintings", "Holiday gifts", "Landscapes", "Modern art", "Name sign", "Limited editions",
    "Pencil sketches", { label: "Digital prints", disabled: true }
  ],
  "Indian Products": [
    "Indian god paintings", "Musical Art paintings", {
      label: "Return gifts", children: ["Kolam coasters", "Kolam peetham", "Traditional magnets", "Trays", "Diya holders"]
    }
  ]
};

const EMPTY_PRODUCT = {
  id: "", title: "", category: "", subcategory: "", subsubcategory: "", price: "", salePrice: "", stock: 1,
  images: [], description: "", published: true, dimensions: "", color: "", inStock: true, featured: false, donated: false, contactForPrice: false
};

const toCapitalWords = (str) => String(str || "").toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());

const mapProductFromApi = (doc) => {
  const images = Array.isArray(doc?.images) ? doc.images.filter(Boolean) : [];
  return {
    id: doc._id, title: doc.title || "", category: doc.category || "", subcategory: doc.subcategory || "",
    subsubcategory: doc.subsubcategory || "", price: typeof doc.price === "number" ? doc.price : "",
    salePrice: doc.salePrice === null ? null : (typeof doc.salePrice === "number" ? doc.salePrice : null),
    stock: typeof doc.stock === "number" ? doc.stock : 0, images, description: doc.description || "",
    published: !!doc.published, slug: doc.slug || "", dimensions: doc.dimensions || "",
    color: toCapitalWords(doc.color || ""),
    inStock: typeof doc?.inStock === "boolean" ? doc.inStock : (typeof doc?.stock === "number" ? doc.stock > 0 : true),
    featured: !!doc?.featured,
    donated: !!doc?.donated,
    contactForPrice: !!doc?.contactForPrice
  };
};

const slugify = (s) => (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

function applyWatermark(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const fontSize = Math.max(28, Math.floor(img.naturalWidth * 0.06));

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6); // 30° diagonal

      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Dark stroke outline for visibility on light backgrounds
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = fontSize * 0.08;
      ctx.strokeText('© pnpartstudio', 0, 0);

      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText('© pnpartstudio', 0, 0);

      ctx.restore();

      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
        'image/jpeg',
        0.92
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

async function uploadToCloudinary(file, folder = "pnpartproducts") {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error("Cloudinary env missing");
  const fd = new FormData();
  fd.append("file", file); fd.append("upload_preset", UPLOAD_PRESET); fd.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || !data.secure_url) throw new Error(data?.error?.message || "Cloudinary upload failed");
  return { url: String(data.secure_url), publicId: data.public_id };
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [uploadingImgs, setUploadingImgs] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef(null);
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
      console.error(e); toast.error("Failed to load products");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    try {
      setUploadingImgs(true);
      const urls = [];
      for (const f of list) {
        const watermarked = await applyWatermark(f);
        const { url } = await uploadToCloudinary(watermarked);
        urls.push(String(url));
      }
      setForm(prev => {
        const next = Array.from(new Set([...(prev.images || []), ...urls]));
        return { ...prev, images: next };
      });
      toast.success("Images uploaded");
    } catch (e) {
      console.error(e); toast.error(e.message || "Cloudinary upload failed");
    } finally {
      setUploadingImgs(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImageAt = (idx) => setForm((f) => ({ ...f, images: (f.images || []).filter((_, i) => i !== idx) }));

  const resetForm = () => {
    setForm(EMPTY_PRODUCT);
    setEditingId("");
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const refetchAfter = async (fn) => { await fn(); await load(); };

  const saveProduct = async (e) => {
    e?.preventDefault?.();
    if (!form.title.trim()) return toast.warning("Product title is required");
    if (!form.donated && !form.contactForPrice && (!form.price || Number(form.price) <= 0)) return toast.warning("Valid price is required");
    if (!form.category) return toast.warning("Select a category");
    if (form.category === "All Products" && !form.subcategory) return toast.warning("Select a subcategory");
    if (form.category === "Indian Products" && !form.subcategory) return toast.warning("Select a subcategory");
    if (form.subcategory === "Return gifts" && !form.subsubcategory) return toast.warning("Select return gift");
    if (!form.donated && !form.contactForPrice && form.salePrice !== "" && form.salePrice !== null && Number(form.salePrice) > Number(form.price)) return toast.warning("Sale price cannot exceed price");
    try {
      const payload = {
        title: form.title, category: form.category, subcategory: form.subcategory,
        subsubcategory: form.subsubcategory ? form.subsubcategory : undefined,
        price: (form.donated || form.contactForPrice) ? 0 : Number(form.price),
        salePrice: (form.donated || form.contactForPrice) ? null : (form.salePrice !== "" && form.salePrice !== null ? Number(form.salePrice) : null),
        stock: Number(form.stock || 0), images: Array.isArray(form.images) ? form.images.map(String) : [],
        description: form.description || "", published: !!form.published,
        dimensions: form.dimensions || "", color: toCapitalWords(form.color),
        inStock: !!form.inStock, featured: !!form.featured, donated: !!form.donated,
        contactForPrice: !!form.contactForPrice
      };
      if (editingId) {
        await refetchAfter(async () => {
          await axios.put(`${PRODUCTS_URL}/${editingId}`, payload, {
            withCredentials: true, headers: { "Content-Type": "application/json" }
          }); toast.success("Product updated");
        });
      } else {
        await refetchAfter(async () => {
          await axios.post(PRODUCTS_URL, payload, {
            withCredentials: true, headers: { "Content-Type": "application/json" }
          }); toast.success("Product created");
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
    setForm({ ...EMPTY_PRODUCT, ...found });
    setShowForm(true);
    const main = document.querySelector("main");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await refetchAfter(async () => {
        await axios.delete(`${PRODUCTS_URL}/${id}`, { withCredentials: true });
        toast.success("Product deleted");
      });
      if (editingId === id) resetForm();
    } catch (e) { console.error(e); toast.error("Failed to delete product"); }
  };

  const firstUrl = (p) => {
    const single = typeof p?.image === "string" ? p.image.trim() : "";
    if (single) return single;
    const arr = Array.isArray(p?.images) ? p.images : [];
    const first = arr.find(Boolean);
    if (!first) return "";
    if (typeof first === "string") return first;
    if (typeof first === "object" && first !== null) return first.secure_url || first.url || first.src || "";
    return "";
  };

  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="100%" height="100%" fill="white"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="10">No Image</text></svg>`
    );
  };

  const closeExpand = () => { setOpen(false); setActive(null); setSlide(0); };
  const goPrev = () => setSlide(s => (active?.images?.length ? (s + active.images.length - 1) % active.images.length : 0));
  const goNext = () => setSlide(s => (active?.images?.length ? (s + 1) % active.images.length : 0));

  return (
    <div className="max-w-7xl mx-auto w-full px-2 sm:px-3 md:px-4">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold mb-0 text-black">Products</h1>
          <p className="text-gray-800 text-sm">Manage products, images, and listings.</p>
        </div>
        <div className="flex items-center gap-3">
          {loading && <span className="text-sm text-gray-600">Loading…</span>}
          <button
            type="button"
            className="btn-mono-sm flex items-center gap-2"
            onClick={() => {
              if (showForm && !editingId) {
                setShowForm(false);
                setForm(EMPTY_PRODUCT);
              } else {
                setForm(EMPTY_PRODUCT);
                setEditingId("");
                setShowForm(true);
              }
            }}
          >
            {showForm && !editingId ? <X size={16} /> : <Plus size={16} />}
            {showForm && !editingId ? "Cancel" : "Add Product"}
          </button>
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow p-6 mb-8"
        >
          <h2 className="text-lg font-bold mb-3 text-black">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>
          <form onSubmit={saveProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-sm mb-1">Title</label>
              <input className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                placeholder="e.g. Sunset Over Waves"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">Category</label>
              <select className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: "", subsubcategory: "" }))}
                required>
                <option value="">Select Category</option>
                {Object.keys(PRODUCT_CATEGORIES).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {form.category && (
              <div>
                <label className="block font-semibold text-sm mb-1">Subcategory</label>
                <select className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                  value={form.subcategory}
                  onChange={e => setForm(f => ({ ...f, subcategory: e.target.value, subsubcategory: "" }))}
                  required>
                  <option value="">Select Subcategory</option>
                  {(PRODUCT_CATEGORIES[form.category] || []).map(sub =>
                    typeof sub === "string" ? (
                      <option key={sub} value={sub}>{sub}</option>
                    ) : (
                      <option key={sub.label} value={sub.label} disabled={!!sub.disabled}>
                        {sub.label}{sub.disabled ? " (Coming soon)" : ""}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
            {form.category === "Indian Products" && form.subcategory === "Return gifts" && (
              <div>
                <label className="block font-semibold text-sm mb-1">Return Gift</label>
                <select className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                  value={form.subsubcategory}
                  onChange={e => setForm(f => ({ ...f, subsubcategory: e.target.value }))}
                  required>
                  <option value="">Select Return Gift</option>
                  {PRODUCT_CATEGORIES["Indian Products"]
                    .find(sc => typeof sc === "object" && sc.label === "Return gifts")
                    .children.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block font-semibold text-sm mb-1">Slug</label>
              <input className="w-full rounded-lg border border-black px-3 py-2 bg-gray-100"
                value={slugify(form.title)} disabled />
            </div>
            {/* Donated — before price */}
            <div>
              <label className="block font-semibold text-sm mb-1">Donated</label>
              <select className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                value={form.donated ? "true" : "false"}
                onChange={e => setForm((f) => ({ ...f, donated: e.target.value === "true", contactForPrice: false }))}>
                <option value="false">No</option>
                <option value="true">Yes – Donated (no price shown)</option>
              </select>
              {form.donated && (
                <p className="text-xs text-amber-600 mt-1">Price hidden on storefront. Shown as "Donated".</p>
              )}
            </div>
            {/* Contact for Price */}
            {!form.donated && (
              <div>
                <label className="block font-semibold text-sm mb-1">Price Required?</label>
                <select className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                  value={form.contactForPrice ? "true" : "false"}
                  onChange={e => setForm((f) => ({ ...f, contactForPrice: e.target.value === "true" }))}>
                  <option value="false">Yes – Show Price</option>
                  <option value="true">No – Contact on WhatsApp</option>
                </select>
                {form.contactForPrice && (
                  <p className="text-xs text-green-700 mt-1">Price hidden. "Contact on WhatsApp" button shown to customers.</p>
                )}
              </div>
            )}
            {/* Price fields — hidden when donated or contactForPrice */}
            {!form.donated && !form.contactForPrice && (
              <>
                <div>
                  <label className="block font-semibold text-sm mb-1">Price</label>
                  <input type="number" step="0.01" min="0"
                    className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                    value={form.price}
                    onChange={e => setForm((f) => ({ ...f, price: e.target.value }))}
                    required />
                </div>
                <div>
                  <label className="block font-semibold text-sm mb-1">Sale Price (optional)</label>
                  <input type="number" step="0.01" min="0"
                    className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                    value={form.salePrice ?? ""}
                    onChange={e => setForm((f) => ({ ...f, salePrice: e.target.value }))} />
                </div>
              </>
            )}
            <div>
              <label className="block font-semibold text-sm mb-1">Stock</label>
              <input type="number" min="0"
                className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                value={form.stock}
                onChange={e => setForm((f) => ({ ...f, stock: Number(e.target.value || 0) }))} />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">Dimensions</label>
              <input className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                placeholder="e.g., A5"
                value={form.dimensions}
                onChange={e => setForm((f) => ({ ...f, dimensions: e.target.value }))} />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">Color</label>
              <input className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                placeholder="e.g., Midnight Blue"
                value={form.color}
                onChange={e => setForm((f) => ({ ...f, color: toCapitalWords(e.target.value) }))} />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">Visibility</label>
              <select className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                value={form.published ? "published" : "draft"}
                onChange={e => setForm((f) => ({ ...f, published: e.target.value === "published" }))}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">In Stock</label>
              <select className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                value={form.inStock ? "true" : "false"}
                onChange={e => setForm((f) => ({ ...f, inStock: e.target.value === "true" }))}>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">Featured</label>
              <select className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                value={form.featured ? "true" : "false"}
                onChange={e => setForm((f) => ({ ...f, featured: e.target.value === "true" }))}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div className="col-span-full">
              <label className="block font-semibold text-sm mb-1 flex items-center gap-1">
                <Info size={14} /> Description
              </label>
              <textarea className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                rows={3}
                placeholder="Product details for storefront and SEO."
                value={form.description}
                onChange={e => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="col-span-full">
              <label className="block font-semibold text-sm mb-1">Images</label>
              <div className="flex flex-wrap gap-3 items-center">
                {Array.isArray(form.images) && form.images.length > 0 &&
                  form.images.map((src, i) => (
                    <div key={`img-${i}`} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-black overflow-hidden">
                      <img src={src} alt={`img-${i}`} className="object-cover w-full h-full" />
                      <button type="button"
                        className="absolute top-1 right-1 rounded-full bg-white border border-black text-black w-6 h-6 flex items-center justify-center font-bold hover:bg-black hover:text-white"
                        onClick={() => removeImageAt(i)} aria-label="Remove image">×</button>
                    </div>
                  ))}
                <label className="inline-flex items-center gap-2 rounded-lg border border-black px-3 py-2 font-semibold cursor-pointer bg-white">
                  <input ref={fileInputRef} type="file" accept="image/*" multiple
                    onChange={e => handleFiles(e.target.files)} disabled={uploadingImgs} hidden />
                  <ImageIcon size={18} />
                  {uploadingImgs ? "Uploading…" : "Add Images"}
                </label>
              </div>
            </div>
            <div className="col-span-full flex flex-col sm:flex-row gap-2 mt-2">
              <button type="submit" className="btn-mono-sm flex items-center gap-2" disabled={loading || uploadingImgs}>
                {editingId ? <Edit size={16} /> : <Plus size={16} />}
                {editingId ? "Update" : "Create"}
              </button>
              <button type="button" className="btn-mono-sm" onClick={resetForm} disabled={loading || uploadingImgs}>
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* PRODUCTS TABLE */}
      <div className="rounded-2xl shadow bg-white overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-50 text-left">
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Image</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Product</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Price</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide text-center">Stock</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Status</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cover = firstUrl(p);
                const priceNum = Number(p.price || 0);
                const sale = p.salePrice !== null ? Number(p.salePrice) : null;
                return (
                  <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5">
                      {cover ? (
                        <img src={cover} alt={p.title}
                          className="w-12 h-12 object-cover rounded-lg border border-black/20 flex-shrink-0"
                          onError={handleImgError}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-black/20 flex items-center justify-center bg-gray-100 flex-shrink-0">
                          <ImageIcon size={16} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 min-w-[160px] max-w-[260px]">
                      <div className="font-bold text-black leading-tight line-clamp-1">{p.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {p.category}{p.subcategory && " / " + p.subcategory}{p.subsubcategory && " / " + p.subsubcategory}
                      </div>
                      {p.color && <div className="text-xs text-gray-400">{p.color}</div>}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {p.donated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-semibold">
                          🙏 Donated
                        </span>
                      ) : p.contactForPrice ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-300 text-green-700 text-xs font-semibold">
                          💬 Contact
                        </span>
                      ) : sale !== null ? (
                        <div className="leading-tight">
                          <span className="line-through text-gray-400 text-xs block">${priceNum}</span>
                          <span className="font-semibold text-black">${sale}</span>
                        </div>
                      ) : (
                        <span className="font-semibold">${priceNum}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center font-medium">{p.stock}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold border ${p.published ? "bg-black text-white border-black" : "bg-white text-black border-black"}`}>
                          {p.published ? "Published" : "Draft"}
                        </span>
                        {p.featured && (
                          <span className="rounded-full px-2 py-0.5 text-xs font-bold border border-yellow-400 bg-yellow-50 text-yellow-700">⭐ Featured</span>
                        )}
                        {p.donated && (
                          <span className="rounded-full px-2 py-0.5 text-xs font-bold border border-amber-300 bg-amber-50 text-amber-700">Donated</span>
                        )}
                        {p.contactForPrice && (
                          <span className="rounded-full px-2 py-0.5 text-xs font-bold border border-green-300 bg-green-50 text-green-700">💬 Contact</span>
                        )}
                        {(!p.inStock || Number(p.stock) === 0) && (
                          <span className="rounded-full px-2 py-0.5 text-xs font-bold border border-red-300 bg-red-50 text-red-600">Out of Stock</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1.5 justify-end">
                        <button className="btn-mono-sm" onClick={() => editProduct(p.id)} title="Edit" type="button">
                          <Edit size={14} />
                        </button>
                        <button className="btn-mono-sm" onClick={() => deleteProduct(p.id)} title="Delete" type="button">
                          <Trash2 size={14} />
                        </button>
                        <button className="btn-mono-sm" onClick={() => { setActive(p); setSlide(0); setOpen(true); }} title="View" type="button">
                          <Maximize2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && products.length === 0 && (
            <div className="py-16 text-center text-gray-500 font-semibold">
              No products yet. Click "Add Product" to get started.
            </div>
          )}
        </div>
      </div>

      {/* EXPAND MODAL */}
      {open && active && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
          <div className="relative w-full max-w-lg sm:max-w-2xl mx-auto p-4 sm:p-6 md:p-9 rounded-2xl bg-white border border-black shadow-2xl flex flex-col gap-4 max-h-[95vh] overflow-y-auto animate-fadein">
            <button
              className="absolute top-4 right-4 text-black/70 hover:text-black bg-white rounded-full p-2 border border-black shadow-sm z-10"
              onClick={closeExpand}
              aria-label="Close"
            >
              <X size={22} />
            </button>
            <div className="relative w-full bg-gray-100 rounded-lg border border-black overflow-hidden mb-2 flex items-center justify-center min-h-[180px]">
              {active.images && active.images.length > 0 ? (
                <>
                  <img
                    src={active.images[slide]}
                    alt={active.title}
                    className="object-contain max-h-80 w-auto mx-auto"
                    style={{ maxHeight: 320, maxWidth: "100%" }}
                    onError={handleImgError}
                  />
                  {active.images.length > 1 && (
                    <>
                      <button className="absolute left-1 top-1/2 -translate-y-1/2 bg-white border border-black rounded-full p-1.5 text-black hover:bg-black hover:text-white transition"
                        onClick={goPrev} aria-label="Prev">
                        <ChevronLeft size={22} />
                      </button>
                      <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-white border border-black rounded-full p-1.5 text-black hover:bg-black hover:text-white transition"
                        onClick={goNext} aria-label="Next">
                        <ChevronRight size={22} />
                      </button>
                      <span className="absolute right-4 bottom-2 text-xs bg-white/70 px-2 py-0.5 rounded-full border border-black font-bold">
                        {slide + 1}/{active.images.length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div className="text-gray-400 flex flex-col items-center gap-2 py-8">
                  <ImageIcon size={40} />No Image
                </div>
              )}
            </div>
            <div>
              <div className="font-black text-2xl mb-1">{active.title}</div>
              <div className="mb-1 text-xs text-gray-700">
                {[active.category, active.subcategory, active.subsubcategory].filter(Boolean).join(" / ")}
              </div>
              <div className="flex gap-4 items-end mb-2">
                {active.donated ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-sm font-semibold">🙏 Donated</span>
                ) : active.contactForPrice ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 border border-green-300 text-green-700 text-sm font-semibold">💬 Contact for Price</span>
                ) : (
                  <>
                    <span className="font-bold text-xl text-black">${active.salePrice ? active.salePrice : active.price}</span>
                    {active.salePrice && <span className="line-through text-gray-500 text-base">${active.price}</span>}
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {active.color && <span className="rounded-full px-3 py-0.5 text-xs font-bold border border-black bg-white text-black">{active.color}</span>}
                <span className="rounded-full px-3 py-0.5 text-xs font-bold border border-black bg-white text-black">Stock: {active.stock}</span>
                {active.dimensions && <span className="rounded-full px-3 py-0.5 text-xs font-bold border border-black bg-white text-black">{active.dimensions}</span>}
                {active.featured && <span className="rounded-full px-3 py-0.5 text-xs font-bold border border-black bg-white text-black">⭐ Featured</span>}
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold border border-black ${active.published ? "bg-black text-white" : "bg-white text-black"}`}>
                  {active.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="text-gray-800 text-sm font-light">{active.description}</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .btn-mono-sm {
          border: 1.5px solid #000;
          background: #fff;
          color: #000;
          border-radius: 9999px;
          padding: 7px 16px;
          font-weight: 700;
          font-size: 1.09em;
          transition: all .16s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-mono-sm:hover, .btn-mono-sm:focus { background: #000; color: #fff; }
        .btn-mono-sm:active { transform: scale(0.97); }
        .btn-mono-sm:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .btn-mono-sm:disabled { opacity: 0.5; cursor: not-allowed; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .animate-fadein { animation: fadein .19s cubic-bezier(.41,1.08,.67,1); }
        @keyframes fadein { from { opacity: 0; transform: scale(.98);} to { opacity: 1; transform: scale(1);} }
      `}</style>
    </div>
  );
}
