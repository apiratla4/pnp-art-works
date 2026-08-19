import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Instagram, Facebook, Youtube } from 'lucide-react';
import axios from "axios";
import logo from '../assets/pnplogowhite.png';

const mint = "rgb(159,227,117)";
const year = new Date().getFullYear();

const socialLinks = [
  { Icon: Instagram, href: 'https://www.instagram.com/pnp.artstudio?igsh=MThxbzJsZHg1d29rYw==', label: 'Instagram' },
  { Icon: Facebook, href: 'https://www.facebook.com/profile.php?id=100064142585253', label: 'Facebook' },
  { Icon: Youtube, href: 'https://youtube.com/@pnpartstudio?si=XtS7itrq6cyrgOdw', label: 'YouTube' },
];

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

const shopLinks = [
  { to: '/shop', label: 'All Products' },
  { to: '/shop/category/paintings', label: 'Paintings' },
  { to: '/shop/category/handcrafted-items', label: 'Handcrafted' },
  { to: '/shop/category/digital-prints', label: 'Digital Prints' },
  { to: '/custom-order', label: 'Custom Orders' },
];

const legalLinks = [
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/returns', label: 'Returns' },
  { to: '/shipping', label: 'Shipping' },
];

const API_BASE = import.meta.env.VITE_API_URL || "";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subState, setSubState] = useState({ loading: false, success: false, error: "", already: false });

  const validateEmail = (value) =>
    /^([a-z0-9._%+-]+)@(gmail\.com|yahoo\.com|hotmail\.com)$/i.test(value);

  // Real-time check if email is subscribed before POST
  const checkIfSubscribed = async (email) => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/newsletters/subscriber-exists`, {
        params: { email }
      });
      return !!data?.exists;
    } catch {
      return false;
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubState({ loading: true, success: false, error: "", already: false });

    if (!validateEmail(email)) {
      setSubState({
        loading: false,
        success: false,
        error: "Enter a valid @gmail.com, @yahoo.com, or @hotmail.com address",
        already: false
      });
      return;
    }

    if (await checkIfSubscribed(email)) {
      setSubState({
        loading: false,
        success: false,
        error: "",
        already: true
      });
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/newsletters/subscribe`, { email });
      setSubState({ loading: false, success: true, error: "", already: false });
      setEmail('');
    } catch(err) {
      if (err.response && err.response.status === 409) {
        setSubState({
          loading: false,
          success: false,
          error: "",
          already: true
        });
      } else if (err.response?.data?.message) {
        setSubState({
          loading: false,
          success: false,
          error: err.response.data.message,
          already: false
        });
      } else {
        setSubState({
          loading: false,
          success: false,
          error: "Subscription failed. Please try again.",
          already: false
        });
      }
    }
  };

  return (
    <footer className="bg-black pt-5 text-white">
      <div className="w-full h-1 bg-white" />
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 sm:gap-y-10 gap-x-8 lg:gap-x-9">
          {/* Brand/About & Subscriber */}
          <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
            <div className="flex gap-3 items-center mb-2">
              <img
                src={logo}
                alt="PnPArtStudio by Priyanka Vasishta"
                className="block rounded-lg w-16 h-16 sm:w-20 sm:h-20"
                loading="eager"
                decoding="async"
              />
              <div>
                <div className="font-extrabold text-white" style={{ fontSize: "1.5rem", lineHeight: 1 }}>
                  PnpArtStudio
                </div>
                <div className="text-white opacity-90 text-xs font-medium lowercase">
                  Original Paintings & Art<br />by Priyanka Vasista
                </div>
              </div>
            </div>
            <p className="text-sm mb-3 text-white">
              Handcrafted originals, limited editions, and custom commissions made with archival materials and a collector‑first approach.
            </p>
            <form onSubmit={handleSubscribe} className="w-full flex flex-col items-start gap-1 mt-2 mb-3">
              <label htmlFor="news-email" className="text-xs text-white font-semibold mb-1">
                SUBSCRIBE
              </label>
              <div className="flex w-full">
                <input
                  id="news-email"
                  type="email"
                  className="rounded-l-lg px-3 py-2 text-black text-sm sm:text-base bg-white border-none focus:ring-2 focus:ring-[#9fe375] font-semibold w-full min-w-0"
                  placeholder="Your email"
                  value={email}
                  disabled={subState.loading}
                  onChange={e => { setEmail(e.target.value); setSubState({ loading: false, success: false, error: "", already: false }); }}
                  required
                />
                <button
                  type="submit"
                  className="bg-[#9fe375] hover:bg-[#8cd660] transition px-5 py-2 rounded-r-lg font-bold text-black text-base border-l border-white/30"
                  style={{ boxShadow: "0 2px 12px 0 #9fe37522" }}
                  disabled={subState.loading}
                >
                  {subState.loading ? "..." : "Join"}
                </button>
              </div>
              {subState.error && (
                <span className="text-xs text-red-300 mt-1">{subState.error}</span>
              )}
              {subState.success && (
                <span className="text-xs text-green-300 mt-1">Thank you for subscribing!</span>
              )}
              {subState.already && (
                <span className="text-xs text-yellow-300 mt-1">You are already a subscriber!</span>
              )}
            </form>
            <div className="flex gap-2 mt-2">
              {socialLinks.map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.93 }}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="rounded-full w-10 h-10 flex items-center justify-center border-2 border-white bg-white text-black hover:bg-black hover:text-white transition-shadow focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h6 className="font-semibold mb-4 text-lg">Quick Links</h6>
            <ul className="flex flex-col gap-2 text-base">
              {quickLinks.map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="transition rounded"
                    style={{ color: mint }}
                    onMouseOver={e => { e.currentTarget.style.color = "#fff"; }}
                    onMouseOut={e => { e.currentTarget.style.color = mint; }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Shop */}
          <div>
            <h6 className="font-semibold mb-4 text-lg">Shop</h6>
            <ul className="flex flex-col gap-2 text-base">
              {shopLinks.map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="transition rounded"
                    style={{ color: mint }}
                    onMouseOver={e => { e.currentTarget.style.color = "#fff"; }}
                    onMouseOut={e => { e.currentTarget.style.color = mint; }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h6 className="font-semibold mb-3 text-lg">Contact</h6>
            <div className="flex flex-col gap-2 mb-2 text-base">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-1" />
                <span>579 Brook Meadow Dr Ballwin, MO 63021</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <a
                  className="transition rounded"
                  href="tel:+17135769741"
                  style={{ color: mint }}
                  onMouseOver={e => { e.currentTarget.style.color = "#fff"; }}
                  onMouseOut={e => { e.currentTarget.style.color = mint; }}
                >+1 (713) 576‑9741</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <a
                  className="transition rounded"
                  href="mailto:pnp.artstudio7@gmail.com"
                  style={{ color: mint }}
                  onMouseOver={e => { e.currentTarget.style.color = "#fff"; }}
                  onMouseOut={e => { e.currentTarget.style.color = mint; }}
                >pnp.artstudio7@gmail.com</a>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="border-t border-white/25 mt-8 sm:mt-10 pt-5 flex flex-col sm:flex-row sm:justify-between items-center gap-2 text-sm">
          <small className="text-white text-center sm:text-left">&copy; {year} PnpArtStudio. All rights reserved.</small>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
            {legalLinks.map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                className="transition rounded"
                style={{ color: mint }}
                onMouseOver={e => { e.currentTarget.style.color = "#fff"; }}
                onMouseOut={e => { e.currentTarget.style.color = mint; }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
