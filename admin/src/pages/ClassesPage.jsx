import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Image as ImageIcon, DollarSign, Calendar, Users, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import "./ClassesPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const CLASSES_URL = `${API_BASE}/api/classes`;

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

axios.defaults.withCredentials = true;

const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const MODES = ["Online", "Studio"];

const EMPTY_CLASS = {
  id: "", title: "", mode: "Online", startDate: "",
  durationWeeks: 4, seats: 10, price: "", level: "Beginner",
  cover: "", description: "", published: true
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

async function uploadToCloudinary(file, folder = "pnpart/ecommerce/classes") {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error("Cloudinary env missing");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || !data.secure_url) throw new Error(data?.error?.message || "Cloudinary upload failed");
  return { url: data.secure_url, publicId: data.public_id };
}

export default function ClassesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(EMPTY_CLASS);
  const [coverPreview, setCoverPreview] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(CLASSES_URL, { withCredentials: true });
      setItems(Array.isArray(res.data?.items) ? res.data.items.map(mapClassFromApi) : []);
    } catch (e) {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

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
      toast.error(e.message || "Cloudinary upload failed");
    } finally {
      setUploadingCover(false);
    }
  };
  const resetForm = () => {
    setForm(EMPTY_CLASS); setEditingId(""); setCoverPreview(""); if (fileRef.current) fileRef.current.value = "";
  };

  const saveClass = async (e) => {
    e?.preventDefault?.();
    if (!form.title.trim()) return toast.warning("Class title is required");
    if (!form.startDate) return toast.warning("Start date is required");
    try {
      const payload = {
        title: form.title, mode: form.mode, startDate: form.startDate,
        durationWeeks: Number(form.durationWeeks || 1), seats: Number(form.seats || 1),
        price: form.price ? Number(form.price) : 0, level: form.level,
        cover: form.cover, description: form.description || "", published: !!form.published
      };
      if (editingId) {
        const res = await axios.put(`${CLASSES_URL}/${editingId}`, payload, { withCredentials: true, headers: { "Content-Type": "application/json" } });
        const updated = mapClassFromApi(res.data); setItems(arr => arr.map(it => it.id === editingId ? updated : it)); toast.success("Class updated");
      } else {
        const res = await axios.post(CLASSES_URL, payload, { withCredentials: true, headers: { "Content-Type": "application/json" } });
        const created = mapClassFromApi(res.data); setItems(arr => [created, ...arr]); toast.success("Class created");
      }
      resetForm();
    } catch { toast.error("Failed to save class"); }
  };

  const editClass = (id) => {
    const found = items.find((c) => c.id === id);
    if (!found) return;
    setEditingId(id); setForm({ ...found }); setCoverPreview(found.cover || ""); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteClass = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      await axios.delete(`${CLASSES_URL}/${id}`, { withCredentials: true });
      setItems(arr => arr.filter(c => c.id !== id));
      if (editingId === id) resetForm();
      toast.success("Class deleted");
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="classes-page-modern">
      <header>
        <h1>
          <Users size={28} /> Art Classes  
          <span className="badge">{items.length}</span>
        </h1>
        <span className="page-description">
          Manage your online and studio classes
        </span>
        {loading && <span className="page-loading">Loading…</span>}
      </header>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="class-form-modern">
        <h2>{editingId ? "Edit Class" : "Create New Class"}</h2>
        <form onSubmit={saveClass}>
          <div className="form-modern-grid">
            <div>
              <label>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Acrylic Basics" required />
            </div>
            <div>
              <label>Mode</label>
              <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                {MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label><Calendar size={13}/> Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
            </div>
            <div>
              <label>Duration (weeks)</label>
              <input type="number" min="1" value={form.durationWeeks} onChange={e => setForm(f => ({ ...f, durationWeeks: Number(e.target.value || 1) }))}/>
            </div>
            <div>
              <label><Users size={13}/> Seats</label>
              <input type="number" min="1" value={form.seats} onChange={e => setForm(f => ({ ...f, seats: Number(e.target.value || 1) }))}/>
            </div>
            <div>
              <label><DollarSign size={13}/> Price</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}/>
            </div>
            <div>
              <label>Level</label>
              <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label>Visibility</label>
              <select value={form.published ? "published" : "draft"} onChange={e => setForm(f => ({ ...f, published: e.target.value === "published" }))}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <label>Cover Image</label>
          <div className="cover-modern-row">
            <label className="img-uploader">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleCoverFile(e.target.files?.[0] || null)}/>
              <ImageIcon size={18}/>{uploadingCover ? "Uploading…" : "Choose image"}
            </label>
            {(coverPreview || form.cover) && (
              <img src={coverPreview || form.cover} alt="cover preview" className="cover-preview-modern"/>
            )}
            {(coverPreview || form.cover) && (
              <button type="button" className="mono-btn mono-btn-sm" onClick={() => handleCoverFile(null)}>Remove</button>
            )}
          </div>
          <label>Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="class-desc-ta"/>
          <div className="action-row-modern">
            <button className="btn-primary" type="submit" disabled={uploadingCover}>
              {editingId ? <Edit size={18}/> : <Plus size={18}/>}
              {editingId ? "Update Class" : "Create Class"}
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm} disabled={uploadingCover}>Reset</button>
          </div>
        </form>
      </motion.div>

      {/* Card Grid */}
      <div className="classes-card-grid">
        {items.map((c) =>
          <motion.div key={c.id} className="class-card" whileHover={{ y: -3, boxShadow: "0 3px 18px #a4abc3cc" }}>
            <div className="class-thumb-wrap">
              {c.cover
                ? <img src={c.cover} alt={c.title} className="class-thumb-img"/>
                : <div className="class-thumb-placeholder"><ImageIcon size={30}/></div>
              }
            </div>
            <div className="class-card-content">
              <div className="class-title">{c.title}</div>
              <div className="class-meta">
                <span className="chip">{c.mode}</span>
                <span className="chip">{c.level}</span>
                <span className="chip">{c.published ? "Published" : "Draft"}</span>
              </div>
              <div className="class-description">{c.description || "-"}</div>
              <div className="class-row">
                <span><Users size={14}/> {c.seats} seats</span>
                <span><Calendar size={14}/> {c.startDate}</span>
              </div>
              <div className="class-price-row">
                <span className="class-price">{fmtUSD.format(Number(c.price) || 0)}</span>
                <span>{c.durationWeeks} weeks</span>
              </div>
              <div className="class-actions-row">
                <button className="mono-btn mono-btn-sm" onClick={() => editClass(c.id)}><Edit size={16}/></button>
                <button className="mono-btn mono-btn-sm" onClick={() => deleteClass(c.id)}><Trash2 size={16}/></button>
              </div>
            </div>
          </motion.div>
        )}
        {items.length === 0 && !loading && (
          <div className="classes-empty-state">
            <ImageIcon size={48}/>
            <p>No classes yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
