import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Users, Award, Palette
} from 'lucide-react';
import axios from 'axios';

import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import FancyButton from '../components/FancyButton';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import priyankaBioImg from '../assets/priyanka bio img.jpeg';

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

      {/* ARTIST BIO */}
      <section className="py-10 sm:py-12 px-4 sm:px-5 md:px-6" style={{ backgroundColor: '#f1efef' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h2 className="font-extrabold text-2xl sm:text-3xl md:text-4xl mb-4 text-black">Meet the Artist</h2>
              <p className="text-black/80 mb-3 leading-relaxed text-base">
                Hi, I&apos;m <strong>Priyanka Vasista</strong>  art has been part of my life since childhood,
                sparked by my father who painted as a hobby. Over 10+ years of teaching and creating,
                my work spans handcrafted originals, custom commissions, and guided art classes.
              </p>
              <p className="text-black/70 mb-5 leading-relaxed text-base">
                Art, for me, is a way to bring joy and meaning into people&apos;s lives  whether through a
                painting that decorates a home or a class that inspires a child.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6">
                {[
                  { number: '500+', label: 'Artworks Created' },
                  { number: '10+', label: 'Years Teaching' },
                  { number: '1000+', label: 'Happy Customers' },
                  { number: '50+', label: 'Awards Won' }
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-2xl border border-black/10 shadow-sm p-3 text-center">
                    <div className="font-extrabold text-black text-xl">{s.number}</div>
                    <div className="text-xs text-black/55 mt-0.5">{s.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1.5 rounded-full border bg-white text-black shadow-sm text-sm font-medium">🎨 Traditional Techniques</span>
                <span className="px-3 py-1.5 rounded-full border bg-white text-black shadow-sm text-sm font-medium">✨ Modern Innovation</span>
                <span className="px-3 py-1.5 rounded-full border bg-white text-black shadow-sm text-sm font-medium">💝 Custom Creations</span>
              </div>
              <FancyButton to="/about" className="fancy-sm">Read Full Story</FancyButton>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="rounded-3xl overflow-hidden shadow-xl relative">
                <img
                  src={priyankaBioImg}
                  alt="Priyanka Vasista - Artist"
                  className="block w-full h-[300px] sm:h-[380px] md:h-[460px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl shadow px-5 py-3">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} color="#000" fill="#000" />
                    ))}
                  </div>
                  <div className="text-sm font-semibold text-black">4.9 / 5 Rating</div>
                  <div className="text-xs text-black/60">1000+ happy customers</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-8 sm:py-10 px-4 sm:px-5 md:px-6" style={{ backgroundColor: '#f1efef' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
            className="text-center mb-6 sm:mb-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 mb-6 sm:mb-8">
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
      <section className="py-8 sm:py-10 px-4 sm:px-5 md:px-6" style={{ backgroundColor: '#f1efef' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-7 text-center">
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
