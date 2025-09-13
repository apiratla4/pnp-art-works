// src/pages/CustomOrderPage.jsx (Monochrome + Fancy buttons)
import React, { useState } from 'react';
import customart from "../assets/custom_art_video.mp4";
import { Palette, Upload, MessageSquare, DollarSign, CheckCircle } from 'lucide-react';
import FancyButton from '../components/FancyButton';

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files ? e.target.files : null;
    setFormData(prev => ({ ...prev, reference: file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Custom order submitted:', formData);
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
          ].map((s, i) => {
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

            <form onSubmit={handleSubmit} className="vstack gap-4">
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

              <div className="rounded-3 p-3" style={{ background: '#fff', border: '1px solid #000', color: '#000' }}>
                <h3 className="h6 fw-semibold mb-2">What happens next?</h3>
                <ul className="small mb-0" style={{ color: '#000' }}>
                  <li>I’ll review the request within 24 hours</li>
                  <li>A detailed quote and timeline will be shared</li>
                  <li>We can schedule a consultation call if needed</li>
                  <li>Upon approval, creation of the artwork begins</li>
                </ul>
              </div>

              <FancyButton as="button" type="submit" className="fancy-sm w-100">
                Submit Commission Request
              </FancyButton>
            </form>
          </div>
        </div>

        {/* FAQ */}
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
                <FancyButton as="button"
                  type="button"
                  className="fancy-sm"
                  onClick={() => setVisibleFaqs((n) => Math.min(n + 4, faqs.length))}
                  aria-controls="faq-list"
                  aria-expanded={visibleFaqs > 4}
                >
                  Show more ({faqs.length - visibleFaqs} left)
                </FancyButton>
              )}

              {visibleFaqs > 4 && (
                <FancyButton as="button"
                  type="button"
                  className="fancy-sm"
                  onClick={() => setVisibleFaqs(4)}
                  aria-controls="faq-list"
                  aria-expanded={false}
                >
                  Show less
                </FancyButton>
              )}
            </div>

            <style>{`
              .faq-item {
                background-color: #fff;
                border: 1px solid #000;
                transition: box-shadow .18s ease, border-color .18s ease, transform .18s ease;
                outline: none;
                cursor: pointer;
              }
              .faq-item:hover, .faq-item:focus-within {
                border-color: #000;
                box-shadow: 0 8px 20px rgba(0,0,0,0.12);
                transform: translateY(-1px);
              }
              .faq-answer {
                max-height: 0;
                opacity: 0;
                overflow: hidden;
                transition: max-height .25s ease, opacity .2s ease;
              }
              .faq-item:hover .faq-answer,
              .faq-item:focus-within .faq-answer {
                max-height: 200px;
                opacity: 1;
              }
              /* Monochrome form focus and controls */
              .form-control:focus, .form-select:focus {
                border-color: #000 !important;
                box-shadow: none !important;
              }
              .form-check-input { accent-color: #000; }
              /* Keyboard focus ring for FAQ tiles */
              .faq-item:focus-visible {
                box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
              }
              .faq-item:focus { outline: 2px solid #000; outline-offset: 2px; }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomOrderPage;
