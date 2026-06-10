import React, { useEffect, useRef, useState } from "react";
import { Edit, Trash2, Image as ImageIcon, Plus, Save, X } from "lucide-react";
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
  const [showForm, setShowForm] = useState(false);
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
    setShowForm(false);
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
    setShowForm(true);
    const main = document.querySelector("main");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
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
          <div className="flex items-center gap-3">
            {loading && <span className="text-sm text-gray-600">Loading…</span>}
            <button
              type="button"
              className="btn-mono-sm flex items-center gap-2"
              onClick={() => {
                if (showForm && !editingId) {
                  setShowForm(false);
                  setForm(EMPTY_CLASS);
                } else {
                  setForm(EMPTY_CLASS);
                  setEditingId("");
                  setCoverPreview("");
                  setFormError("");
                  setShowForm(true);
                }
              }}
            >
              {showForm && !editingId ? <X size={16} /> : <Plus size={16} />}
              {showForm && !editingId ? "Cancel" : "Add Class"}
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <form
            className="rounded-2xl shadow bg-white mb-6 px-6 py-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7"
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
            <div className="col-span-full flex gap-3 pt-1 items-center flex-wrap">
              <button
                type="submit"
                className="btn-mono-sm flex items-center gap-2 font-bold"
                disabled={loading || uploadingCover}
              >
                <Save size={16} />
                {editingId ? "Update Class" : "Add Class"}
              </button>
              <button type="button" className="btn-mono-sm" onClick={resetForm} disabled={loading || uploadingCover}>
                Cancel
              </button>
              {formError && <div className="text-sm text-red-600 font-bold">{formError}</div>}
            </div>
          </form>
        )}

        {/* Classes Table */}
        {loading && items.length === 0 ? (
          <div className="py-20 text-gray-400 text-center text-xl">Loading classes...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 text-center text-gray-500 py-20">
            <ImageIcon size={64} className="mx-auto mb-4" />
            <h3 className="font-black text-lg">No classes found</h3>
            <p>Click "Add Class" to get started</p>
          </div>
        ) : (
          <div className="rounded-2xl shadow bg-white overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50 text-left">
                    <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Cover</th>
                    <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Class</th>
                    <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Schedule</th>
                    <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Price / Seats</th>
                    <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Status</th>
                    <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5">
                        {c.cover ? (
                          <img
                            src={c.cover}
                            alt={c.title}
                            className="w-12 h-12 object-cover rounded-lg border border-black/20 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-black/20 flex items-center justify-center bg-gray-100 flex-shrink-0">
                            <ImageIcon size={16} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 min-w-[160px]">
                        <div className="font-bold text-black leading-tight">{c.title || "Untitled"}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{c.level} • {c.mode}</div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="text-sm">{c.startDate || "—"}</div>
                        <div className="text-xs text-gray-500">{c.durationWeeks} wks</div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="font-semibold">{fmtUSD.format(Number(c.price))}</div>
                        <div className="text-xs text-gray-500">{c.seats} seats</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold border ${c.published ? "bg-black text-white border-black" : "bg-white text-black border-black"}`}>
                          {c.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1.5 justify-end">
                          <button className="btn-mono-sm" onClick={() => startEdit(c)} title="Edit">
                            <Edit size={14} />
                          </button>
                          <button className="btn-mono-sm" onClick={() => deleteClass(c.id)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        `}</style>
      </div>
    </div>
  );
};

export default ClassesPage;
