import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Edit, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Cloudinary ENV
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TESTIMONIALS_URL = `${API_BASE}/api/testimonials`;

async function uploadToCloudinary(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error("Cloudinary env missing");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST", body: fd
  });
  const data = await res.json();
  if (!res.ok || !data.secure_url) throw new Error(data?.error?.message || "Cloudinary upload failed");
  return data.secure_url;
}

const blank = { name: '', city: '', rating: '', imageUrl: '', review: '' };

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTestimonial, setEditTestimonial] = useState(null);

  const fetchTestimonials = async () => {
    try {
      const { data } = await axios.get(TESTIMONIALS_URL);
      // Defensive: always array, don't concat, never keep "stale"
      setTestimonials(Array.isArray(data?.testimonials) ? [...data.testimonials] : []);
    } catch {
      setTestimonials([]);
      toast.error("Could not load testimonials.");
    }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const handleAdd = () => {
    setEditTestimonial(null);
    setShowModal(true);
  };

  const handleEdit = (t) => {
    setEditTestimonial(t);
    setShowModal(true);
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete testimonial of ${t.name}?`)) return;
    try {
      await axios.delete(`${TESTIMONIALS_URL}/${t._id}`);
      toast.success("Testimonial deleted.");
      fetchTestimonials();
    } catch {
      toast.error("Delete failed.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-2">
      <ToastContainer />
      <div className="flex justify-between items-center mb-7">
        <h1 className="text-2xl font-extrabold">Testimonials</h1>
        <button className="bg-black text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-900" onClick={handleAdd}>Add Testimonial</button>
      </div>
      <div className="rounded-2xl shadow bg-white overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-50 text-left">
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Photo</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Name & City</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide text-center">Rating</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide">Review</th>
                <th className="px-3 py-3 font-bold text-xs uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-semibold">No testimonials yet.</td>
                </tr>
              )}
              {testimonials.map(t => (
                <tr key={t._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5">
                    {t.imageUrl
                      ? <img src={t.imageUrl} alt={t.name} className="w-12 h-12 object-cover rounded-full border border-black/20 flex-shrink-0" />
                      : <div className="w-12 h-12 bg-gray-100 rounded-full border border-black/20 flex-shrink-0" />
                    }
                  </td>
                  <td className="px-3 py-2.5 min-w-[130px]">
                    <div className="font-bold text-black leading-tight">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.city}</div>
                  </td>
                  <td className="px-3 py-2.5 text-center whitespace-nowrap">
                    <span className="text-yellow-600 font-bold text-sm">{"★".repeat(Number(t.rating) || 0)}</span>
                    <div className="text-xs text-gray-500">{t.rating}/5</div>
                  </td>
                  <td className="px-3 py-2.5 max-w-[340px]">
                    <p className="text-gray-700 text-sm italic line-clamp-2">{t.review}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        className="btn-mono-sm flex items-center gap-1"
                        onClick={() => handleEdit(t)}
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn-mono-sm"
                        onClick={() => handleDelete(t)}
                        title="Delete"
                      >
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
      <TestimonialUploadModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setEditTestimonial(null);
          fetchTestimonials();
        }}
        editTestimonial={editTestimonial}
      />
      <style>{`
        .btn-mono-sm {
          border: 1.5px solid #000; background: #fff; color: #000;
          border-radius: 9999px; padding: 7px 16px; font-weight: 700;
          font-size: 1.09em; transition: all .16s;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .btn-mono-sm:hover, .btn-mono-sm:focus { background: #000; color: #fff; }
        .btn-mono-sm:active { transform: scale(0.97); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

function TestimonialUploadModal({ show, onClose, onSuccess, editTestimonial }) {
  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  // Always reset modal state when closing or opening/add versus edit
  useEffect(() => {
    if (show) {
      if (editTestimonial) setForm({ ...editTestimonial });
      else setForm({ ...blank });
    } else {
      // Clean up form when modal closes, preventing stale state
      setTimeout(() => setForm({ ...blank }), 200);
    }
  }, [editTestimonial, show]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      setError(err.message || "Image upload failed");
      toast.error(err.message || "Image upload failed");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    const { name, city, rating, review, imageUrl } = form;
    if (!name || !city || !rating || !review || !imageUrl) {
      setError("All fields and an uploaded image are required.");
      toast.error("All fields and an uploaded image are required.");
      setSubmitting(false);
      return;
    }
    try {
      if (editTestimonial && editTestimonial._id) {
        await axios.put(`${TESTIMONIALS_URL}/${editTestimonial._id}`, form);
        toast.success('Testimonial updated successfully');
      } else {
        await axios.post(TESTIMONIALS_URL, form);
        toast.success('Testimonial uploaded successfully');
      }
      setForm({ ...blank });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Operation failed');
      toast.error(err?.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-2 py-6">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative flex flex-col animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-label={editTestimonial ? "Edit Testimonial" : "Upload Testimonial"}
      >
        <button
          onClick={() => { setForm({ ...blank }); onClose(); }}
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold focus:outline-none"
          aria-label="Close modal"
          tabIndex={0}
        >&times;</button>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 text-center">
          {editTestimonial ? "Edit Testimonial" : "Upload Testimonial"}
        </h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Name</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black outline-none text-base"
              name="name" value={form.name} onChange={handleChange} required autoComplete="off"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">City</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black outline-none text-base"
              name="city" value={form.city} onChange={handleChange} required autoComplete="off"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Rating (1-5)</label>
            <input
              type="number" min="1" max="5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black outline-none text-base"
              name="rating" value={form.rating} onChange={handleChange} required
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Review</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black outline-none text-base"
              name="review" value={form.review} onChange={handleChange}
              required rows={3} placeholder="Write your review..."
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Image</label>
            <label className="block rounded-lg border-2 border-dashed border-gray-400 px-3 py-2 text-center cursor-pointer hover:border-black transition mb-2 w-full"
              style={{ background: "#fafafa" }}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
                disabled={uploading}
              />
              {form.imageUrl
                ? <img src={form.imageUrl} alt="testimonial" className="mx-auto h-20 rounded object-cover" />
                : uploading ? "Uploading..." : "Click to upload image"
              }
            </label>
          </div>
          {error && <div className="text-red-600 text-sm my-1">{error}</div>}
          <button
            className="w-full mt-2 bg-black text-white rounded-lg py-2 font-semibold hover:bg-gray-800 transition text-base"
            type="submit"
            disabled={submitting || uploading || !form.imageUrl}
          >
            {submitting
              ? (editTestimonial ? 'Updating...' : 'Uploading...')
              : (editTestimonial ? 'Update' : 'Upload')}
          </button>
          <button
            type="button"
            onClick={() => { setForm({ ...blank }); onClose(); }}
            className="w-full mt-2 text-gray-600 hover:underline transition text-base"
          >Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default TestimonialsPage;
