import React, { useEffect, useRef, useState } from "react";
import { Edit, Trash2, Image as ImageIcon, DollarSign, Calendar, Users, Plus, Save } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const CLASSES_URL = `${API_BASE}/api/classes`;

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

axios.defaults.withCredentials = true;

const levels = ["Beginner", "Intermediate", "Advanced"];
const modes = ["Online", "Studio"];

const EMPTY_CLASS = {
  id: "",
  title: "",
  mode: modes[0],
  startDate: "",
  durationWeeks: 4,
  seats: 10,
  price: "",
  level: levels[0],
  cover: "",
  description: "",
  published: true
};

const mapClassFromApi = (doc) => ({
  id: doc._id,
  title: doc.title || "",
  mode: doc.mode || modes[0],
  startDate: doc.startDate || "",
  durationWeeks: typeof doc.durationWeeks === "number" ? doc.durationWeeks : 4,
  seats: typeof doc.seats === "number" ? doc.seats : 10,
  price: typeof doc.price === "number" ? doc.price : 0,
  level: doc.level || levels[0],
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

const inputStyle = "w-full rounded-lg border-black border px-3 py-2 bg-white focus:ring-2 focus:ring-black outline-none";

const ClassesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(EMPTY_CLASS);
  const [editingId, setEditingId] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileRef = useRef(null);
  const [formError, setFormError] = useState("");

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
      setCoverPreview("");
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
      setCoverPreview("");
      toast.error(e.message || "Cloudinary upload failed");
    } finally {
      setUploadingCover(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_CLASS);
    setEditingId("");
    setCoverPreview("");
    setFormError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const saveClass = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) { setFormError("Class title is required"); return; }
    if (!form.startDate) { setFormError("Start date is required"); return; }
    try {
      setLoading(true);
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
      let res;
      if (editingId) {
        res = await axios.put(`${CLASSES_URL}/${editingId}`, payload, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        });
        const updated = mapClassFromApi(res.data);
        setItems((arr) => arr.map((it) => (it.id === editingId ? updated : it)));
        toast.success("Class updated");
      } else {
        res = await axios.post(CLASSES_URL, payload, {
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
      setFormError(e?.response?.status === 404 ? "Route not found (/api/classes)" : "Failed to save class");
      toast.error("Failed to save class");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item });
    setCoverPreview(item.cover || "");
    setFormError("");
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

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="max-w-6xl mx-auto w-full p-2 flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black mb-0 text-black">Classes Management</h1>
            <p className="text-gray-700 mt-1">Create and manage upcoming art classes and workshops</p>
          </div>
        </div>
        {/* Add/Edit Form */}
        <form className="rounded-2xl shadow bg-white mb-6 px-6 py-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7"
          autoComplete="off"
          onSubmit={saveClass}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Title<span className="text-red-500">*</span></label>
            <input
              className={inputStyle}
              placeholder="e.g., Watercolor Mastery"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mode</label>
            <select
              className={inputStyle}
              value={form.mode}
              onChange={(e) => setForm(f => ({ ...f, mode: e.target.value }))}
            >
              {modes.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              className={inputStyle}
              value={form.level}
              onChange={(e) => setForm(f => ({ ...f, level: e.target.value }))}
            >
              {levels.map(lvl => <option key={lvl}>{lvl}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date<span className="text-red-500">*</span></label>
            <input
              type="date"
              className={inputStyle}
              value={form.startDate}
              onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (wks)</label>
            <input
              type="number"
              min="1"
              className={inputStyle}
              value={form.durationWeeks}
              onChange={(e) => setForm(f => ({ ...f, durationWeeks: Number(e.target.value || 1) }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Seats</label>
            <input
              type="number"
              min="1"
              className={inputStyle}
              value={form.seats}
              onChange={(e) => setForm(f => ({ ...f, seats: Number(e.target.value || 1) }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputStyle}
              value={form.price}
              onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <select
              className={inputStyle}
              value={form.published ? "published" : "draft"}
              onChange={(e) => setForm(f => ({ ...f, published: e.target.value === "published" }))}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
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
                  className="w-20 h-20 object-cover rounded-lg border border-black"
                />
              )}
              {(coverPreview || form.cover) && (
                <button
                  type="button"
                  className="btn-mono-sm"
                  onClick={() => handleCoverFile(null)}
                >Remove</button>
              )}
            </div>
          </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className={inputStyle}
              rows={2}
              placeholder="Outline, materials, and outcomes."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="col-span-full flex gap-3 pt-1">
            <button
              type="submit"
              className="btn-mono-sm flex items-center gap-2 font-bold"
              disabled={loading || uploadingCover}
            >
              <Save size={16} />
              {editingId ? "Update Class" : "Add Class"}
            </button>
            <button type="button" className="btn-mono-sm" onClick={resetForm} disabled={loading || uploadingCover}>
              Reset
            </button>
            {formError && <div className="text-sm text-red-600 font-bold pt-2">{formError}</div>}
          </div>
        </form>
        {/* Cards */}
        {loading && items.length === 0 ? (
          <div className="py-20 text-gray-400 text-center text-xl">Loading classes...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 text-center text-gray-500 py-20">
            <ImageIcon size={64} className="mx-auto mb-4" />
            <h3 className="font-black text-lg">No classes found</h3>
            <p>Start by adding your first class</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 pb-5">
            {items.map((c) => (
              <div
                key={c.id}
                className="flex flex-col rounded-2xl shadow border border-black/10 bg-white p-4 h-full relative"
              >
                <div className="flex gap-3 mb-2 items-center">
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
                  <div className="flex flex-col flex-1">
                    <span className="text-xs uppercase font-bold tracking-tight text-gray-700 mb-0.5">{c.level || "—"}</span>
                    <h6 className="text-black font-bold text-lg mb-1 truncate">{c.title || "Untitled"}</h6>
                    <div className="text-xs text-gray-500">{c.mode} | {c.seats} seats | {c.startDate}</div>
                  </div>
                  <div className="flex gap-1 z-10">
                    <button className="btn-mono-sm" onClick={() => startEdit(c)} title="Edit"><Edit size={16} /></button>
                    <button className="btn-mono-sm" onClick={() => deleteClass(c.id)} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-gray-800 font-medium items-center text-sm py-1">
                  <span><Calendar size={14} className="inline mr-1" /> {c.startDate || "-"}</span>
                  <span><Users size={14} className="inline mr-1" /> {c.seats} Seats</span>
                  <span><DollarSign size={14} className="inline mr-1" />{fmtUSD.format(Number(c.price))}</span>
                  <span>Duration: {c.durationWeeks} wks</span>
                  <span className={`${c.published ? "bg-black text-white" : "bg-gray-300 text-black"} rounded-full px-3 py-0.5 text-xs font-bold`}>
                    {c.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="line-clamp-2 text-gray-700 text-sm mb-1">{c.description}</div>
              </div>
            ))}
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
          .btn-mono-sm:hover, .btn-mono-sm:focus {
            background: #000;
            color: #fff;
          }
          .btn-mono-sm:active { transform: scale(0.97); }
          .btn-mono-sm:focus-visible {
            outline: none;
            box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
          }
          .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        `}</style>
      </div>
    </div>
  );
};

export default ClassesPage;
