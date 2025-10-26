// src/pages/CustomOrderPage.jsx (Monochrome + Fancy buttons)
import React, { useState } from 'react';
import axios from 'axios';
import customart from "../assets/custom_art_video.mp4";
import { Palette, Upload, MessageSquare, DollarSign, CheckCircle, Send, AlertTriangle } from 'lucide-react';
import FancyButton from '../components/FancyButton';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
  const [status, setStatus] = useState({ type: '', message: '' }); // 'success' | 'error' | ''

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Single file input
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFormData(prev => ({ ...prev, reference: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // minimal client validation
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
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit. Please try again.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

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

  const [visibleFaqs, setVisibleFaqs] = useState(4);

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: '#f1efef' }}>
      {/* Hero */}
      <div className="container mb-4">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ background: '#fff', color: '#000' }}>
          <div className="row g-0 align-items-stretch">
            <div className="col-12 col-lg-6 d-flex h-100">
              <video
                src={customart}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="w-100 h-100"
                style={{ objectFit: "cover", display: "block" }}
              />
            </div>
            <div className="col-12 col-lg-6">
              <div className="p-4 p-lg-5">
                <div className="d-flex justify-content-start mb-3">
                  <div
                    className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                    style={{ background: '#fff', border: '2px solid #000', color: '#000' }}
                  >
                    <Palette size={28} />
                  </div>
                </div>
                <h2 className="fw-bold mb-2" style={{ color: '#000' }}>Commission Custom Art</h2>
                <p className="mb-0" style={{ color: '#000' }}>
                  Transform ideas into one‑of‑a‑kind pieces crafted to brief, budget, and timeline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container" style={{ maxWidth: 960 }}>
        {/* Steps */}
        <div className="row row-cols-1 row-cols-md-4 g-3 g-md-4 mb-5">
          {[
            { icon: MessageSquare, title: '1. Consultation', text: 'Share the vision and requirements' },
            { icon: DollarSign,    title: '2. Quote',        text: 'Receive detailed pricing and timeline' },
            { icon: Palette,       title: '3. Creation',     text: 'The artwork comes to life' },
            { icon: CheckCircle,   title: '4. Delivery',     text: 'Receive the masterpiece' }
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="col text-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                  style={{ width: 48, height: 48, background: '#fff', color: '#000', border: '1px solid #000' }}
                >
                  <Icon size={22} />
                </div>
                <h3 className="h6 fw-semibold mb-1" style={{ color: '#000' }}>{s.title}</h3>
                <p className="small mb-0" style={{ color: '#000' }}>{s.text}</p>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div className="card border-0 shadow-sm rounded-4" style={{ background: '#fff', color: '#000' }}>
          <div className="card-body p-4 p-lg-5">
            <h2 className="h4 fw-bold mb-4" style={{ color: '#000' }}>Commission Request Form</h2>

            {status.type === 'success' ? (
              <div className="mono-alert" style={{ borderColor: '#0f5132', background: '#d1e7dd', color: '#0f5132' }}>
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle size={20} />
                  <div className="fw-semibold">Request Sent!</div>
                </div>
                <div className="small mt-1">{status.message}</div>
                <div className="mt-3">
                  <FancyButton as="button" type="button" className="fancy-sm" onClick={() => setStatus({ type: '', message: '' })}>
                    Submit Another Request
                  </FancyButton>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="vstack gap-4">
                {status.type === 'error' && (
                  <div className="mono-alert" style={{ borderColor: '#842029', background: '#f8d7da', color: '#842029' }}>
                    <div className="d-flex align-items-center gap-2">
                      <AlertTriangle size={18} />
                      <div>{status.message}</div>
                    </div>
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label small fw-semibold">Full Name *</label>
                    <input type="text" id="name" name="name" required
                      value={formData.name} onChange={handleInputChange}
                      className="form-control" placeholder="Your full name" />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label small fw-semibold">Email Address *</label>
                    <input type="email" id="email" name="email" required
                      value={formData.email} onChange={handleInputChange}
                      className="form-control" placeholder="your@email.com" />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label small fw-semibold">Phone Number</label>
                    <input type="tel" id="phone" name="phone"
                      value={formData.phone} onChange={handleInputChange}
                      className="form-control" placeholder="Your phone number" />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="artType" className="form-label small fw-semibold">Art Type *</label>
                    <select id="artType" name="artType" required
                      value={formData.artType} onChange={handleInputChange}
                      className="form-select">
                      <option value="">Select art type</option>
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                      <option value="abstract">Abstract</option>
                      <option value="still-life">Still Life</option>
                      <option value="custom">Custom Design</option>
                    </select>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="size" className="form-label small fw-semibold">Preferred Size *</label>
                    <select id="size" name="size" required
                      value={formData.size} onChange={handleInputChange}
                      className="form-select">
                      <option value="">Select size</option>
                      <option value="small">Small (8x10 inches)</option>
                      <option value="medium">Medium (16x20 inches)</option>
                      <option value="large">Large (24x36 inches)</option>
                      <option value="custom">Custom Size</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="budget" className="form-label small fw-semibold">Budget Range</label>
                    <select id="budget" name="budget"
                      value={formData.budget} onChange={handleInputChange}
                      className="form-select">
                      <option value="">Select budget range</option>
                      <option value="under-500">Under $500</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="1000-2000">$1,000 - $2,000</option>
                      <option value="2000-plus">$2,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="deadline" className="form-label small fw-semibold">Preferred Completion Date</label>
                  <input type="date" id="deadline" name="deadline"
                    value={formData.deadline} onChange={handleInputChange}
                    className="form-control" />
                </div>

                <div>
                  <label htmlFor="description" className="form-label small fw-semibold">Project Description *</label>
                  <textarea id="description" name="description" required rows={6}
                    value={formData.description} onChange={handleInputChange}
                    className="form-control"
                    placeholder="Describe the vision: colors, style, subject, mood, and any specific requirements..." />
                </div>

                <div>
                  <label htmlFor="reference" className="form-label small fw-semibold">Reference Images</label>
                  <div className="rounded-3 text-center p-4"
                    style={{ border: '2px dashed #000', transition: 'border-color .2s' }}>
                    <Upload size={28} className="mb-2" style={{ color: '#000' }} />
                    <input
                      type="file"
                      id="reference"
                      name="reference"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="d-none"
                    />
                    <label htmlFor="reference" className="d-block" style={{ cursor: 'pointer' }}>
                      <span className="fw-semibold" style={{ color: '#000' }}>
                        Click to upload
                      </span>
                      <span style={{ color: '#000' }}> or drag and drop</span>
                    </label>
                    <p className="small mb-0" style={{ color: '#000' }}>PNG, JPG up to 10MB</p>
                  </div>
                  {formData.reference && (
                    <div className="mt-2 small" style={{ color: '#000' }}>
                      Selected: {formData.reference.name}
                    </div>
                  )}
                </div>

                <FancyButton as="button" type="submit" className="fancy-sm w-100" disabled={submitting}>
                  {submitting ? 'Submitting...' : (<><Send size={18} /> Submit Commission Request</>)}
                </FancyButton>
              </form>
            )}
          </div>
        </div>

        {/* FAQ (unchanged, keep your styles) */}
        <div className="card border-0 shadow-sm rounded-4 mt-5" style={{ background: '#fff', color: '#000' }}>
          <div className="card-body p-4 p-lg-5">
            <h2 className="h4 fw-bold mb-4" style={{ color: '#000' }}>Frequently Asked Questions</h2>
            <div id="faq-list" className="vstack gap-2">
              {faqs.slice(0, visibleFaqs).map((item, idx) => (
                <div key={`${item.q}-${idx}`} className="faq-item p-3 rounded-3" tabIndex={0} aria-haspopup="true">
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="fw-semibold" style={{ color: '#000' }}>{item.q}</span>
                    <span className="small ms-3" style={{ color: '#000' }}>Hover or focus</span>
                  </div>
                  <div className="faq-answer small mt-2" style={{ color: '#000' }}>
                    {item.a}
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-center gap-2 mt-3">
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

            <style>{`
              .faq-item { background-color: #fff; border: 1px solid #000; transition: box-shadow .18s ease, border-color .18s ease, transform .18s ease; outline: none; cursor: pointer; }
              .faq-item:hover, .faq-item:focus-within { border-color: #000; box-shadow: 0 8px 20px rgba(0,0,0,0.12); transform: translateY(-1px); }
              .faq-answer { max-height: 0; opacity: 0; overflow: hidden; transition: max-height .25s ease, opacity .2s ease; }
              .faq-item:hover .faq-answer, .faq-item:focus-within .faq-answer { max-height: 200px; opacity: 1; }
              .form-control:focus, .form-select:focus { border-color: #000 !important; box-shadow: none !important; }
              .form-check-input { accent-color: #000; }
              .faq-item:focus-visible { box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
              .faq-item:focus { outline: 2px solid #000; outline-offset: 2px; }
              .mono-alert { border: 1px solid #000; background: #fff; color: #000; border-radius: 8px; padding: 12px 14px; }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomOrderPage;
