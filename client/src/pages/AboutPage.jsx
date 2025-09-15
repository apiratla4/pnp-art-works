// src/pages/AboutPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Award, Palette, Users, Star, Heart } from 'lucide-react';
import { Link } from "react-router-dom";
import FancyButton from '../components/FancyButton';

const AboutPage = () => {
  const achievements = [
    { icon: Award, number: '50+', label: 'Awards Won' },
    { icon: Palette, number: '500+', label: 'Artworks Created' },
    { icon: Users, number: '1000+', label: 'Students Taught' },
    { icon: Heart, number: '5000+', label: 'Art Lovers Reached' }
  ];

  const pressFeatures = [
    { publication: 'Art Today Magazine', title: 'Rising Stars in Contemporary Art', year: 2023, quote: 'A unique voice that bridges traditional techniques with modern expression' },
    { publication: 'Creative Quarterly', title: 'Workshop Innovation in Art Education', year: 2022, quote: 'Transforming how art is taught and experienced by new generations' },
    { publication: 'Gallery Times', title: 'Emerging Artists to Watch', year: 2021, quote: 'Exceptional talent with a gift for capturing emotion through color' }
  ];

  return (
    <div className="min-vh-100 about-root" style={{ backgroundColor: '#f1efef', color: '#000' }}>
      <style>{`
        .about-root { overflow-x: clip; }
        @supports not (overflow: clip) { .about-root { overflow-x: hidden; } }
        .about-hero-img { display:block; width:100%; height:600px; object-fit:cover; }
        .rating-card { left: 16px; bottom: 16px; transform: none; }

        /* Add consistent borders for icon containers and star chips */
        .icon-circle {
          width: 64px; height: 64px;
          background: #ffffff; color: #000;
          border: 1px solid #000; /* border for icon circles */
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .icon-circle-lg {
          width: 80px; height: 80px;
          background: #ffffff; color: #000;
          border: 1px solid #000; /* border for large icon circles */
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .icon-chip {
          display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid #000; /* border around each star */
          border-radius: 8px; padding: 2px;
        }
      `}</style>

      {/* Hero */}
      <section className="py-5" style={{ backgroundColor: '#f1efef' }}>
        <div className="container">
          <div className="row g-4 align-items-center">
            {/* Text */}
            <div className="col-12 col-lg-6">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <h1 className="fw-bold display-5 mb-3" style={{ color: '#000' }}>Meet the Artist</h1>
                <div className="lead mb-4" style={{ color: '#000' }}>
                  <p className="mb-3">
                    This is Priyanka Vasista, and art has been a part of my life since childhood. I was first inspired by my father, who painted as a hobby. Watching him work with colors sparked my imagination and ignited my lifelong passion for art.
                  </p>
                  <p className="mb-3">
                    Over the years, that passion has grown into both a creative journey and a career. I have been teaching art for more than 10 years, guiding students of all ages to explore their creativity. Alongside teaching, I actively create and share my own artwork.
                  </p>
                  <p className="mb-0">
                    Art, for me, is not just an expression but also a way to bring joy and meaning to people’s lives whether it’s through a painting that decorates a home, a custom piece that carries special memories, or a creative class that inspires a child.
                  </p>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <span className="badge border shadow-sm px-3 py-2" style={{ background: '#fff', color: '#000' }}>🎨 Traditional Techniques</span>
                  <span className="badge border shadow-sm px-3 py-2" style={{ background: '#fff', color: '#000' }}>✨ Modern Innovation</span>
                  <span className="badge border shadow-sm px-3 py-2" style={{ background: '#fff', color: '#000' }}>💝 Custom Creations</span>
                </div>
              </motion.div>
            </div>

            {/* Image + rating card */}
            <div className="col-12 col-lg-6 position-relative">
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <div className="rounded-4 overflow-hidden shadow-lg position-relative">
                  <img
                    src="https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop"
                    alt="Artist at work"
                    className="about-hero-img"
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.35), transparent)' }} />
                </div>

                {/* Rating card */}
                <div className="position-absolute rating-card">
                  <div className="bg-white p-3 rounded-4 shadow" style={{ color: '#000' }}>
                    <div className="d-flex align-items-center gap-1 mb-1" style={{ color: '#000' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="icon-chip">
                          <Star size={18} color="#000" fill="#000" />
                        </span>
                      ))}
                    </div>
                    <div className="small" style={{ color: '#000' }}>4.9/5 Customer Rating</div>
                    <div className="fw-semibold" style={{ color: '#000' }}>1000+ Happy Customers</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-5" style={{ backgroundColor: '#f1efef' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                          className="rounded-4 p-4 p-lg-5" style={{ backgroundColor: '#ffffff', color: '#000' }}>
                <div className="icon-circle mb-3">
                  <Heart size={28} color="#000" />
                </div>
                <h3 className="fw-bold mb-3" style={{ color: '#000' }}>Our Mission</h3>
                <p className="mb-0" style={{ color: '#000' }}>
                  To create meaningful connections between art and people—bringing joy, inspiration, and beauty into every home through original, handcrafted artworks that tell stories and evoke emotions.
                </p>
              </motion.div>
            </div>

            <div className="col-12 col-md-6">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                          className="rounded-4 p-4 p-lg-5" style={{ backgroundColor: '#ffffff', color: '#000' }}>
                <div className="icon-circle mb-3">
                  <Palette size={28} color="#000" />
                </div>
                <h3 className="fw-bold mb-3" style={{ color: '#000' }}>Our Vision</h3>
                <p className="mb-0" style={{ color: '#000' }}>
                  To become a global platform where art enthusiasts discover unique, authentic pieces while supporting independent artists and fostering a vibrant creative community.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-5" style={{ backgroundColor: '#f1efef' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                      className="text-center mb-4 mb-lg-5">
            <h2 className="fw-bold mb-2" style={{ color: '#000' }}>Achievements &amp; Impact</h2>
            <p className="mb-0" style={{ color: '#000' }}>Numbers that reflect the journey</p>
          </motion.div>

          <div className="row row-cols-2 row-cols-md-4 g-4">
            {achievements.map((a, i) => (
              <motion.div key={a.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: i * 0.1 }} className="col text-center">
                <div className="icon-circle-lg mx-auto mb-3">
                  <a.icon size={40} color="#000" />
                </div>
                <div className="fw-bold" style={{ fontSize: 28, color: '#000' }}>{a.number}</div>
                <div className="fw-medium" style={{ color: '#000' }}>{a.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Press */}
      <section className="py-5" style={{ backgroundColor: '#f1efef' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                      className="text-center mb-4 mb-lg-5">
            <h2 className="fw-bold mb-2" style={{ color: '#000' }}>Press &amp; Recognition</h2>
            <p className="mb-0" style={{ color: '#000' }}>Featured in leading art publications</p>
          </motion.div>

          <div className="row g-4">
            {pressFeatures.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: i * 0.1 }} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border-0 rounded-4 shadow-sm p-4" style={{ backgroundColor: '#ffffff', color: '#000' }}>
                  <div className="fw-bold mb-1" style={{ color: '#000' }}>{f.publication}</div>
                  <h3 className="h5 fw-semibold mb-1" style={{ color: '#000' }}>{f.title}</h3>
                  <div className="small mb-3" style={{ color: '#000' }}>{f.year}</div>
                  <blockquote className="mb-0 fst-italic" style={{ color: '#000' }}>“{f.quote}”</blockquote>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA (black background with auto-invert buttons) */}
      <section className="py-5 on-dark" style={{ backgroundColor: '#000' }}>
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="fw-bold mb-2" style={{ color: '#fff' }}>Ready to Start Your Art Collection?</h2>
            <p className="mb-4" style={{ color: '#fff' }}>Explore the gallery or commission a custom piece that speaks to your heart</p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <FancyButton to="/gallery" className="fancy-sm">
                Browse Gallery
              </FancyButton>
              <FancyButton to="/custom-order" className="fancy-sm">
                Commission Custom Art
              </FancyButton>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
