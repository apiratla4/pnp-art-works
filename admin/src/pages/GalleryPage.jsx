
import React, { useEffect, useState } from "react";
import { Image as ImageIcon, Trash2, Plus, Pencil, Save, X, Upload } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import "../pages/admin.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const GALLERY_URL = `${API_BASE}/api/gallery`;

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

axios.defaults.withCredentials = true;

async function uploadToCloudinary(file, folder = "pnpart/gallery") {
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

const categories = ["Paintings", "Handcrafted Items", "Exhibitions", "Other"];
const fallbackImg = `data:image/svg+xml;charset=UTF-8,` + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
     <rect width="100%" height="100%" fill="#f6f6f6"/>
     <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999999" font-size="16" font-family="Arial">
       Image
     </text>
   </svg>`
);

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    category: "Paintings",
    year: new Date().getFullYear(),
    medium: "",
    description: "",
    file: null
  });

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "Paintings",
    year: new Date().getFullYear(),
    medium: "",
    description: "",
    replaceFile: null
  });

  // Close on Escape
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        if (addOpen) setAddOpen(false);
        if (editOpen) setEditOpen(false);
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [addOpen, editOpen]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(GALLERY_URL, { withCredentials: true });
      const list = Array.isArray(res.data?.items) ? res.data.items : [];
      setItems(list);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setAddForm({
      title: "",
      category: "Paintings",
      year: new Date().getFullYear(),
      medium: "",
      description: "",
      file: null
    });
    setAddOpen(true);
  };

  const submitAdd = async () => {
    try {
      if (!addForm.file) return toast.error("Please select an image");
      setLoading(true);

      // 1) Upload to Cloudinary
      const { url, publicId } = await uploadToCloudinary(addForm.file);

      // 2) Build full metadata item
      const item = {
        title: addForm.title?.trim() || "Untitled",
        category: addForm.category || "Paintings",
        year: Number(addForm.year) || new Date().getFullYear(),
        medium: addForm.medium || "",
        description: addForm.description || "",
        src: url,
        cloudinaryPublicId: publicId,
        tags: []
      };

      // 3) Preferred POST shape: items[]
      let res;
      try {
        res = await axios.post(GALLERY_URL, { items: [item] }, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        });
      } catch (err) {
        // 4) Fallback: images + meta
        if (err?.response?.status === 400) {
          res = await axios.post(GALLERY_URL, {
            images: [{ url, publicId }],
            meta: {
              title: item.title,
              category: item.category,
              year: item.year,
              medium: item.medium,
              description: item.description,
              tags: item.tags
            }
          }, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
          });
        } else {
          throw err;
        }
      }

      const created = Array.isArray(res.data?.items) ? res.data.items : [];
      setItems((prev) => [...created, ...prev]);
      setAddOpen(false);
      toast.success("Gallery item added");
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || e?.message || "Add failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditItem(item);
    setEditForm({
      title: item.title || "Untitled",
      category: item.category || "Paintings",
      year: item.year || new Date().getFullYear(),
      medium: item.medium || "",
      description: item.description || "",
      replaceFile: null
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editItem?._id) return toast.error("Invalid item id");
    try {
      setLoading(true);
      let body = {
        title: editForm.title?.trim() || "Untitled",
        category: editForm.category || "Paintings",
        year: Number(editForm.year) || new Date().getFullYear(),
        medium: editForm.medium || "",
        description: editForm.description || ""
      };

      // Optional image replacement
      if (editForm.replaceFile) {
        const { url, publicId } = await uploadToCloudinary(editForm.replaceFile);
        body = { ...body, src: url, cloudinaryPublicId: publicId, oldPublicId: editItem.cloudinaryPublicId || "" };
      }

      const { data } = await axios.patch(`${GALLERY_URL}/${editItem._id}`, body, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      setItems((arr) => arr.map((g) => (String(g._id) === String(editItem._id) ? { ...g, ...data } : g)));
      setEditOpen(false);
      setEditItem(null);
      toast.success("Updated");
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const removeAt = async (id) => {
    try {
      await axios.delete(`${GALLERY_URL}/${encodeURIComponent(id)}`, { withCredentials: true });
      setItems((arr) => arr.filter((g) => String(g._id) !== String(id)));
      toast.success("Image removed");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="h4 fw-bold mb-0" style={{ color: "#000" }}>Gallery</h1>
          <small style={{ color: "#000" }}>Upload and manage images shown on the public gallery</small>
        </div>
        <button type="button" className="mono-btn d-inline-flex align-items-center gap-2" onClick={openAdd} disabled={loading}>
          <Plus size={18} /> {loading ? "Working…" : "Add item"}
        </button>
      </div>

      {/* Grid */}
      <div className="d-flex flex-wrap gap-2">
        {items.map((g, i) => {
          const key = g._id || g.src || g.url || i;
          const src = g.src || g.url || fallbackImg;
          return (
            <div
              className="position-relative"
              key={key}
              style={{ width: 170, height: 170, borderRadius: 12, overflow: "hidden", background: "#fff", border: "1px solid #000" }}
            >
              <img
                src={src}
                alt={g.title || `gallery-${i}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => { e.currentTarget.src = fallbackImg; }}
              />
              <div className="position-absolute top-0 end-0 m-2 d-flex gap-1">
                <button type="button" className="mono-btn mono-btn-sm" title="Edit" onClick={() => startEdit(g)}>
                  <Pencil size={16} />
                </button>
                <button type="button" className="mono-btn mono-btn-sm" title="Delete" onClick={() => removeAt(g._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <span className="mono-badge position-absolute bottom-0 start-0 m-2">{g.category || "—"}</span>
            </div>
          );
        })}
        {items.length === 0 && !loading && (
          <div className="small d-flex align-items-center gap-2" style={{ color: "#000" }}>
            <ImageIcon size={16} /> No images yet.
          </div>
        )}
      </div>

      {/* Add Modal */}
      {addOpen && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
          <div
            className="modal fade show"
            style={{ display: "block", zIndex: 1055 }}
            onClick={() => setAddOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-md modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content position-relative" style={{ background: "#fff", color: "#000" }}>
                <button
                  type="button"
                  aria-label="Close"
                  className="mono-btn mono-btn-sm btn-modal-close"
                  style={{ top: 8, right: 8, position: 'absolute', cursor: 'pointer', zIndex: 2, pointerEvents: 'auto' }}
                  onClick={() => setAddOpen(false)}
                  title="Close"
                >
                  <X size={16} />
                </button>
                <div className="modal-body p-4">
                  <h2 className="h5 fw-bold mb-3" style={{ color: "#000" }}>Add Gallery Item</h2>
                  <div className="vstack gap-3">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small fw-semibold" style={{ color: "#000" }}>Title</label>
                        <input className="form-control" value={addForm.title} onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))} />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold" style={{ color: "#000" }}>Category</label>
                        <select className="form-select" value={addForm.category} onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}>
                          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold" style={{ color: "#000" }}>Year</label>
                        <input type="number" className="form-control" value={addForm.year} onChange={(e) => setAddForm((f) => ({ ...f, year: Number(e.target.value || new Date().getFullYear()) }))} />
                      </div>
                    </div>
                    <div>
                      <label className="form-label small fw-semibold" style={{ color: "#000" }}>Medium</label>
                      <input className="form-control" value={addForm.medium} onChange={(e) => setAddForm((f) => ({ ...f, medium: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold" style={{ color: "#000" }}>Description</label>
                      <textarea className="form-control" rows={4} value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold" style={{ color: "#000" }}>Image</label>
                      <div className="border rounded-3 p-3 d-flex align-items-center justify-content-between" style={{ borderColor: "#000" }}>
                        <input type="file" accept="image/*" onChange={(e) => setAddForm((f) => ({ ...f, file: e.target.files?.[0] || null }))} />
                        <div className="small d-flex align-items-center gap-2" style={{ color: "#000" }}>
                          <Upload size={16} /> {addForm.file ? addForm.file.name : "Select an image"}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button type="button" className="mono-btn d-inline-flex align-items-center gap-2" onClick={submitAdd} disabled={loading}>
                        <Save size={16} /> {loading ? "Saving…" : "Add item"}
                      </button>
                    </div>
                    <small className="small" style={{ color: "#000" }}>
                      The image is uploaded first, then all form details are saved to the database.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
          <div
            className="modal fade show"
            style={{ display: "block", zIndex: 1055 }}
            onClick={() => setEditOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-md modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content position-relative" style={{ background: "#fff", color: "#000" }}>
                <button
                  type="button"
                  aria-label="Close"
                  className="mono-btn mono-btn-sm btn-modal-close"
                  style={{ top: 8, right: 8, position: 'absolute', cursor: 'pointer', zIndex: 2, pointerEvents: 'auto' }}
                  onClick={() => setEditOpen(false)}
                  title="Close"
                >
                  <X size={16} />
                </button>
                <div className="modal-body p-4">
                  <h2 className="h5 fw-bold mb-3" style={{ color: "#000" }}>Edit Gallery Item</h2>
                  <div className="vstack gap-3">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small fw-semibold" style={{ color: "#000" }}>Title</label>
                        <input className="form-control" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold" style={{ color: "#000" }}>Category</label>
                        <select className="form-select" value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}>
                          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold" style={{ color: "#000" }}>Year</label>
                        <input type="number" className="form-control" value={editForm.year} onChange={(e) => setEditForm((f) => ({ ...f, year: Number(e.target.value || new Date().getFullYear()) }))} />
                      </div>
                    </div>
                    <div>
                      <label className="form-label small fw-semibold" style={{ color: "#000" }}>Medium</label>
                      <input className="form-control" value={editForm.medium} onChange={(e) => setEditForm((f) => ({ ...f, medium: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold" style={{ color: "#000" }}>Description</label>
                      <textarea className="form-control" rows={4} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold" style={{ color: "#000" }}>Replace Image (optional)</label>
                      <div className="border rounded-3 p-3 d-flex align-items-center justify-content-between" style={{ borderColor: "#000" }}>
                        <input type="file" accept="image/*" onChange={(e) => setEditForm((f) => ({ ...f, replaceFile: e.target.files?.[0] || null }))} />
                        <div className="small d-flex align-items-center gap-2" style={{ color: "#000" }}>
                          <Upload size={16} /> {editForm.replaceFile ? editForm.replaceFile.name : "Choose new image"}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button type="button" className="mono-btn d-inline-flex align-items-center gap-2" onClick={saveEdit} disabled={loading}>
                        <Save size={16} /> {loading ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                    <small className="small" style={{ color: "#000" }}>
                      If you choose a new image, it uploads first, then the item is updated with the new URL and metadata.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Ensure pointer cursor on close icons and apply monochrome helpers */}
      <style>{`
        .btn-modal-close { cursor: pointer; }

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

        /* Mono badge */
        .mono-badge {
          display: inline-block; padding: 4px 10px; border-radius: 999px;
          border: 1px solid #000; background: #fff; color: #000; font-weight: 700;
        }

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
