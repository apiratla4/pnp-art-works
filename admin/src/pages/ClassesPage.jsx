import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Image as ImageIcon, DollarSign, Calendar, Users, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const CLASSES_URL = `${API_BASE}/api/classes`;

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

axios.defaults.withCredentials = true;

const EMPTY_CLASS = {
  id: "",
  title: "",
  mode: "Online",
  startDate: "",
  durationWeeks: 4,
  seats: 10,
  price: "",
  level: "Beginner",
  cover: "",
  description: "",
  published: true
};

const mapClassFromApi = (doc) => ({
  id: doc._id,
  title: doc.title || "",
  mode: doc.mode || "Online",
  startDate: doc.startDate || "",
  durationWeeks: typeof doc.durationWeeks === "number" ? doc.durationWeeks : 4,
  seats: typeof doc.seats === "number" ? doc.seats : 10,
  price: typeof doc.price === "number" ? doc.price : 0,
  level: doc.level || "Beginner",
  cover: doc.cover || "",
  description: doc.description || "",
  published: !!doc.published
});

const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

async function uploadToCloudinary(file, folder = "pnpart/ecommerce/classes") {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary env missing (VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET)");
  }
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }
  return { url: data.secure_url, publicId: data.public_id };
}

const ClassesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(EMPTY_CLASS);

  const [coverPreview, setCoverPreview] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(CLASSES_URL, { withCredentials: true });
      const list = Array.isArray(res.data?.items) ? res.data.items.map(mapClassFromApi) : [];
      setItems(list);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.status === 404 ? "Route not found (/api/classes)" : "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCoverFile = async (file) => {
    if (!file) {
      setCoverPreview(form.cover ? form.cover : "");
      setForm((f) => ({ ...f, cover: "" }));
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    try {
      setUploadingCover(true);
      setCoverPreview(URL.createObjectURL(file));
      const { url } = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, cover: url }));
      setCoverPreview(url);
      toast.success("Cover uploaded");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Cloudinary upload failed");
    } finally {
      setUploadingCover(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_CLASS);
    setEditingId("");
    setCoverPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const saveClass = async (e) => {
    e?.preventDefault?.();
    if (!form.title.trim()) { toast.warning("Class title is required"); return; }
    if (!form.startDate) { toast.warning("Start date is required"); return; }
    try {
      const payload = {
        title: form.title,
        mode: form.mode,
        startDate: form.startDate,
        durationWeeks: Number(form.durationWeeks || 1),
        seats: Number(form.seats || 1),
        price: form.price ? Number(form.price) : 0,
        level: form.level,
        cover: form.cover,
        description: form.description || "",
        published: !!form.published
      };
      if (editingId) {
        const res = await axios.put(`${CLASSES_URL}/${editingId}`, payload, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        });
        const updated = mapClassFromApi(res.data);
        setItems((arr) => arr.map((it) => (it.id === editingId ? updated : it)));
        toast.success("Class updated");
      } else {
        const res = await axios.post(CLASSES_URL, payload, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        });
        const created = mapClassFromApi(res.data);
        setItems((arr) => [created, ...arr]);
        toast.success("Class created");
      }
      resetForm();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.status === 404 ? "Route not found (/api/classes)" : "Failed to save class");
    }
  };

  const editClass = (id) => {
    const found = items.find((c) => c.id === id);
    if (!found) return;
    setEditingId(id);
    setForm({ ...found });
    setCoverPreview(found.cover || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteClass = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      await axios.delete(`${CLASSES_URL}/${id}`, { withCredentials: true });
      setItems((arr) => arr.filter((c) => c.id !== id));
      if (editingId === id) resetForm();
      toast.success("Class deleted");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.status === 404 ? "Route not found (/api/classes/:id)" : "Failed to delete class");
    }
  };

  // Responsive card design for listing classes, replaces table
  return (
    <div className="max-w-6xl mx-auto w-full p-2">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-3">
        <div>
          <h1 className="text-2xl font-black mb-0 text-black">Art Classes</h1>
          <small className="text-gray-800">Create and manage upcoming classes</small>
        </div>
        {loading && <span className="text-sm text-gray-600">Loading…</span>}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl shadow bg-white mb-6"
      >
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-4 text-black">
            {editingId ? "Edit Art Class" : "Add New Art Class"}
          </h2>
          <form onSubmit={saveClass} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full rounded-lg border-black border px-3 py-2 bg-white focus:ring-2 focus:ring-black"
                placeholder="e.g., Acrylic Basics Weekend"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            {/* Mode */}
            <div>
              <label className="block text-sm font-medium mb-1">Mode</label>
              <select
                className="w-full rounded-lg border-black border px-3 py-2 bg-white focus:ring-2 focus:ring-black"
                value={form.mode}
                onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}
              >
                <option>Online</option>
                <option>Studio</option>
              </select>
            </div>
            {/* Start date */}
            <div>
              <label className="block text-sm font-medium mb-1 items-center gap-1">
                <Calendar size={14} /> Start Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border-black border px-3 py-2 bg-white focus:ring-2 focus:ring-black"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                required
              />
            </div>
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-1">Duration (weeks)</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-lg border-black border px-3 py-2 bg-white focus:ring-2 focus:ring-black"
                value={form.durationWeeks}
                onChange={(e) => setForm((f) => ({ ...f, durationWeeks: Number(e.target.value || 1) }))}
              />
            </div>
            {/* Seats */}
            <div>
              <label className="block text-sm font-medium mb-1 items-center gap-1">
                <Users size={14} /> Seats
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-lg border-black border px-3 py-2 bg-white focus:ring-2 focus:ring-black"
                value={form.seats}
                onChange={(e) => setForm((f) => ({ ...f, seats: Number(e.target.value || 1) }))}
              />
            </div>
            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-1 items-center gap-1">
                <DollarSign size={14} /> Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border-black border px-3 py-2 bg-white focus:ring-2 focus:ring-black"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            {/* Level */}
            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select
                className="w-full rounded-lg border-black border px-3 py-2 bg-white focus:ring-2 focus:ring-black"
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            {/* Cover image */}
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1">Cover Image</label>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="inline-flex items-center gap-1 px-3 py-1 border border-black rounded-lg cursor-pointer bg-white font-medium">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleCoverFile(e.target.files?.[0] || null)}
                  />
                  <ImageIcon size={18} />
                  {uploadingCover ? "Uploading…" : "Choose image"}
                </label>
                {(coverPreview || form.cover) && (
                  <img
                    src={coverPreview || form.cover}
                    alt="cover preview"
                    className="w-24 h-24 object-cover rounded-lg border border-black"
                  />
                )}
                {(coverPreview || form.cover) && (
                  <button
                    type="button"
                    className="btn-mono-sm"
                    onClick={() => handleCoverFile(null)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <small className="block mt-1 text-gray-600">
                JPG/PNG/WEBP up to 10MB; uploaded to Cloudinary and saved by URL.
              </small>
            </div>
            {/* Description */}
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border-black border px-3 py-2 bg-white focus:ring-2 focus:ring-black"
                rows={3}
                placeholder="Outline, materials, and outcomes."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            {/* Published */}
            <div>
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <select
                className="w-full rounded-lg border-black border px-3 py-2 bg-white focus:ring-2 focus:ring-black"
                value={form.published ? "published" : "draft"}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.value === "published" }))}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 col-span-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-mono-sm flex items-center justify-center gap-2"
                disabled={uploadingCover}
              >
                {editingId ? <Edit size={18} /> : <Plus size={18} />}
                {editingId ? "Update Class" : "Create Class"}
              </motion.button>
              <button
                type="button"
                className="btn-mono-sm"
                onClick={resetForm}
                disabled={uploadingCover}
              >Reset</button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Modern Cards for Class List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {items.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl shadow-md border border-black/10 bg-white flex flex-col p-4 gap-2"
          >
            <div className="flex items-center gap-3 mb-2">
              {c.cover ? (
                <img
                  src={c.cover}
                  alt={c.title}
                  className="w-16 h-16 object-cover rounded-lg border border-black"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg border border-black flex items-center justify-center bg-white">
                  <ImageIcon size={20} className="text-gray-400" />
                </div>
              )}
              <div className="flex flex-col">
                <div className="font-bold text-lg text-black line-clamp-1">{c.title}</div>
                <div className="text-sm text-gray-500">{c.mode} · {c.level}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-gray-800 font-medium items-center text-sm">
              <span><Calendar size={14} className="inline mr-1" /> {c.startDate || "-"}</span>
              <span><Users size={14} className="inline mr-1" /> {c.seats} Seats</span>
              <span><DollarSign size={14} className="inline mr-1" />{fmtUSD.format(Number(c.price))}</span>
              <span>Duration: {c.durationWeeks} wks</span>
              <span className={`${c.published ? "bg-black text-white" : "bg-gray-300 text-black"} rounded-full px-3 py-0.5 text-xs font-bold`}>
                {c.published ? "Published" : "Draft"}
              </span>
            </div>
            <div className="line-clamp-3 text-gray-700 text-sm mb-1">
              {c.description}
            </div>
            <div className="flex gap-2 mt-auto">
              <button className="btn-mono-sm" onClick={() => editClass(c.id)}>
                <Edit size={16} className="inline" /> <span className="sr-only">Edit</span>
              </button>
              <button className="btn-mono-sm" onClick={() => deleteClass(c.id)}>
                <Trash2 size={16} className="inline" /> <span className="sr-only">Delete</span>
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-center col-span-full text-gray-500 font-semibold">
            No classes yet.
          </div>
        )}
      </div>
      {/* Monochrome button class */}
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
      `}</style>
    </div>
  );
};

export default ClassesPage;
