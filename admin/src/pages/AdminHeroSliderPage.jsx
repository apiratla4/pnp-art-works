import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Trash2, Edit2, Loader, Image as ImgIcon, UploadCloud } from "lucide-react";

const CLOUDINARY_UPLOAD_PRESET = "YOUR_CLOUDINARY_UPLOAD_PRESET";
const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUDINARY_CLOUD_NAME";
const API = "/api/hero-sliders";

const emptyForm = {
  image: "",
  alt: "",
  eyebrow: "",
  heading: "",
  sub: "",
  ctaLabel: "",
  ctaHref: ""
};

const AdminHeroSliderPage = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imgPreview, setImgPreview] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const fileInput = useRef(null);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadSlides = async () => {
    setLoading(true);
    const { data } = await axios.get(API);
    setSlides(data);
    setLoading(false);
  };

  useEffect(() => { loadSlides(); }, []);

  const handleImageUpload = async (file) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const response = await axios.post(url, uploadData);
    return response.data.secure_url;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setImgFile(files[0]);
      setImgPreview(URL.createObjectURL(files[0]));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleEdit = (s) => {
    setEditId(s._id);
    setForm({
      image: s.image || "",
      alt: s.alt || "",
      eyebrow: s.eyebrow || "",
      heading: s.heading || "",
      sub: s.sub || "",
      ctaLabel: s.ctaLabel || "",
      ctaHref: s.ctaHref || "",
    });
    setImgPreview(s.image);
    setImgFile(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(emptyForm);
    setImgPreview("");
    setImgFile(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = form.image;
      if (imgFile) {
        imageUrl = await handleImageUpload(imgFile);
      }
      const payload = { ...form, image: imageUrl };
      let result;
      if (editId) {
        result = await axios.patch(`${API}/${editId}`, payload);
        setMsg("Slide updated!");
      } else {
        result = await axios.post(API, payload);
        setMsg("Slide added!");
      }
      setTimeout(() => setMsg(""), 2000);
      setForm(emptyForm);
      setImgFile(null);
      setImgPreview("");
      setEditId(null);
      if (fileInput.current) fileInput.current.value = "";
      loadSlides();
    } catch (err) {
      setMsg("Error: " + (err.response?.data?.message || err.message));
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this slide?")) return;
    await axios.delete(`${API}/${id}`);
    loadSlides();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-extrabold mb-8">Manage Hero Sliders</h2>
      <form
        className="grid md:grid-cols-2 gap-6 bg-white p-8 rounded-2xl shadow mb-12"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div>
          <div className="mb-2 font-medium flex items-center gap-3">
            Slide Image
            <span className="text-xs text-gray-500">(Upload or keep existing)</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 h-24 flex flex-col items-center justify-center rounded bg-gray-100 cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-200 mb-2 relative">
              {imgPreview ? (
                <img
                  src={imgPreview}
                  alt="preview"
                  className="object-cover w-full h-full rounded"
                />
              ) : (
                <span className="flex flex-col items-center text-gray-400"><ImgIcon size={30} /><UploadCloud size={18} className="mt-1" /><span className="text-xs mt-1">Select Image</span></span>
              )}
              <input
                type="file"
                accept="image/*"
                name="image"
                ref={fileInput}
                onChange={handleChange}
                className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <input name="alt" value={form.alt} onChange={handleChange} required placeholder="Alt text" className="input w-full" />
          <input name="eyebrow" value={form.eyebrow} onChange={handleChange} placeholder="Eyebrow (optional)" className="input w-full" />
          <input name="heading" value={form.heading} onChange={handleChange} required placeholder="Heading" className="input w-full" />
          <textarea name="sub" value={form.sub} onChange={handleChange} placeholder="Description (optional)" className="input w-full" />
          <input name="ctaLabel" value={form.ctaLabel} onChange={handleChange} required placeholder="Button Text" className="input w-full" />
          <input name="ctaHref" value={form.ctaHref} onChange={handleChange} required placeholder="Button Link (URL or Route)" className="input w-full" />
        </div>
        <div className="col-span-2 flex gap-4 items-center mt-2">
          <button type="submit" className="bg-black text-white font-bold py-2 px-7 rounded-lg hover:bg-gray-900 min-w-[120px]" disabled={submitting}>
            {submitting ? <Loader size={18} className="animate-spin inline" /> : (editId ? "Update Slide" : "Add Slide")}
          </button>
          {editId && (
            <button type="button" onClick={handleCancel} className="text-gray-400 underline ml-4">Cancel</button>
          )}
          {msg && <span className="ml-4 text-green-600 font-semibold">{msg}</span>}
        </div>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {loading ? (
          <div className="py-8 text-center md:col-span-2 lg:col-span-3"><Loader className="animate-spin mx-auto" /></div>
        ) : slides.length === 0 ? (
          <div className="py-8 col-span-full text-center text-gray-400 text-lg">No slides found.</div>
        ) : (
          slides.map(s => (
            <div key={s._id || s.id} className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2 border border-gray-100">
              <div className="relative">
                <img src={s.image} alt={s.alt} className="w-full h-44 object-cover rounded-xl border border-gray-200 mb-2" />
                <span className="absolute left-2 top-2 bg-black/60 text-[11px] px-2 py-0.5 rounded text-white">{s.eyebrow}</span>
              </div>
              <div className="font-bold text-lg">{s.heading}</div>
              <div className="text-gray-600 text-sm mb-2">{s.sub}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-xs font-bold">{s.ctaLabel}</span>
                <span className="text-xs text-gray-500 break-all">{s.ctaHref}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit(s)} className="flex-1 bg-gray-100 hover:bg-gray-200 transition p-2 rounded-lg flex items-center justify-center gap-1 text-black font-medium"><Edit2 size={16}/>Edit</button>
                <button onClick={() => handleDelete(s._id)} className="flex-1 bg-red-100 hover:bg-red-200 transition p-2 rounded-lg flex items-center justify-center gap-1 text-red-700 font-medium"><Trash2 size={16}/>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminHeroSliderPage;
