import React, { useState } from 'react';
import axios from 'axios';
import customart from "../assets/custom_art_video.mp4";
import { Palette, Upload, MessageSquare, DollarSign, CheckCircle, Send, AlertTriangle } from 'lucide-react';
import FancyButton from '../components/FancyButton';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const faqs = [
  { q: 'How long does a commission take?', a: 'Typical turnaround is 2–4 weeks depending on size and complexity; rush options may be available for an additional fee.' },
  { q: 'What’s included in the price?', a: 'Artwork, protective varnish, and a certificate of authenticity; framing and shipping are additional.' },
  { q: 'Can changes be requested during the process?', a: 'Yes, progress photos are provided and minor adjustments are welcome to ensure satisfaction.' },
  { q: 'Do you ship internationally?', a: 'Yes, worldwide shipping is available with tracked delivery and protective packaging.' },
  { q: 'What file types can be uploaded as references?', a: 'PNG and JPG are preferred; high-resolution images help achieve accurate results.' },
  { q: 'Can a specific deadline be met?', a: 'Deadlines can often be accommodated depending on scope; sharing the date in the form helps confirm feasibility.' },
  { q: 'What mediums are supported?', a: 'Acrylics, watercolor, charcoal, and mixed media are available for most commissions.' },
  { q: 'How are payments handled?', a: 'A 50% advance secures the slot, with the balance due on approval before shipping.' },
];

const CustomOrderPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    artType: '',
    size: '',
    description: '',
    budget: '',
    deadline: '',
    reference: null
  });

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [visibleFaqs, setVisibleFaqs] = useState(4);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFormData(prev => ({ ...prev, reference: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.artType || !formData.size || !formData.description) {
      setStatus({ type: 'error', message: 'Please fill required fields: name, email, art type, size, and description.' });
      return;
    }
    try {
      setSubmitting(true);
      setStatus({ type: '', message: '' });
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('phone', formData.phone);
      fd.append('artType', formData.artType);
      fd.append('size', formData.size);
      fd.append('description', formData.description);
      fd.append('budget', formData.budget);
      fd.append('deadline', formData.deadline);
      if (formData.reference) fd.append('reference', formData.reference);
      await axios.post(`${API_BASE}/api/custom-orders/submit`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setStatus({ type: 'success', message: 'Your request has been sent! Expect a response within 24 hours.' });
      setFormData({
        name: '', email: '', phone: '', artType: '', size: '',
        description: '', budget: '', deadline: '', reference: null
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit. Please try again.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-5 bg-[#f9f7f7]">
      {/* Hero */}
      <div className="container mb-4 max-w-[1200px] mx-auto">
        <div className="rounded-2xl shadow-sm bg-white flex flex-col lg:flex-row overflow-hidden">
          <div className="w-full lg:w-1/2 min-h-[280px] flex items-stretch">
            <video
              src={customart}
              autoPlay muted loop playsInline preload="metadata"
              className="block w-full h-full object-cover"
            />
          </div>
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-7">
            <div className="flex items-center mb-3">
              <span className="rounded-full border-2 border-black p-3 text-black bg-white flex items-center">
                <Palette size={28} />
              </span>
            </div>
            <h2 className="font-extrabold text-2xl mb-2 text-black">Commission Custom Art</h2>
            <p className="text-black mb-0 text-base">
              Transform ideas into one‑of‑a‑kind pieces crafted to brief, budget, and timeline.
            </p>
          </div>
        </div>
      </div>

      {/* Main section, preserve max width */}
      <div className="container" style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: MessageSquare, title: '1. Consultation', text: 'Share the vision and requirements' },
            { icon: DollarSign, title: '2. Quote', text: 'Receive detailed pricing and timeline' },
            { icon: Palette, title: '3. Creation', text: 'The artwork comes to life' },
            { icon: CheckCircle, title: '4. Delivery', text: 'Receive the masterpiece' }
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="text-center flex flex-col items-center">
                <div className="rounded-full border border-black w-12 h-12 flex items-center justify-center bg-white text-black mb-2">
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold mb-1 text-black text-base">{s.title}</h3>
                <p className="text-black text-xs">{s.text}</p>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div className="rounded-2xl shadow-sm bg-white mb-6">
          <div className="p-6 sm:p-10">
            <h2 className="font-bold text-lg mb-4 text-black">Commission Request Form</h2>
            {status.type === 'success' ? (
              <div className="border border-green-800 rounded-lg bg-white px-5 py-4 mb-5">
                <div className="flex items-center gap-2 text-green-800 font-bold">
                  <CheckCircle size={20} />
                  Request Sent!
                </div>
                <div className="text-black text-sm mt-1">{status.message}</div>
                <div className="mt-4">
                  <FancyButton as="button" type="button" className="fancy-sm" onClick={() => setStatus({ type: '', message: '' })}>
                    Submit Another Request
                  </FancyButton>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {status.type === 'error' && (
                  <div className="border border-black/50 rounded-lg px-4 py-3 bg-red-50 text-black">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} className="text-red-700" />
                      <span>{status.message}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1 text-black">Full Name *</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange}
                      className="border border-black/15 rounded-lg w-full py-2 px-3 text-black bg-white focus:border-black outline-none" placeholder="Your full name" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1 text-black">Email Address *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange}
                      className="border border-black/15 rounded-lg w-full py-2 px-3 text-black bg-white focus:border-black outline-none" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1 text-black">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                      className="border border-black/15 rounded-lg w-full py-2 px-3 text-black bg-white focus:border-black outline-none" placeholder="Your phone number" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1 text-black">Art Type *</label>
                    <select name="artType" required value={formData.artType} onChange={handleInputChange}
                      className="border border-black/15 rounded-lg w-full py-2 px-3 text-black bg-white focus:border-black outline-none">
                      <option value="">Select art type</option>
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                      <option value="abstract">Abstract</option>
                      <option value="still-life">Still Life</option>
                      <option value="custom">Custom Design</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1 text-black">Preferred Size *</label>
                    <select name="size" required value={formData.size} onChange={handleInputChange}
                      className="border border-black/15 rounded-lg w-full py-2 px-3 text-black bg-white focus:border-black outline-none">
                      <option value="">Select size</option>
                      <option value="small">Small (8x10 inches)</option>
                      <option value="medium">Medium (16x20 inches)</option>
                      <option value="large">Large (24x36 inches)</option>
                      <option value="custom">Custom Size</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1 text-black">Budget Range</label>
                    <select name="budget" value={formData.budget} onChange={handleInputChange}
                      className="border border-black/15 rounded-lg w-full py-2 px-3 text-black bg-white focus:border-black outline-none">
                      <option value="">Select budget range</option>
                      <option value="under-500">Under $500</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="1000-2000">$1,000 - $2,000</option>
                      <option value="2000-plus">$2,000+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-black">Preferred Completion Date</label>
                  <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange}
                    className="border border-black/15 rounded-lg w-full py-2 px-3 text-black bg-white focus:border-black outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-black">Project Description *</label>
                  <textarea name="description" required rows={6} value={formData.description} onChange={handleInputChange}
                    className="border border-black/15 rounded-lg w-full py-2 px-3 text-black bg-white focus:border-black outline-none resize-none"
                    placeholder="Describe the vision: colors, style, subject, mood, and any specific requirements..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-black">Reference Images</label>
                  <div className="rounded-md text-center p-4 border-2 border-dashed border-black bg-white transition">
                    <Upload size={28} className="mb-2 mx-auto text-black" />
                    <input
                      type="file"
                      id="reference"
                      name="reference"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <label htmlFor="reference" className="block cursor-pointer font-semibold text-black">
                      Click to upload <span className="font-normal text-black">or drag and drop</span>
                    </label>
                    <p className="text-xs mb-0 text-black">PNG, JPG up to 10MB</p>
                  </div>
                  {formData.reference && (
                    <div className="mt-2 text-xs text-black">
                      Selected: {formData.reference.name}
                    </div>
                  )}
                </div>
                <FancyButton as="button" type="submit" className="fancy-sm w-full" disabled={submitting}>
                  {submitting ? 'Submitting...' : (<><Send size={18} /> Submit Commission Request</>)}
                </FancyButton>
              </form>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="rounded-2xl shadow-sm bg-white mt-10">
          <div className="p-6 sm:p-10">
            <h2 className="font-bold text-lg mb-4 text-black">Frequently Asked Questions</h2>
            <div>
              {faqs.slice(0, visibleFaqs).map((item, idx) => (
                <div key={`${item.q}-${idx}`}
                  tabIndex={0}
                  className="border border-black rounded-lg px-4 py-3 bg-white cursor-pointer my-2 transition focus:border-2 focus:border-black focus:shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black">{item.q}</span>
                    <span className="text-xs ml-3 text-black/40">Hover or focus</span>
                  </div>
                  <div className="faq-answer text-xs text-gray-700 mt-2">{item.a}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {visibleFaqs < faqs.length && (
                <FancyButton as="button" type="button" className="fancy-sm" onClick={() => setVisibleFaqs((n) => Math.min(n + 4, faqs.length))}>
                  Show more ({faqs.length - visibleFaqs} left)
                </FancyButton>
              )}
              {visibleFaqs > 4 && (
                <FancyButton as="button" type="button" className="fancy-sm" onClick={() => setVisibleFaqs(4)}>
                  Show less
                </FancyButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomOrderPage;
