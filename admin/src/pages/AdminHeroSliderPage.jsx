import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Loader2, UploadCloud, X } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API = (import.meta.env.VITE_API_URL ?? "") + "/api/hero-sliders";

const emptyForm = { image: "", alt: "", eyebrow: "", heading: "", sub: "", ctaLabel: "", ctaHref: "" };

const inputClass =
  "rounded-xl border border-black px-4 py-3 w-full focus:ring-2 focus:ring-black outline-none text-base bg-white shadow-none";

const AdminHeroSliderPage = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editSlide, setEditSlide] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputFile = useRef();

  // CRUD operations
  const loadSlides = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API);
      setSlides(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      toast.error("Failed to fetch slides: " + (err.response?.data?.message || err.message));
      setSlides([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadSlides(); }, []);

  const uploadToCloudinary = async file => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error("Cloudinary env missing");
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok || !data.secure_url) throw new Error(data?.error?.message || "Cloudinary upload failed");
    return data.secure_url;
  };

  // MODAL LOGIC & FORM HANDLING
  const openAddModal = () => {
    setEditSlide(null);
    setForm(emptyForm);
    setShowModal(true);
  };
  const openEditModal = (slide) => {
    setEditSlide(slide);
    setForm(slide);
    setShowModal(true);
  };
  const closeModal = () => {
    setEditSlide(null);
    setForm(emptyForm);
    setShowModal(false);
    setUploading(false);
    setSubmitting(false);
    if (inputFile.current) inputFile.current.value = "";
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImageChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(f => ({ ...f, image: url }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    }
    setUploading(false);
    if (inputFile.current) inputFile.current.value = "";
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!form.alt || !form.heading || !form.ctaLabel || !form.ctaHref || !form.image)
        throw new Error("All required fields and image are needed.");
      if (editSlide && editSlide._id) {
        await axios.patch(`${API}/${editSlide._id}`, form);
        toast.success("Slide updated!");
      } else {
        await axios.post(API, form);
        toast.success("Slide added!");
      }
      closeModal();
      loadSlides();
    } catch (err) {
      toast.error(err.message || err?.response?.data?.message || "Save failed");
    }
    setSubmitting(false);
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this slide?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      toast.success("Slide deleted!");
      loadSlides();
    } catch {
      toast.error("Delete failed.");
    }
  };

  // Modal JSX (inside main return)
  const modal = showModal && (
    <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center">
      <div className="bg-white max-w-lg w-full mx-4 my-6 p-8 rounded-2xl shadow-2xl border border-black relative animate-fadeIn" style={{maxHeight: "95vh", overflowY: "auto"}}>
        <button className="absolute right-4 top-4 text-xl text-gray-400 hover:text-black" onClick={closeModal}><X/></button>
        <h2 className="text-2xl font-extrabold mb-4">{editSlide ? "Edit" : "Add"} Hero Slide</h2>
        <form className="flex flex-col gap-3" onSubmit={handleFormSubmit} autoComplete="off">
          <label className="block font-medium">Image *</label>
          <label className="w-full min-h-20 h-40 flex flex-col items-center justify-center rounded-xl bg-gray-50 cursor-pointer border-2 border-dashed border-black hover:border-black transition mb-2 relative shadow-none">
            {form.image ? (
              <img src={form.image} alt="preview" className="object-cover w-full h-full rounded-xl" />
            ) : (
              <span className="flex flex-col items-center text-black/50">
                <UploadCloud size={32} className="mb-2" />
                {uploading ? "Uploading..." : "Click to upload image"}
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              name="image"
              ref={inputFile}
              disabled={uploading}
              onChange={handleImageChange}
              className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
              tabIndex={0}
              aria-label="Select hero image"
            />
          </label>
          <input name="alt" value={form.alt} onChange={handleChange} required placeholder="Alt text" className={inputClass} />
          <input name="eyebrow" value={form.eyebrow} onChange={handleChange} placeholder="Eyebrow (optional)" className={inputClass} />
          <input name="heading" value={form.heading} onChange={handleChange} required placeholder="Heading" className={inputClass + " font-semibold"} />
          <textarea name="sub" value={form.sub} onChange={handleChange} placeholder="Description (optional)" className={inputClass + " min-h-12"} />
          <input name="ctaLabel" value={form.ctaLabel} onChange={handleChange} required placeholder="Button Text" className={inputClass} />
          <input name="ctaHref" value={form.ctaHref} onChange={handleChange} required placeholder="Button Link (URL or Route)" className={inputClass} />
          <button disabled={submitting || uploading} type="submit"
                  className="border border-black text-black bg-white rounded-xl px-5 py-2 mt-2 font-black hover:bg-black hover:text-white transition">
            {submitting ? <Loader2 size={18} className="animate-spin inline" /> : (editSlide ? "Update" : "Add")}
          </button>
          <button type="button" onClick={closeModal} className="text-gray-700 underline text-base mx-auto block mt-2">Cancel</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className=" min-h-screen pt-10 pb-20 px-2">
      <ToastContainer />
      {modal}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between mb-8 gap-3 px-2">
        <h2 className="text-2xl font-extrabold tracking-tight">Manage Hero Sliders</h2>
        <button
          className="border-2 border-black text-black bg-white px-6 py-2 rounded-2xl font-black text-lg hover:bg-black hover:text-white shadow-none transition"
          onClick={openAddModal}
        >+ Add Slide</button>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          <div className="py-16 col-span-full text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : slides.length === 0 ? (
          <div className="py-12 col-span-full text-center text-gray-400 text-lg">No slides found.</div>
        ) : (
          slides.map(s => (
            <div key={s._id || s.id} className="bg-white rounded-3xl shadow border-2 border-black px-5 py-6 flex flex-col gap-3 hover:shadow-xl transition-all">
              <div className="relative">
                <img src={s.image} alt={s.alt} className="w-full h-44 object-cover rounded-2xl border border-black mb-2" />
                {s.eyebrow && (
                  <span className="absolute left-2 top-2 uppercase text-xs px-2 py-0.5 border border-black rounded font-mono font-bold bg-white/80 text-black">{s.eyebrow}</span>
                )}
              </div>
              <div className="font-black text-lg mb-1">{s.heading}</div>
              {s.sub && <div className="text-gray-700 text-base mb-2">{s.sub}</div>}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="border border-black rounded-full px-4 py-1 text-xs font-bold">{s.ctaLabel}</span>
                <span className="text-xs text-black/80 truncate font-mono underline">{s.ctaHref}</span>
              </div>
              <div className="flex gap-3 mt-auto pt-4 border-t border-black/10">
                <button onClick={() => openEditModal(s)} className="flex-1 border-2 border-black rounded-xl py-2 font-bold bg-white text-black hover:bg-black hover:text-white transition">
                  Edit
                </button>
                <button onClick={() => handleDelete(s._id)} className="flex-1 border-2 border-black rounded-xl py-2 font-bold bg-white text-black hover:bg-black hover:text-white transition">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <style>{`
        .animate-fadeIn { animation: fadein .17s cubic-bezier(.41,1.08,.67,1); }
        @keyframes fadein { from { opacity: 0; transform: scale(.97);} to { opacity: 1; transform: scale(1);} }
      `}</style>
    </div>
  );
};

export default AdminHeroSliderPage;
