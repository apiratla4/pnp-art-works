import React from 'react';
import { motion } from 'framer-motion';
import { Award, Palette, Users, Star, Heart } from 'lucide-react';
import FancyButton from '../components/FancyButton';

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

const AboutPage = () => (
  <div className="min-h-screen bg-[#f1efef] text-black overflow-x-clip">

    {/* Hero */}
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-extrabold text-3xl sm:text-5xl mb-5">Meet the Artist</h1>
            <div className="text-lg mb-6">
              <p className="mb-3">
                This is Priyanka Vasista, and art has been a part of my life since childhood. I was first inspired by my father, who painted as a hobby. Watching him work with colors sparked my imagination and ignited my lifelong passion for art.
              </p>
              <p className="mb-3">
                Over the years, that passion has grown into both a creative journey and a career. I have been teaching art for more than 10 years, guiding students of all ages to explore their creativity. Alongside teaching, I actively create and share my own artwork.
              </p>
              <p>
                Art, for me, is not just an expression but also a way to bring joy and meaning to people’s lives whether it’s through a painting that decorates a home, a custom piece that carries special memories, or a creative class that inspires a child.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-2 rounded-full border bg-white text-black shadow-sm font-medium">🎨 Traditional Techniques</span>
              <span className="px-3 py-2 rounded-full border bg-white text-black shadow-sm font-medium">✨ Modern Innovation</span>
              <span className="px-3 py-2 rounded-full border bg-white text-black shadow-sm font-medium">💝 Custom Creations</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex flex-col relative">
            <div className="rounded-3xl overflow-hidden shadow-xl relative">
              <img
                src="https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop"
                alt="Artist at work"
                className="block w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              {/* Rating card, always at bottom left */}
              <div className="absolute left-4 bottom-4">
                <div className="bg-white p-4 rounded-xl shadow-lg text-black min-w-[170px]">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="inline-flex items-center justify-center border border-black rounded-md p-1">
                        <Star size={18} color="#000" fill="#000" />
                      </span>
                    ))}
                  </div>
                  <div className="text-sm">4.9/5 Customer Rating</div>
                  <div className="font-semibold">1000+ Happy Customers</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl p-7 flex flex-col items-start">
            <div className="flex items-center justify-center mb-4 w-16 h-16 rounded-full border bg-white">
              <Heart size={28} color="#000" />
            </div>
            <h3 className="font-bold text-xl mb-3">Our Mission</h3>
            <p>
              To create meaningful connections between art and people—bringing joy, inspiration, and beauty into every home through original, handcrafted artworks that tell stories and evoke emotions.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-3xl p-7 flex flex-col items-start">
            <div className="flex items-center justify-center mb-4 w-16 h-16 rounded-full border bg-white">
              <Palette size={28} color="#000" />
            </div>
            <h3 className="font-bold text-xl mb-3">Our Vision</h3>
            <p>
              To become a global platform where art enthusiasts discover unique, authentic pieces while supporting independent artists and fostering a vibrant creative community.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Achievements */}
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-center mb-8">
          <h2 className="font-bold text-2xl mb-2">Achievements & Impact</h2>
          <p>Numbers that reflect the journey</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-7">
          {achievements.map((a, i) => (
            <motion.div key={a.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }} className="text-center">
              <div className="flex items-center justify-center mx-auto mb-3 w-20 h-20 rounded-full border bg-white">
                <a.icon size={40} color="#000" />
              </div>
              <div className="font-bold text-2xl">{a.number}</div>
              <div className="font-medium">{a.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Press Features */}
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-center mb-8">
          <h2 className="font-bold text-2xl mb-2">Press & Recognition</h2>
          <p>Featured in leading art publications</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pressFeatures.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}>
              <div className="bg-white rounded-3xl shadow p-7 flex flex-col h-full">
                <div className="font-bold mb-1">{f.publication}</div>
                <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
                <div className="text-sm mb-3">{f.year}</div>
                <blockquote className="italic">“{f.quote}”</blockquote>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA with buttons auto-inverted on dark bg */}
    <section className="py-10 bg-black on-dark">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h2 className="font-bold text-2xl mb-2 text-white">Ready to Start Your Art Collection?</h2>
          <p className="mb-4 text-white/80">Explore the gallery or commission a custom piece that speaks to your heart</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <FancyButton to="/gallery" className="fancy-sm">Browse Gallery</FancyButton>
            <FancyButton to="/custom-order" className="fancy-sm">Commission Custom Art</FancyButton>
          </div>
        </motion.div>
      </div>
    </section>
  </div>
);

export default AboutPage;
