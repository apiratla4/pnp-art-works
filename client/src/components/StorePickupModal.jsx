import React, { useState } from "react";
import toast from "react-hot-toast";

const StorePickupModal = ({ show, onClose, onSubmit }) => {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    let errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm({ fullName: "", phone: "", email: "" });
      setErrors({});
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 px-5 py-7 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-extrabold transition"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-5 text-center tracking-tight text-black">
          Store Pickup Details
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              name="fullName"
              className={`w-full rounded-lg border px-3 py-2 text-base outline-none focus:ring-2 focus:ring-black ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <div className="text-red-600 text-xs mt-1">{errors.fullName}</div>}
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Phone <span className="text-red-600">*</span>
            </label>
            <input
              name="phone"
              className={`w-full rounded-lg border px-3 py-2 text-base outline-none focus:ring-2 focus:ring-black ${errors.phone ? "border-red-500" : "border-gray-300"}`}
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && <div className="text-red-600 text-xs mt-1">{errors.phone}</div>}
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              name="email"
              type="email"
              className={`w-full rounded-lg border px-3 py-2 text-base outline-none focus:ring-2 focus:ring-black ${errors.email ? "border-red-500" : "border-gray-300"}`}
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-black text-white rounded-lg py-2 font-semibold text-lg transition hover:bg-gray-800 focus:outline-none flex items-center justify-center"
          >
            {submitting ? (
              <svg className="animate-spin h-5 w-5 mr-1 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-40" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.372 0 0 5.373 0 12z"></path>
              </svg>
            ) : null}
            {submitting ? "Placing..." : "Place Store Pickup Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StorePickupModal;
