import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const uploadToCloudinary = async (file) => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error("Cloudinary env missing");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, 
    { method: "POST", body: fd }
  );
  const data = await res.json();
  if (!res.ok || !data.secure_url) throw new Error(data?.error?.message || "Cloudinary upload failed");
  return data.secure_url;
};

const TestimonialUploadModal = ({ show, onClose, onSuccess, editTestimonial }) => {
  const [form, setForm] = useState({
    name: '', city: '', rating: '', imageUrl: '', review: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    if (editTestimonial) setForm(editTestimonial);
    else setForm({ name: '', city: '', rating: '', imageUrl: '', review: '' });
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
    try {
      if (editTestimonial && editTestimonial._id) {
        await axios.patch(`/api/testimonials/${editTestimonial._id}`, form);
        toast.success('Testimonial updated successfully');
      } else {
        await axios.post('/api/testimonials', form);
        toast.success('Testimonial uploaded successfully');
      }
      setForm({ name: '', city: '', rating: '', imageUrl: '', review: '' });
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
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative flex flex-col
        animate-fadeIn
        sm:rounded-xl sm:p-5
        xs:px-3 xs:py-4 xs:max-w-xs"
        role="dialog"
        aria-modal="true"
        aria-label={editTestimonial ? "Edit Testimonial" : "Upload Testimonial"}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold focus:outline-none"
          aria-label="Close modal"
          tabIndex={0}
        >&times;</button>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 text-center">
          {editTestimonial ? "Edit Testimonial" : "Upload Testimonial"}
        </h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-gray-700 mb-1" htmlFor="testimonial-name">Name</label>
            <input
              id="testimonial-name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black outline-none text-base"
              name="name" value={form.name} onChange={handleChange} required
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1" htmlFor="testimonial-city">City</label>
            <input
              id="testimonial-city"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black outline-none text-base"
              name="city" value={form.city} onChange={handleChange} required
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1" htmlFor="testimonial-rating">Rating (1-5)</label>
            <input
              id="testimonial-rating"
              type="number" min="1" max="5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black outline-none text-base"
              name="rating" value={form.rating} onChange={handleChange} required
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1" htmlFor="testimonial-review">Review</label>
            <textarea
              id="testimonial-review"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-black outline-none text-base"
              name="review"
              value={form.review}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Write your review..."
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1" htmlFor="testimonial-image-upload">Image</label>
            <label
              htmlFor="testimonial-image-upload"
              className={`block rounded-lg border-2 border-dashed border-gray-400 px-3 py-2 text-center cursor-pointer hover:border-black transition mb-2 w-full`}
              style={{ background: "#fafafa" }}
            >
              <input
                id="testimonial-image-upload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
                disabled={uploading}
              />
              {form.imageUrl
                ? <img src={form.imageUrl} alt="testimonial" className="mx-auto h-20 rounded object-cover" />
                : uploading ? "Uploading..." : "Click to upload image"}
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
            onClick={onClose}
            className="w-full mt-2 text-gray-600 hover:underline transition text-base"
          >Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default TestimonialUploadModal;
