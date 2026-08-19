import React, { useEffect, useState } from "react";
import {
  Image as ImageIcon, Trash2, Plus, Pencil, Save, X, Upload, Filter
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

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

const GalleryPage = () => {
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

  const filteredItems = filterCategory === "all"
    ? items
    : items.filter(item => item.category === filterCategory);

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
    if (!window.confirm("Delete this image permanently?")) return;
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
    <div className="max-w-6xl mx-auto w-full p-2">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black mb-0 text-black">Gallery Management</h1>
          <p className="text-gray-700 mt-1">Upload and manage images displayed in the public gallery</p>
        </div>
        <button className="btn-mono-sm flex items-center gap-2 font-bold" onClick={openAdd} disabled={loading}>
          <Plus size={18} />
          <span>Add Image</span>
        </button>
      </div>

      {/* Filter and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center">
            <ImageIcon size={20} className="mr-1" />
            <span className="font-extrabold">{items.length}</span>
            <span className="ml-2 text-sm text-gray-600">Total Images</span>
          </div>
          {categories.map(cat => {
            const count = items.filter(i => i.category === cat).length;
            return (
              <div key={cat} className="flex items-center">
                <span className="font-extrabold">{count}</span>
                <span className="ml-1 text-sm text-gray-600">{cat}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-1">
          <Filter size={18} className="text-gray-400" />
          <select
            className="rounded-lg border border-black px-3 py-1 focus:ring-2 focus:ring-black bg-white text-black font-semibold"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery grid! */}
      {loading && items.length === 0 ? (
        <div className="py-24 text-gray-400 text-center text-xl">Loading gallery...</div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 text-center text-gray-500 py-20">
          <ImageIcon size={64} className="mx-auto mb-4" />
          <h3 className="font-black text-lg">No images found</h3>
          <p>
            {filterCategory !== "all"
              ? "No images in this category yet"
              : "Start by adding your first gallery image"
            }
          </p>
          {filterCategory === "all" && (
            <button className="btn-mono-sm mt-3" onClick={openAdd}>
              <Plus size={18} className="mr-2" />
              Add First Image
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl shadow bg-white overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50 text-left">
                  <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Image</th>
                  <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Title</th>
                  <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Category</th>
                  <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Year / Medium</th>
                  <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((g, i) => {
                  const key = g._id || g.src || g.url || i;
                  const src = g.src || g.url || fallbackImg;
                  return (
                    <tr key={key} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <img
                          src={src}
                          alt={g.title || `gallery-${i}`}
                          className="w-12 h-12 object-cover rounded-lg border border-black/20 flex-shrink-0"
                          onError={(e) => { e.currentTarget.src = fallbackImg; }}
                        />
                      </td>
                      <td className="px-3 py-2.5 min-w-[160px] max-w-[240px]">
                        <div className="font-bold text-black leading-tight line-clamp-1">{g.title || "Untitled"}</div>
                        {g.description && (
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{g.description}</div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-xs font-semibold text-gray-700">{g.category || "—"}</span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="text-sm">{g.year || "—"}</div>
                        {g.medium && <div className="text-xs text-gray-500">{g.medium}</div>}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1.5 justify-end">
                          <button className="btn-mono-sm" onClick={() => startEdit(g)} title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button className="btn-mono-sm" onClick={() => removeAt(g._id)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button type="button" className="absolute top-2 right-3 btn-mono-sm" onClick={() => setAddOpen(false)}><X size={20} /></button>
            <h2 className="text-xl font-bold mb-2">Add Gallery Item</h2>
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title<span className="text-red-500">*</span></label>
                <input
                  className="w-full rounded-lg border-black border px-3 py-2 bg-white"
                  placeholder="Enter image title"
                  value={addForm.title}
                  onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full rounded-lg border-black border px-3 py-2 bg-white"
                    value={addForm.category}
                    onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border-black border px-3 py-2 bg-white"
                    value={addForm.year}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, year: Number(e.target.value || new Date().getFullYear()) }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Medium</label>
                <input
                  className="w-full rounded-lg border-black border px-3 py-2 bg-white"
                  placeholder="e.g., Oil on canvas, Watercolor"
                  value={addForm.medium}
                  onChange={(e) => setAddForm((f) => ({ ...f, medium: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full rounded-lg border-black border px-3 py-2 bg-white"
                  rows={2}
                  placeholder="Describe the artwork..."
                  value={addForm.description}
                  onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image<span className="text-red-500">*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-black
                    file:mr-5 file:py-1 file:px-3
                    file:rounded-lg file:border file:border-black
                    file:bg-white file:text-black file:font-semibold
                    file:cursor-pointer"
                  onChange={(e) => setAddForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                  required
                />
                {addForm.file?.name && (
                  <div className="text-xs text-gray-600 mt-1 truncate">{addForm.file.name}</div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button type="button" className="btn-mono-sm flex-1" onClick={() => setAddOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-mono-sm flex-1"
                  onClick={submitAdd}
                  disabled={loading || !addForm.file}
                >
                  <Save size={16} />
                  {loading ? "Uploading..." : "Add to Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button type="button" className="absolute top-2 right-3 btn-mono-sm" onClick={() => setEditOpen(false)}><X size={20} /></button>
            <h2 className="text-xl font-bold mb-2">Edit Gallery Item</h2>
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  className="w-full rounded-lg border-black border px-3 py-2 bg-white"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full rounded-lg border-black border px-3 py-2 bg-white"
                    value={editForm.category}
                    onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border-black border px-3 py-2 bg-white"
                    value={editForm.year}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, year: Number(e.target.value || new Date().getFullYear()) }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Medium</label>
                <input
                  className="w-full rounded-lg border-black border px-3 py-2 bg-white"
                  value={editForm.medium}
                  onChange={(e) => setEditForm((f) => ({ ...f, medium: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full rounded-lg border-black border px-3 py-2 bg-white"
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Replace Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-black
                    file:mr-5 file:py-1 file:px-3
                    file:rounded-lg file:border file:border-black
                    file:bg-white file:text-black file:font-semibold
                    file:cursor-pointer"
                  onChange={(e) => setEditForm((f) => ({ ...f, replaceFile: e.target.files?.[0] || null }))}
                />
                {editForm.replaceFile?.name && (
                  <div className="text-xs text-gray-600 mt-1 truncate">{editForm.replaceFile.name}</div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button type="button" className="btn-mono-sm flex-1" onClick={() => setEditOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-mono-sm flex-1"
                  onClick={saveEdit}
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -- Global button style -- */}
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
  );
};

export default GalleryPage;
