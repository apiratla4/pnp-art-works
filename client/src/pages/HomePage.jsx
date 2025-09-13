// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Users, Award, Palette, Sparkles, Paintbrush, Gem, Shield, GraduationCap, Calendar
} from 'lucide-react';
import axios from 'axios';

import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import FancyButton from '../components/FancyButton';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loadingProd, setLoadingProd] = useState(false);
  const [prodErr, setProdErr] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoadingProd(true);
        setProdErr('');
        const { data } = await axios.get(`${API_BASE}/api/products`, {
          params: { limit: 6 },
          withCredentials: true
        });
        const list = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
        if (isMounted) setProducts(list);
      } catch (e) {
        if (isMounted) setProdErr('Failed to load products');
      } finally {
        if (isMounted) setLoadingProd(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const featuredProducts = useMemo(
    () =>
      (products || []).map((p) => ({
        ...p,
        id: p.id || p._id || p.sku || crypto.randomUUID(),
        image: p.image || p.images?.[0] || p.cover || p.thumbnail
      })),
    [products]
  );

  const testimonials = [
    { id: 1, name: 'Sarah Johnson', text: 'The attention to detail in every piece is extraordinary. My custom painting exceeded all expectations!', rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: 2, name: 'Michael Chen', text: 'Beautiful artwork that transforms my living space. The quality is outstanding and delivery was perfect.', rating: 5,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: 3, name: 'Emily Rodriguez', text: "I've ordered multiple pieces and each one is a masterpiece. Highly recommend for art lovers!", rating: 5,
      avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }
  ];

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f1efef' }}>
      {/* HERO */}
      <section className="position-relative vh-100 overflow-hidden" style={{ backgroundColor: '#f1efef' }}>
        <HeroCarousel autoPlay interval={4000} showArrows showIndicators />
      </section>

      {/* STATS */}
      <section className="py-5" style={{ backgroundColor: '#f1efef' }}>
        <div className="container">
          <div className="row row-cols-2 row-cols-md-4 g-4 text-center">
            {[
              { icon: Palette, number: '500+', label: 'Artworks Created' },
              { icon: Users,   number: '1000+', label: 'Happy Customers' },
              { icon: Award,   number: '50+',   label: 'Awards Won' },
              { icon: Star,    number: '4.9',   label: 'Average Rating' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="d-flex justify-content-center mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: 64, height: 64, background: '#ffffff', color: '#000000' }}>
                    <stat.icon size={30} color="#000000" />
                  </div>
                </div>
                <div className="fs-3 fw-bold mb-1" style={{ color: '#000' }}>{stat.number}</div>
                <div style={{ color: '#000' }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="py-5" style={{ backgroundColor: '#f1efef' }}>
        <div className="container">
          <div className="row g-3 g-lg-4">
            {[
              { icon: Paintbrush, title: 'Handcrafted Originals', text: 'One-of-a-kind artworks made with archival materials.' },
              { icon: Gem,        title: 'Limited Editions',      text: 'Signed, numbered editions with certificates of authenticity.' },
              { icon: Sparkles,   title: 'Custom Commissions',    text: 'Tailored pieces created for specific spaces and moods.' },
              { icon: Shield,     title: 'Art-Safe Packaging',    text: 'Secure shipping worldwide with protective materials.' }
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }} className="col-12 col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm rounded-4" style={{ backgroundColor: '#ffffff', color: '#000' }}>
                  <div className="card-body">
                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                         style={{ width: 44, height: 44, background: '#ffffff', color: '#000000' }}>
                      <item.icon size={20} color="#000000" />
                    </div>
                    <h6 className="fw-semibold mb-1" style={{ color: '#000' }}>{item.title}</h6>
                    <p className="small mb-0" style={{ color: '#000' }}>{item.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ART CLASSES */}
      <section className="py-5" style={{ backgroundColor: '#f1efef' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
                      className="text-center mb-4 mb-lg-5">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                 style={{ width: 56, height: 56, background: '#ffffff', color: '#000000' }}>
              <GraduationCap size={26} color="#000000" />
            </div>
            <h2 className="fw-bold mb-2" style={{ color: '#000' }}>Learn with Art Classes</h2>
            <p className="lead mx-auto" style={{ maxWidth: 720, color: '#000' }}>
              Live online sessions now, with offline studio classes coming soon — build skills in drawing, acrylics, and watercolor
            </p>
          </motion.div>

          <div className="row g-3 g-lg-4 mb-4">
            {[
              { icon: Users, title: 'Small Cohorts', text: 'Personalized feedback and focused attention in limited-size groups.' },
              { icon: Calendar, title: 'Flexible Schedule', text: 'Weekend and evening batches designed around busy calendars.' },
              { icon: Paintbrush, title: 'Guided Techniques', text: 'Step‑by‑step demos to master fundamentals and explore styles.' }
            ].map((f, i) => (
              <motion.div key={f.title} className="col-12 col-md-4" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                <div className="card h-100 border-0 shadow-sm rounded-4" style={{ backgroundColor: '#ffffff', color: '#000' }}>
                  <div className="card-body">
                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                         style={{ width: 44, height: 44, background: '#ffffff', color: '#000000' }}>
                      <f.icon size={20} color="#000000" />
                    </div>
                    <h6 className="fw-semibold mb-1" style={{ color: '#000' }}>{f.title}</h6>
                    <p className="small mb-0" style={{ color: '#000' }}>{f.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <FancyButton to="/art-classes" className="fancy-sm">
              Explore Art Classes
            </FancyButton>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS FROM API */}
      <section className="py-5" style={{ backgroundColor: '#f1efef' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
                      className="text-center mb-4 mb-lg-5">
            <h2 className="fw-bold mb-2" style={{ color: '#000' }}>Featured Artworks</h2>
            <p className="lead mx-auto" style={{ maxWidth: 720, color: '#000' }}>
              Discover our most popular and recently created masterpieces
            </p>
          </motion.div>

          {prodErr && (
            <div className="alert d-flex align-items-center" role="alert" style={{ background: '#fff', color: '#000', border: '1px solid #000' }}>
              {prodErr}
            </div>
          )}

          <div className="row g-4 mb-4">
            {loadingProd ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm rounded-4 placeholder-wave" style={{ minHeight: 320, backgroundColor: '#ffffff' }}>
                    <div className="card-body">
                      <div className="placeholder col-12 mb-3" style={{ height: 180 }} />
                      <div className="placeholder col-6" />
                      <div className="placeholder col-4 mt-2" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featuredProducts.map((product, idx) => (
                <motion.div key={product.id} className="col-12 col-md-6 col-lg-4" initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: idx * 0.1 }} viewport={{ once: true }}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center">
            <FancyButton to="/shop" className="fancy-sm">
              View All Artworks
            </FancyButton>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-5" style={{ backgroundColor: '#f1efef' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
                      className="text-center mb-4 mb-lg-5">
            <h2 className="fw-bold mb-2" style={{ color: '#000' }}>What Our Customers Say</h2>
            <p className="" style={{ color: '#000' }}>Trusted by art lovers worldwide</p>
          </motion.div>

          <div className="row g-4">
            {testimonials.map((t, idx) => (
              <motion.div key={t.id} className="col-12 col-md-4" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: idx * 0.1 }} viewport={{ once: true }}>
                <div className="card h-100 border-0 shadow-sm rounded-4" style={{ backgroundColor: '#ffffff', color: '#000' }}>
                  <div className="card-body p-4">
                    <div className="d-flex mb-3">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={18} color="#000000" fill="#000000" />
                      ))}
                    </div>
                    <p className="fst-italic mb-4" style={{ color: '#000' }}>“{t.text}”</p>
                    <div className="d-flex align-items-center gap-3">
                      <img src={t.avatar} alt={t.name} className="rounded-circle object-fit-cover" style={{ width: 48, height: 48 }} />
                      <div>
                        <div className="fw-semibold" style={{ color: '#000' }}>{t.name}</div>
                        <div className="small" style={{ color: '#000' }}>Verified Customer</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER (black background with auto-invert buttons) */}
      <section className="py-5 on-dark" style={{ backgroundColor: '#000000' }}>
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="fw-bold mb-2" style={{ color: '#ffffff' }}>Stay Connected</h2>
            <p className="lead mb-4" style={{ color: '#ffffff' }}>
              Subscribe to get updates on new artworks, exhibitions, and exclusive offers
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mx-auto" style={{ maxWidth: 460 }}>
              <input
                type="email"
                className="form-control form-control-lg rounded-pill"
                placeholder="Enter your email"
                style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#ffffff' }}
                aria-label="Email address"
              />
              <FancyButton as="button" type="button" className="fancy-sm">
                Subscribe
              </FancyButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
