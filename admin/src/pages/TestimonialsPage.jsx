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
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-7">
        {testimonials.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-8 font-semibold">
            No testimonials yet.
          </div>
        )}
        {testimonials.map(t => (
          <div key={t._id} className="bg-white rounded-2xl shadow-md border border-black/10 p-5 flex flex-col relative min-h-[220px]">
            <div className="flex items-center gap-4 mb-2">
              {t.imageUrl
                ? <img src={t.imageUrl} alt={t.name} className="h-14 w-14 object-cover rounded-full border border-black/10" />
                : <div className="h-14 w-14 bg-gray-100 rounded-full border border-black/10" />
              }
              <div className="flex flex-col">
                <span className="font-bold text-lg text-black">{t.name}</span>
                <span className="text-xs text-gray-500">{t.city}</span>
                <span className="text-xs text-yellow-600 font-bold">Rating: {t.rating}/5</span>
              </div>
            </div>
            <div className="my-2 grow italic text-gray-800 text-sm overflow-hidden line-clamp-5 wrap-break-word">
              {t.review}
            </div>
            <div className="absolute top-3 right-3 flex gap-1">
              <button
                className="flex items-center gap-1 bg-white border border-gray-300 hover:border-black text-gray-600 hover:text-black rounded-full px-3 py-1 shadow-sm text-xs font-bold transition-all focus:outline-none"
                onClick={() => handleEdit(t)}
                title="Edit testimonial"
              >
                <Edit size={14} strokeWidth={2} />
                Edit
              </button>
              <button
                className="flex items-center gap-1 bg-white border border-gray-300 hover:border-black text-gray-600 hover:text-black rounded-full px-2 py-1 shadow-sm text-xs font-bold transition-all focus:outline-none"
                onClick={() => handleDelete(t)}
                title="Delete testimonial"
              >
                <Trash2 size={15} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
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
        .line-clamp-5 {
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
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
