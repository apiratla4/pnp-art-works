import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Edit, Trash2, Image as ImageIcon, DollarSign, Tag, Layers, Plus, Info,
  Maximize2, X, ChevronLeft, ChevronRight
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

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
  images: [], description: "", published: true, dimensions: "", color: "", inStock: true, featured: false
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
    color: toCapitalWords(doc.color || ""), inStock: typeof doc?.inStock === "boolean" ? doc.inStock : (typeof doc?.stock === "number" ? doc.stock > 0 : true),
    featured: !!doc?.featured
  };
};
const slugify = (s) => (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
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
        const { url } = await uploadToCloudinary(f);
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
  const resetForm = () => { setForm(EMPTY_PRODUCT); setEditingId(""); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const refetchAfter = async (fn) => { await fn(); await load(); };

  const saveProduct = async (e) => {
    e?.preventDefault?.();
    if (!form.title.trim()) return toast.warning("Product title is required");
    if (!form.price || Number(form.price) <= 0) return toast.warning("Valid price is required");
    if (!form.category) return toast.warning("Select a category");
    if (form.category === "All Products" && !form.subcategory) return toast.warning("Select a subcategory");
    if (form.category === "Indian Products" && !form.subcategory) return toast.warning("Select a subcategory");
    if (form.subcategory === "Return gifts" && !form.subsubcategory) return toast.warning("Select return gift");
    if (form.salePrice !== "" && form.salePrice !== null && Number(form.salePrice) > Number(form.price)) return toast.warning("Sale price cannot exceed price");

    try {
      const payload = {
        title: form.title, category: form.category, subcategory: form.subcategory,
        subsubcategory: form.subsubcategory ? form.subsubcategory : undefined,
        price: Number(form.price), salePrice: form.salePrice !== "" && form.salePrice !== null ? Number(form.salePrice) : null,
        stock: Number(form.stock || 0), images: Array.isArray(form.images) ? form.images.map(String) : [],
        description: form.description || "", published: !!form.published,
        dimensions: form.dimensions || "", color: toCapitalWords(form.color),
        inStock: !!form.inStock, featured: !!form.featured
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
    const found = products.find((p) => p.id === id); if (!found) return;
    setEditingId(id); setForm({ ...EMPTY_PRODUCT, ...found });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await refetchAfter(async () => {
        await axios.delete(`${PRODUCTS_URL}/${id}`, { withCredentials: true });
        toast.success("Product deleted");
      }); if (editingId === id) resetForm();
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
    e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="10">No Image</text>
      </svg>`);
  };
  const short = (s, n = 80) => (s && s.length > n ? s.slice(0, n) + "…" : s || "-");

  return (
    <div className="max-w-7xl mx-auto w-full px-2">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold mb-0 text-black">Products</h1>
          <p className="text-gray-800 text-sm">All product management, image upload, creation, and editing!</p>
        </div>
        {loading && (<span className="text-sm text-gray-600">Loading…</span>)}
      </div>

      {/* FORM */}
      <motion.div initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-lg font-bold mb-3 text-black">
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>
        <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                    <option key={sub.label} value={sub.label} disabled={!!sub.disabled}>{sub.label}{sub.disabled ? " (Coming soon)" : ""}</option>
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
                {PRODUCT_CATEGORIES["Indian Products"].find(sc => typeof sc === "object" && sc.label === "Return gifts")
                  .children.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block font-semibold text-sm mb-1">Slug</label>
            <input className="w-full rounded-lg border border-black px-3 py-2 bg-gray-100"
              value={slugify(form.title)} disabled />
          </div>
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
              value={form.salePrice}
              onChange={e => setForm((f) => ({ ...f, salePrice: e.target.value }))} />
          </div>
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
              onChange={e => setForm((f) => ({ ...f, dimensions: e.target.value }))} /></div>
          <div>
            <label className="block font-semibold text-sm mb-1">Color</label>
            <input className="w-full rounded-lg border border-black px-3 py-2 bg-white"
              placeholder="e.g., Midnight Blue"
              value={form.color}
              onChange={e => setForm((f) => ({ ...f, color: toCapitalWords(e.target.value) }))} /></div>
          <div>
            <label className="block font-semibold text-sm mb-1">Visibility</label>
            <select className="w-full rounded-lg border border-black px-3 py-2 bg-white"
              value={form.published ? "published" : "draft"}
              onChange={e => setForm((f) => ({ ...f, published: e.target.value === "published" }))}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select></div>
          <div>
            <label className="block font-semibold text-sm mb-1">In Stock</label>
            <select className="w-full rounded-lg border border-black px-3 py-2 bg-white"
              value={form.inStock ? "true" : "false"}
              onChange={e => setForm((f) => ({ ...f, inStock: e.target.value === "true" }))}>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select></div>
          <div>
            <label className="block font-semibold text-sm mb-1">Featured</label>
            <select className="w-full rounded-lg border border-black px-3 py-2 bg-white"
              value={form.featured ? "true" : "false"}
              onChange={e => setForm((f) => ({ ...f, featured: e.target.value === "true" }))}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select></div>
          <div className="col-span-full">
            <label className="block font-semibold text-sm mb-1 items-center gap-1"><Info size={14} />Description</label>
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
                  <div key={`img-${i}`} className="relative w-20 h-20 rounded-lg border border-black overflow-hidden">
                    <img src={src} alt={`img-${i}`} className="object-cover w-full h-full" />
                    <button type="button"
                      className="absolute top-1 right-1 rounded-full bg-white border border-black text-black w-6 h-6 flex items-center justify-center font-bold hover:bg-black hover:text-white"
                      onClick={() => removeImageAt(i)} aria-label="Remove image">×</button>
                  </div>
                ))}
              <label className="inline-flex items-center gap-2 rounded-lg border border-black px-3 py-2 font-semibold cursor-pointer bg-white">
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} disabled={uploadingImgs} hidden />
                <ImageIcon size={18} />
                {uploadingImgs ? "Uploading…" : "Add Images"}
              </label>
            </div>
          </div>
          <div className="col-span-full flex flex-col sm:flex-row gap-2 mt-2">
            <button type="submit" className="btn-mono-sm flex items-center gap-2">{editingId ? <Edit size={16} /> : <Plus size={16} />}{editingId ? "Update" : "Create"}</button>
            <button type="button" className="btn-mono-sm" onClick={resetForm}>Reset</button>
          </div>
        </form>
      </motion.div>

      {/* PRODUCT CARD GRID */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-7">
        {products.map((p) => {
          const cover = firstUrl(p);
          const priceNum = Number(p.price || 0);
          const sale = p.salePrice !== null ? Number(p.salePrice) : null;
          return (
            <div key={p.id} className="relative bg-white border border-black/10 shadow rounded-2xl p-4 flex flex-col group min-h-[360px]">
              <div>
                <div className="relative">
                  {cover ? (
                    <img src={cover} alt={p.title}
                      className="object-cover w-full rounded-lg border border-black mb-2 h-40"
                      onError={handleImgError}
                    />
                  ) : (
                    <div className="flex items-center justify-center bg-gray-100 text-gray-400 h-40 rounded-lg border border-black mb-2">
                      <ImageIcon size={30} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button className="btn-mono-sm" onClick={() => editProduct(p.id)} title="Edit" type="button"><Edit size={16} /></button>
                    <button className="btn-mono-sm" onClick={() => deleteProduct(p.id)} title="Delete" type="button"><Trash2 size={16} /></button>
                    <button className="btn-mono-sm" onClick={() => { setActive(p); setSlide(0); setOpen(true); }} title="Expand" type="button"><Maximize2 size={16} /></button>
                  </div>
                </div>
                <div className="font-black text-lg mb-1 mt-2 line-clamp-1 text-black">{p.title}</div>
                <div className="text-xs text-gray-700 mb-1">{p.category}{p.subcategory && " / " + p.subcategory}{p.subsubcategory && " / " + p.subsubcategory}</div>
                <div className="flex gap-3 flex-wrap text-gray-700 text-sm mb-1">
                  <span>
                    {sale !== null ? (
                      <>
                        <span className="line-through text-gray-400 mr-1">${priceNum}</span>
                        <span className="font-semibold text-black">${sale}</span>
                      </>
                    ) : (
                      <span className="font-semibold">${priceNum}</span>
                    )}
                  </span>
                  <span>Stock: {p.stock}</span>
                  <span>{p.color}</span>
                  <span>{p.featured ? "⭐" : ""}</span>
                </div>
                <div className="line-clamp-2 text-gray-700 text-xs mt-0.5">{p.description}</div>
              </div>
              <div className="flex gap-1 mt-3">
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold border border-black ${p.published ? "bg-black text-white" : "bg-white text-black"}`}>{p.published ? "Published" : "Draft"}</span>
                {p.featured && <span className="rounded-full px-3 py-0.5 text-xs font-bold border border-black bg-white text-black">Featured</span>}
                {(!p.inStock || Number(p.stock || 0) === 0) && <span className="rounded-full px-3 py-0.5 text-xs font-bold border border-black bg-white text-black">Out</span>}
              </div>
            </div>
          );
        })}
        {!loading && products.length === 0 && (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-center col-span-full text-gray-500 font-semibold">
            No products yet.
          </div>
        )}
      </div>
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
        .btn-mono-sm:hover, .btn-mono-sm:focus {
          background: #000;
          color: #fff;
        }
        .btn-mono-sm:active { transform: scale(0.97); }
        .btn-mono-sm:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
