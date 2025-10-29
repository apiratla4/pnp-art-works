import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit } from "lucide-react";
import TestimonialUploadModal from "./TestimonialUploadModal.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TESTIMONIALS_URL = `${API_BASE}/api/testimonials`;

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTestimonial, setEditTestimonial] = useState(null);

  const fetchTestimonials = async () => {
    try {
      const { data } = await axios.get(TESTIMONIALS_URL);
      setTestimonials(Array.isArray(data?.testimonials) ? data.testimonials : []);
    } catch {
      setTestimonials([]);
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

  return (
    <div className="max-w-5xl mx-auto py-10 px-2">
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
              {t.imageUrl ?
                <img src={t.imageUrl} alt={t.name} className="h-14 w-14 object-cover rounded-full border border-black/10" />
                : <div className="h-14 w-14 bg-gray-100 rounded-full border border-black/10" />
              }
              <div className="flex flex-col">
                <span className="font-bold text-lg text-black">{t.name}</span>
                <span className="text-xs text-gray-500">{t.city}</span>
                <span className="text-xs text-yellow-600 font-bold">Rating: {t.rating}/5</span>
              </div>
            </div>
            <div className="my-2 grow italic text-gray-800 text-sm">
              {t.review}
            </div>
            <button
              className="absolute top-3 right-3 flex items-center gap-1 bg-white border border-gray-300 hover:border-black text-gray-600 hover:text-black rounded-full px-3 py-1 shadow-sm text-xs font-bold transition-all focus:outline-none"
              onClick={() => handleEdit(t)}
              title="Edit testimonial"
            >
              <Edit size={14} strokeWidth={2} />
              Edit
            </button>
          </div>
        ))}
      </div>
      <TestimonialUploadModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchTestimonials}
        editTestimonial={editTestimonial}
      />
    </div>
  );
};

export default TestimonialsPage;
