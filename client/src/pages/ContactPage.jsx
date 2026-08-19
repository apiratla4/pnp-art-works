import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Instagram, Facebook, CheckCircle, Youtube, AlertTriangle } from 'lucide-react';
import FancyButton from '../components/FancyButton';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: '',
    countryCode: '+1',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const COUNTRY_CODES = [
    { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
    { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
    // ...add more countries as needed
  ];

  const contactInfo = [
    { icon: MapPin, title: 'Visit Our Studio', details: '579 Brook Meadow Dr Ballwin, MO 63021', subDetails: 'Missouri, United States' },
    { icon: Phone,  title: 'Call Us',         details: '+1 (713) 576‑9741',   subDetails: 'Monday - Friday : 9AM - 6PM' },
    { icon: Mail,   title: 'Email Us',        details: 'pnp.artstudio7@gmail.com', subDetails: "We reply within 24 hours" },
    { icon: Clock,  title: 'Studio Hours',    details: 'Monday - Friday : 9AM - 6PM', subDetails: 'Saturday - Sunday : 10AM - 4PM' }
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/pnp.artstudio/', label: 'Instagram' },
    { icon: Facebook,  href: 'https://www.facebook.com/people/PnP-art-studio/100064142585253/', label: 'Facebook' },
    { icon: Youtube,   href: 'https://www.youtube.com/@pnpartstudio', label: 'YouTube' }
  ];

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Please fill all required fields (name, email, message).');
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/contact/submit`, {
        ...formData,
        phone: formData.phone ? `${formData.countryCode}${formData.phone}` : ''
      }, { withCredentials: true });
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '', phone: '', countryCode: '+1' });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || 'Failed to send message. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1efef] py-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-12">
        {/* Header */}
        <div className="text-center mb-2">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-black">Get in Touch</motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-2xl mx-auto text-lg text-gray-700"
          >
            Have questions about our artwork? Want to commission a custom piece? We’d love to hear from you.
          </motion.p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, i) => {
            const Icon = info.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className="rounded-2xl bg-white shadow p-6 border border-black/10 flex flex-col items-start"
              >
                <span className="mb-4 w-12 h-12 rounded-full border border-black bg-white text-black flex items-center justify-center">
                  <Icon size={24} />
                </span>
                <span className="font-bold mb-2 text-black">{info.title}</span>
                <span className="mb-1 font-medium text-sm text-black">{info.details}</span>
                <span className="text-xs text-gray-500">{info.subDetails}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Main grid: form & aside */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="rounded-2xl bg-white shadow p-8 border border-black/10">
              <h2 className="text-xl font-bold mb-5 text-black">Send us a Message</h2>
              {isSubmitted &&
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 border border-black bg-white rounded-lg px-3 py-2 mb-4 text-black text-sm font-semibold">
                  <CheckCircle size={20} className="text-green-700" />
                  Thank you! We'll get back to you soon.
                </motion.div>
              }
              {errorMsg && !isSubmitted &&
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 border border-black/30 bg-red-50 rounded-lg px-3 py-2 mb-4 text-black text-sm font-semibold">
                  <AlertTriangle size={20} className="text-red-700" />
                  {errorMsg}
                </motion.div>
              }

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-black mb-1">Full Name *</label>
                  <input
                    type="text" name="name" required value={formData.name} onChange={handleChange}
                    className="w-full border border-black/10 bg-white py-2 px-3 rounded-lg text-black focus:border-black focus:outline-none"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-black mb-1">Email Address *</label>
                  <input
                    type="email" name="email" required value={formData.email} onChange={handleChange}
                    className="w-full border border-black/10 bg-white py-2 px-3 rounded-lg text-black focus:border-black focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-black mb-1">Phone</label>
                  <div className="flex gap-2">
                    <select
                      name="countryCode" className="border border-black/10 px-2 py-2 rounded-lg bg-white text-black focus:border-black focus:outline-none"
                      style={{ maxWidth: 90 }} value={formData.countryCode} onChange={handleChange}
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.dial}>{c.flag} {c.dial}</option>
                      ))}
                    </select>
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full border border-black/10 py-2 px-3 rounded-lg text-black bg-white focus:border-black focus:outline-none"
                      placeholder="1234567890"
                      inputMode="tel" autoComplete="tel"
                    />
                  </div>
                  <small className="text-xs text-gray-500">Select country code and enter your number</small>
                </div>
                <div>
                  <label className="text-xs font-bold text-black mb-1">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-black/10 py-2 px-3 rounded-lg bg-white text-black focus:border-black focus:outline-none"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="commission">Custom Order/Commission</option>
                    <option value="workshop">Workshop Information</option>
                    <option value="purchase">Purchase Inquiry</option>
                    <option value="exhibition">Exhibition/Gallery</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-black mb-1">Message *</label>
                  <textarea
                    name="message" required rows={6} value={formData.message} onChange={handleChange}
                    className="w-full border border-black/10 py-2 px-3 rounded-lg text-black bg-white focus:border-black focus:outline-none resize-none"
                    placeholder="Tell us about your inquiry, custom order details, or any questions you have..." />
                </div>
                <div className="md:col-span-2">
                  <FancyButton as="button" type="submit" className="fancy-sm w-full" disabled={submitting}>
                    <span className="inline-flex items-center gap-2 justify-center">
                      <Send size={18} />
                      {submitting ? 'Sending…' : 'Send Message'}
                    </span>
                  </FancyButton>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Social Media & Workshops */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8">
            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow p-8 border border-black/10">
              <h3 className="text-xl font-extrabold mb-2 text-black">Follow Our Journey</h3>
              <p className="mb-4 text-black">
                Get behind-the-scenes, workshop updates and new artwork reveals by following us!
              </p>
              <div className="flex gap-3">
                {socialLinks.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.a
                      key={i}
                      href={s.href}
                      whileHover={{ scale: 1.09 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-11 h-11 rounded-lg bg-black text-white border-2 border-black flex items-center justify-center hover:bg-white hover:text-black transition focus-visible:ring-2 focus-visible:ring-black outline-none"
                      aria-label={s.label}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon size={20} />
                    </motion.a>
                  );
                })}
              </div>
            </div>
            {/* Workshop */}
            <div className="rounded-2xl p-8 border border-black/10 bg-white flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-black">🎨 Art Workshops Available</h3>
              <p className="mb-2 text-black">Join our hands-on workshops to learn painting, enhance creativity, and make your own art!</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full border border-black bg-white text-black font-semibold text-xs">Beginner Friendly</span>
                <span className="px-3 py-1 rounded-full border border-black bg-white text-black font-semibold text-xs">All Materials Included</span>
                <span className="px-3 py-1 rounded-full border border-black bg-white text-black font-semibold text-xs">Small Groups</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
