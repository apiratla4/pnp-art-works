import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Users, Award, Palette, Sparkles, Paintbrush, Gem, Shield, GraduationCap, Calendar
} from 'lucide-react';
import axios from 'axios';

import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import FancyButton from '../components/FancyButton';
import TestimonialsCarousel from '../components/TestimonialsCarousel';

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
          params: { limit: 24 },
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
      (products || [])
        .filter((p) => p.featured === true)
        .slice(0, 6)
        .map((p) => ({
          ...p,
          id: p.id || p._id || p.sku || crypto.randomUUID(),
          image: p.image || p.images?.[0] || p.cover || p.thumbnail
        })),
    [products]
  );

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      text: 'The attention to detail in every piece is extraordinary. My custom painting exceeded all expectations!',
      rating: 5,
      avatar:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: 2,
      name: 'Michael Chen',
      text: 'Beautiful artwork that transforms my living space. The quality is outstanding and delivery was perfect.',
      rating: 5,
      avatar:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      text: "I've ordered multiple pieces and each one is a masterpiece. Highly recommend for art lovers!",
      rating: 5,
      avatar:
        'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1efef]">
      <style>{`
        .icon-circle { width: 64px; height: 64px; background: #fff; color: #000; border: 1px solid #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .icon-circle-sm { width: 44px; height: 44px; background: #fff; color: #000; border: 1px solid #000; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; }
        .icon-circle-md { width: 56px; height: 56px; background: #fff; color: #000; border: 1px solid #000; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; }
        .icon-chip { display: inline-flex; align-items: center; justify-content: center; border: 1px solid #000; border-radius: 8px; padding: 2px; }
      `}</style>

      {/* HERO */}
      <section className="relative overflow-hidden px-4 sm:px-0" style={{ backgroundColor: '#f1efef', minHeight: '82vh' }}>
        <HeroCarousel autoPlay interval={4000} showArrows showIndicators />
      </section>

      {/* HIGHLIGHTS */}
      <section className="py-10 px-4 sm:px-0" style={{ backgroundColor: '#f1efef' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Paintbrush, title: 'Handcrafted Originals', text: 'One-of-a-kind artworks made with archival materials.' },
              { icon: Gem, title: 'Limited Editions', text: 'Signed, numbered editions with certificates of authenticity.' },
              { icon: Sparkles, title: 'Custom Commissions', text: 'Tailored pieces created for specific spaces and moods.' },
              { icon: Shield, title: 'Art-Safe Packaging', text: 'Secure shipping worldwide with protective materials.' }
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }} className="w-full">
                <div className="card h-full border-0 shadow-sm rounded-2xl p-6 bg-white text-black">
                  <div className="icon-circle-sm mb-2">
                    <item.icon size={20} color="#000000" />
                  </div>
                  <h6 className="fw-semibold mb-1 text-black">{item.title}</h6>
                  <p className="small mb-0 text-black">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ART CLASSES */}
      <section className="py-10 px-4 sm:px-0" style={{ backgroundColor: '#f1efef' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="text-center mb-8">
            <div className="icon-circle-md mb-3">
              <GraduationCap size={26} color="#000000" />
            </div>
            <h2 className="font-bold mb-2 text-black">Learn with Art Classes</h2>
            <p className="mx-auto text-black" style={{ maxWidth: 720 }}>
              Live online sessions now, with offline studio classes coming soon build skills in drawing, acrylics, and watercolor
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Users, title: 'Small Cohorts', text: 'Personalized feedback and focused attention in limited-size groups.' },
              { icon: Calendar, title: 'Flexible Schedule', text: 'Weekend and evening batches designed around busy calendars.' },
              { icon: Paintbrush, title: 'Guided Techniques', text: 'Step‑by‑step demos to master fundamentals and explore styles.' }
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                <div className="card h-full border-0 shadow rounded-2xl p-6 bg-white text-black">
                  <div className="icon-circle-sm mb-2">
                    <f.icon size={20} color="#000000" />
                  </div>
                  <h6 className="font-semibold mb-1 text-black">{f.title}</h6>
                  <p className="small mb-0 text-black">{f.text}</p>
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

      {/* FEATURED PRODUCTS */}
      <section className="py-10 px-4 sm:px-0" style={{ backgroundColor: '#f1efef' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
            className="text-center mb-8">
            <h2 className="font-bold mb-2 text-black">Featured Artworks</h2>
            <p className="mx-auto text-black" style={{ maxWidth: 720 }}>
              Discover our most popular and recently created masterpieces
            </p>
          </motion.div>
          {prodErr && (
            <div className="alert flex items-center" role="alert" style={{ background: '#fff', color: '#000', border: '1px solid #000' }}>
              {prodErr}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-8">
            {loadingProd ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-full">
                  <div className="card h-96 border-0 shadow rounded-2xl p-2 bg-white">
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
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </div>
          {featuredProducts.length === 0 && !loadingProd && (
            <div className="text-center text-gray-400 py-3 text-lg">No featured products to show.</div>
          )}
          <div className="text-center">
            <FancyButton to="/shop" className="fancy-sm">
              View All Artworks
            </FancyButton>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 px-4 sm:px-0" style={{ backgroundColor: '#f1efef' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-7 text-center">
          {[
            { icon: Palette, number: '500+', label: 'Artworks Created' },
            { icon: Users, number: '1000+', label: 'Happy Customers' },
            { icon: Award, number: '50+', label: 'Awards Won' },
            { icon: Star, number: '4.9', label: 'Average Rating' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="icon-circle mb-2">
                <stat.icon size={30} color="#000000" />
              </div>
              <div className="text-2xl font-bold text-black">{stat.number}</div>
              <div className="text-black">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-10 px-4 sm:px-0" style={{ backgroundColor: '#f1efef' }}>
        <TestimonialsCarousel />
      </section>

    </div>
  );
}

export default HomePage;
