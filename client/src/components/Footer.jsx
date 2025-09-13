// src/components/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MapPin, Phone, Instagram, Facebook, Twitter, Youtube, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import './Footer.css';
import logo from '../assets/pnplogo2.svg';
import FancyButton from './FancyButton';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const year = new Date().getFullYear();

const Footer = () => {
  // Newsletter state
  const [subEmail, setSubEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'ok', text: '' });

  const showToast = (type, text) => {
    setToast({ show: true, type, text });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  const onSubscribe = async (e) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/api/newsletters/subscribe`,
        { email: subEmail.trim() },
        { withCredentials: true }
      );
      setSubEmail('');
      showToast('ok', 'Subscribed. Check inbox for future updates.');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Subscription failed. Try again.';
      showToast('err', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="pt-5 footer-root on-dark" style={{ backgroundColor: '#000' }}>
      {/* Top divider (monochrome) */}
      <div className="w-100" style={{ height: 4, background: '#fff' }} />

      <div className="container py-5">
        <div className="row g-4 g-lg-5">
          {/* Brand + About */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img
                src={logo}
                alt="PnpArtStudio — by Priyanka Vasishta"
                className="footer-logo"
                height={44}
                width={44}
                loading="eager"
                decoding="async"
              />
              <div className="lh-1">
                <div className="fw-bold fs-5" style={{ color: '#fff' }}>
                  PnpArtStudio
                </div>
                <small className="text-muted-contrast" style={{ color: '#fff' }}>
                  Original Paintings &amp; Art by Priyanka Vasishta
                </small>
              </div>
            </div>

            <p className="mb-3" style={{ color: '#fff' }}>
              Handcrafted originals, limited editions, and custom commissions made with archival materials and a collector‑first approach.
            </p>

            <div className="d-flex gap-2">
              {[{ Icon: Instagram, href: 'https://www.instagram.com/pnp.artstudio?igsh=MThxbzJsZHg1d29rYw==', label: 'Instagram' },
                { Icon: Facebook,  href: 'https://www.facebook.com/profile.php?id=100064142585253', label: 'Facebook' },
                { Icon: Youtube,   href: 'https://youtube.com/@pnpartstudio?si=XtS7itrq6cyrgOdw', label: 'YouTube' },
                { Icon: Twitter,   href: 'https://x.com', label: 'Twitter/X' }].map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="social-btn-invert"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="fw-semibold mb-3" style={{ color: '#fff' }}>Quick Links</h6>
            <ul className="list-unstyled vstack gap-2 mb-0">
              <li><Link className="footer-link" to="/">Home</Link></li>
              <li><Link className="footer-link" to="/about">About</Link></li>
              <li><Link className="footer-link" to="/gallery">Gallery</Link></li>
              <li><Link className="footer-link" to="/blog">Blog</Link></li>
              <li><Link className="footer-link" to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Shop */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="fw-semibold mb-3" style={{ color: '#fff' }}>Shop</h6>
            <ul className="list-unstyled vstack gap-2 mb-0">
              <li><Link className="footer-link" to="/shop">All Products</Link></li>
              <li><Link className="footer-link" to="/shop/category/paintings">Paintings</Link></li>
              <li><Link className="footer-link" to="/shop/category/handcrafted-items">Handcrafted</Link></li>
              <li><Link className="footer-link" to="/shop/category/digital-prints">Digital Prints</Link></li>
              <li><Link className="footer-link" to="/custom-order">Custom Orders</Link></li>
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div className="col-12 col-md-6 col-lg-4">
            <h6 className="fw-semibold mb-3" style={{ color: '#fff' }}>Contact</h6>
            <div className="vstack gap-2 small mb-3" style={{ color: '#fff' }}>
              <div className="d-flex align-items-start gap-2">
                <MapPin size={16} className="mt-1" />
                <span>123 Art Street, Creative District, City, State 12345</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Phone size={16} />
                <a className="footer-link" href="tel:+17135769741">+1 (713) 576‑9741</a>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Mail size={16} />
                <a className="footer-link" href="mailto:pnp.artstudio7@gmail.com">pnp.artstudio7@gmail.com</a>
              </div>
            </div>

            {/* Newsletter */}
            <div className="newsletter-box position-relative overflow-visible">
              <div className="fw-semibold mb-2" style={{ color: '#fff' }}>Stay in the loop</div>
              <form className="d-flex gap-2" onSubmit={onSubscribe}>
                <input
                  type="email"
                  required
                  className="form-control rounded-pill"
                  placeholder="Email address"
                  aria-label="Email address"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  disabled={submitting}
                  style={{ background: '#fff', color: '#000' }}
                />
                <FancyButton as="button" type="submit" className="fancy-sm" disabled={submitting}>
                  {submitting ? 'Subscribing…' : <>Subscribe <ArrowRight size={16} /></>}
                </FancyButton>
              </form>

              {/* Animated toast (monochrome) */}
              <AnimatePresence>
                {toast.show && (
                  <motion.div
                    key="footer-toast"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="mono-toast-invert mt-2"
                    role="status"
                    aria-live="polite"
                  >
                    {toast.text}
                  </motion.div>
                )}
              </AnimatePresence>
              <small className="d-block mt-1" style={{ color: '#fff' }}>No spam. Unsubscribe anytime.</small>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-top" style={{ borderColor: 'rgba(255,255,255,0.25)' }}>
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
            <small className="mb-0" style={{ color: '#fff' }}>© {year} PnpArtStudio. All rights reserved.</small>
            <div className="d-flex align-items-center gap-3 small">
              <Link to="/terms" className="footer-link">Terms</Link>
              <Link to="/privacy" className="footer-link">Privacy</Link>
              <Link to="/returns" className="footer-link">Returns</Link>
              <Link to="/shipping" className="footer-link">Shipping</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Local styles for dark footer + focus-visible */}
      <style>{`
        .footer-link {
          color: #fff;
          text-decoration: none;
          position: relative;
        }
        .footer-link:hover { text-decoration: underline; }
        .footer-link:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #fff, 0 0 0 5px #000;
        }
        .footer-link:focus { outline: 2px solid #fff; outline-offset: 2px; }

        .social-btn-invert {
          width: 40px; height: 40px; border-radius: 50%;
          background: #fff; color: #000; border: 2px solid #fff;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background-color 160ms ease, color 160ms ease, transform 120ms ease, box-shadow 120ms ease, border-color 160ms ease;
        }
        .social-btn-invert:hover { background: #000; color: #fff; border-color: #fff; }
        .social-btn-invert:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #fff, 0 0 0 5px #000;
        }
        .social-btn-invert:focus { outline: 2px solid #fff; outline-offset: 2px; }

        .newsletter-box {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 16px;
          padding: 12px;
        }

        .mono-toast-invert {
          border: 1px solid #fff;
          background: #000;
          color: #fff;
          border-radius: 8px;
          padding: 8px 12px;
          display: inline-block;
        }

        /* Inputs focus on dark */
        .form-control:focus {
          border-color: #000 !important; /* input is white; the UA ring is removed */
          box-shadow: none !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
