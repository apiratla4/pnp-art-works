import React, { useEffect, useState } from "react";
import { Image as ImageIcon, Trash2, Plus, Pencil, Save, X, Upload, Filter } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import "./GalleryPage.css";

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
const fallbackImg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
     <rect width="100%" height="100%" fill="#f6f6f6"/>
     <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999999" font-size="16" font-family="Arial">
       Image
     </text>
   </svg>`
)}`;

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    category: "Paintings",
    year: new Date().getFullYear(),
    medium: "",
    description: "",
    file: null,
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
    replaceFile: null,
  });

  // Filtered items
  const filteredItems = filterCategory === "all" 
    ? items 
    : items.filter(item => item.category === filterCategory);

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

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setAddForm({
      title: "",
      category: "Paintings",
      year: new Date().getFullYear(),
      medium: "",
      description: "",
      file: null,
    });
    setAddOpen(true);
  };

  const submitAdd = async () => {
    try {
      if (!addForm.file) return toast.error("Please select an image");
      setLoading(true);

      const { url, publicId } = await uploadToCloudinary(addForm.file);

      const item = {
        title: addForm.title?.trim() || "Untitled",
        category: addForm.category || "Paintings",
        year: Number(addForm.year) || new Date().getFullYear(),
        medium: addForm.medium || "",
        description: addForm.description || "",
        src: url,
        cloudinaryPublicId: publicId,
        tags: [],
      };

      let res;
      try {
        res = await axios.post(GALLERY_URL, { items: [item] }, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
      } catch (err) {
        if (err?.response?.status === 400) {
          res = await axios.post(GALLERY_URL, {
            images: [{ url, publicId }],
            meta: {
              title: item.title,
              category: item.category,
              year: item.year,
              medium: item.medium,
              description: item.description,
              tags: item.tags,
            },
          }, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          });
        } else {
          throw err;
        }
      }

      const created = Array.isArray(res.data?.items) ? res.data.items : [];
      setItems((prev) => [...created, ...prev]);
      setAddOpen(false);
      toast.success("Gallery item added successfully");
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
      replaceFile: null,
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
        description: editForm.description || "",
      };

      if (editForm.replaceFile) {
        const { url, publicId } = await uploadToCloudinary(editForm.replaceFile);
        body = { ...body, src: url, cloudinaryPublicId: publicId, oldPublicId: editItem.cloudinaryPublicId || "" };
      }

      const { data } = await axios.patch(`${GALLERY_URL}/${editItem._id}`, body, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setItems((arr) => arr.map((g) => (String(g._id) === String(editItem._id) ? { ...g, ...data } : g)));
      setEditOpen(false);
      setEditItem(null);
      toast.success("Gallery item updated successfully");
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const removeAt = async (id) => {
    if (!confirm("Delete this image permanently?")) return;
    try {
      await axios.delete(`${GALLERY_URL}/${encodeURIComponent(id)}`, { withCredentials: true });
      setItems((arr) => arr.filter((g) => String(g._id) !== String(id)));
      toast.success("Image removed successfully");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="gallery-page">
      {/* Header */}
      <div className="gallery-header">
        <div className="gallery-header-content">
          <div>
            <h1 className="gallery-title">Gallery Management</h1>
            <p className="gallery-subtitle">Upload and manage images displayed in the public gallery</p>
          </div>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAdd} disabled={loading}>
            <Plus size={18} />
            <span>Add Image</span>
          </button>
        </div>

        {/* Stats & Filter */}
        <div className="gallery-toolbar">
          <div className="gallery-stats">
            <div className="stat-item">
              <ImageIcon size={20} className="text-primary" />
              <span className="stat-value">{items.length}</span>
              <span className="stat-label">Total Images</span>
            </div>
            {categories.map(cat => {
              const count = items.filter(i => i.category === cat).length;
              return (
                <div key={cat} className="stat-item">
                  <span className="stat-value">{count}</span>
                  <span className="stat-label">{cat}</span>
                </div>
              );
            })}
          </div>

          <div className="filter-section">
            <Filter size={18} className="text-muted" />
            <select 
              className="form-select form-select-sm" 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading && items.length === 0 ? (
        <div className="gallery-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading gallery...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="gallery-empty">
          <ImageIcon size={64} className="empty-icon" />
          <h3 className="empty-title">No images found</h3>
          <p className="empty-text">
            {filterCategory !== "all" 
              ? "No images in this category yet" 
              : "Start by adding your first gallery image"}
          </p>
          {filterCategory === "all" && (
            <button className="btn btn-primary mt-3" onClick={openAdd}>
              <Plus size={18} className="me-2" />
              Add First Image
            </button>
          )}
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredItems.map((g, i) => {
            const key = g._id || g.src || g.url || i;
            const src = g.src || g.url || fallbackImg;
            return (
              <div key={key} className="gallery-card">
                <div className="gallery-card-image">
                  <img
                    src={src}
                    alt={g.title || `gallery-${i}`}
                    onError={(e) => { e.currentTarget.src = fallbackImg; }}
                  />
                  <div className="gallery-card-overlay">
                    <button
                      className="btn btn-sm btn-light"
                      onClick={() => startEdit(g)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeAt(g._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="gallery-card-info">
                  <span className="badge bg-primary">{g.category || "—"}</span>
                  <h6 className="gallery-card-title">{g.title || "Untitled"}</h6>
                  <p className="gallery-card-meta">
                    {g.year && <span>{g.year}</span>}
                    {g.medium && <span> • {g.medium}</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {addOpen && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setAddOpen(false)} />
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <div>
                    <h5 className="modal-title fw-bold">Add Gallery Item</h5>
                    <p className="small mb-0 opacity-90">Upload a new image to your gallery</p>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setAddOpen(false)}
                    aria-label="Close"
                  />
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Title<span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        placeholder="Enter image title"
                        value={addForm.title}
                        onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Category</label>
                      <select
                        className="form-select"
                        value={addForm.category}
                        onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Year</label>
                      <input
                        type="number"
                        className="form-control"
                        value={addForm.year}
                        onChange={(e) =>
                          setAddForm((f) => ({ ...f, year: Number(e.target.value || new Date().getFullYear()) }))
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Medium</label>
                      <input
                        className="form-control"
                        placeholder="e.g., Oil on canvas, Watercolor"
                        value={addForm.medium}
                        onChange={(e) => setAddForm((f) => ({ ...f, medium: e.target.value }))}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Describe the artwork..."
                        value={addForm.description}
                        onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Image<span className="text-danger">*</span></label>
                      <div className="upload-area">
                        <Upload size={32} className="upload-icon" />
                        <p className="upload-text">
                          {addForm.file ? addForm.file.name : "Click to select or drag and drop an image"}
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setAddForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                          className="upload-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button className="btn btn-secondary" onClick={() => setAddOpen(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={submitAdd}
                    disabled={loading || !addForm.file}
                  >
                    <Save size={16} />
                    {loading ? "Uploading..." : "Add to Gallery"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setEditOpen(false)} />
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <div>
                    <h5 className="modal-title fw-bold">Edit Gallery Item</h5>
                    <p className="small mb-0 opacity-90">Update image details</p>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setEditOpen(false)}
                    aria-label="Close"
                  />
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Title</label>
                      <input
                        className="form-control"
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Category</label>
                      <select
                        className="form-select"
                        value={editForm.category}
                        onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Year</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editForm.year}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, year: Number(e.target.value || new Date().getFullYear()) }))
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Medium</label>
                      <input
                        className="form-control"
                        value={editForm.medium}
                        onChange={(e) => setEditForm((f) => ({ ...f, medium: e.target.value }))}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Replace Image (Optional)</label>
                      <div className="upload-area">
                        <Upload size={32} className="upload-icon" />
                        <p className="upload-text">
                          {editForm.replaceFile ? editForm.replaceFile.name : "Choose a new image to replace the current one"}
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEditForm((f) => ({ ...f, replaceFile: e.target.files?.[0] || null }))}
                          className="upload-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button className="btn btn-secondary" onClick={() => setEditOpen(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={saveEdit}
                    disabled={loading}
                  >
                    <Save size={16} />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
