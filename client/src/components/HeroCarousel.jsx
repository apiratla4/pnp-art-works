// src/components/HeroCarousel.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import FancyButton from './FancyButton';

// Local hero images
import img1 from '../assets/hero1.jpg';
import img2 from '../assets/hero4.png';
import img3 from '../assets/hero3.jpg';
import img4 from '../assets/ma_durga.png'

// Slides
const PAINTING_SLIDES = [
  { id: 'p1', image: img1, alt: 'Abstract canvas with rich colors' },
  { id: 'p2', image: img4, alt: 'Oil painting materials and palette' },
  { id: 'p3', image: img3, alt: 'Paintings displayed in an interior' },
  { id: 'p4', image: img2, alt: 'Students painting in a live art class' },
];

// Per-slide overlay content
const SLIDE_CONTENT = {
  p1: {
    eyebrow: 'Original Art',
    heading: 'Handcrafted Paintings for Inspired Spaces',
    sub: 'Discover acrylics, watercolors, and mixed media from curated collections.',
    cta: { label: 'Shop new arrivals', href: '/shop' }
  },
  p2: {
    eyebrow: 'Limited Offer',
    heading: 'Free Shipping Over $100',
    sub: 'Enjoy fast, secure delivery on eligible orders no code required.',
    cta: { label: 'Explore collections', href: '/shop' }
  },
  p3: {
    eyebrow: 'Custom Commissions',
    heading: 'Bring Ideas to Life with Custom Art',
    sub: 'Work 1:1 with an artist to craft a bespoke piece for your style and budget.',
    cta: { label: 'Start a commission', href: '/custom-order' }
  },
  p4: 
  {
    eyebrow: 'Learn & Create',
    heading: 'Live Online and Studio Art Classes',
    sub: 'Build skills in drawing, watercolor, and acrylics with guided sessions.',
    cta: { label: 'Explore art classes', href: '/art-classes' }
  }
};

// Image slide variants (directional)
const imageVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.55, ease: 'easeOut' } },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0, transition: { duration: 0.45, ease: 'easeIn' } })
};

// Text content variants
const contentVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
};

export default function HeroCarousel({
  slides = PAINTING_SLIDES,
  autoPlay = true,
  interval = 3000,
  showArrows = true,
  showIndicators = true,
  onSlideChange
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const timeoutRef = useRef(null);
  const pausedRef = useRef(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const total = slides.length;

  const goTo = (i) => {
    const nextIdx = (i + total) % total;
    const dir = nextIdx === index ? 0 : (nextIdx > index ? 1 : -1);
    setDirection(dir || 1);
    setIndex(nextIdx);
    if (typeof onSlideChange === 'function') onSlideChange(nextIdx);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Autoplay via resettable timeout
  const clearTimer = () => { if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; } };
  const startTimer = () => {
    if (!autoPlay || total <= 1 || pausedRef.current) return;
    clearTimer();
    timeoutRef.current = setTimeout(next, Math.max(1500, interval));
  };
  useEffect(() => { startTimer(); return clearTimer; }, [index, autoPlay, interval, total]);

  // Hover pause
  const onMouseEnter = () => { pausedRef.current = true; clearTimer(); };
  const onMouseLeave = () => { pausedRef.current = false; startTimer(); };

  // Touch swipe
  const onTouchStart = (e) => { if (e.changedTouches?.length) touchStartX.current = e.changedTouches[0].clientX; };
  const onTouchMove = (e) => { if (e.changedTouches?.length) touchEndX.current = e.changedTouches[0].clientX; };
  const onTouchEnd = () => {
    const dx = touchEndX.current - touchStartX.current;
    if (Math.abs(dx) > 40) (dx > 0 ? prev() : next());
    touchStartX.current = 0; touchEndX.current = 0;
  };

  const currentSlide = useMemo(() => slides[index], [slides, index]);
  const content = SLIDE_CONTENT[currentSlide?.id] || SLIDE_CONTENT.p1;

  return (
    <div
      className="w-100 overflow-hidden d-flex flex-column"
      style={{ height: '88vh' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Homepage hero"
    >
      {/* Image Section - 70% height */}
      <div className="position-relative overflow-hidden" style={{ height: '65%' }}>
        <AnimatePresence custom={direction} initial={false} mode="popLayout">
          <motion.img
            key={currentSlide.id}
            src={currentSlide.image}
            alt={currentSlide.alt || ''}
            variants={imageVariants}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
          />
        </AnimatePresence>

        {/* Arrows - positioned on image */}
        {showArrows && total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={prev}
              className="btn position-absolute z-3 p-0 d-flex align-items-center justify-content-center hero-ctrl"
              style={{
                top: '50%', left: 16, transform: 'translateY(-50%)',
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(255,255,255,.9)',
                boxShadow: '0 2px 10px rgba(0,0,0,.15)'
              }}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={next}
              className="btn position-absolute z-3 p-0 d-flex align-items-center justify-content-center hero-ctrl"
              style={{
                top: '50%', right: 16, transform: 'translateY(-50%)',
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(255,255,255,.9)',
                boxShadow: '0 2px 10px rgba(0,0,0,.15)'
              }}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Text Content Section - 30% height */}
      <div 
        className="position-relative d-flex align-items-center justify-content-center px-3 px-md-4"
        style={{ 
            height: '35%', 
        }}
      >
        <div className="w-100" style={{ maxWidth: 980 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`content-${currentSlide.id}`}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center"
            >
              {content.eyebrow && (
                <div 
                  className="fw-semibold mb-2 text-black" 
                  style={{ letterSpacing: 1, fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)' }}
                >
                  {content.eyebrow}
                </div>
              )}

              <h2
                className="fw-bold mb-2 text-black"
                style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', lineHeight: 1.2 }}
              >
                {content.heading}
              </h2>

              {content.sub && (
                <p 
                  className="mb-3" 
                  style={{ 
                    color: 'rgba(0, 0, 0, 0.85)', 
                    fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' 
                  }}
                >
                  {content.sub}
                </p>
              )}

              {content.cta && (
                <FancyButton 
                  to={content.cta.href} 
                  className="fancy-sm" 
                  aria-label={content.cta.label}
                >
                  {content.cta.label} <ArrowRight size={18} />
                </FancyButton>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicators - positioned in text section */}
        {showIndicators && total > 1 && (
          <div 
            className="position-absolute start-50 translate-middle-x d-flex gap-2 z-3" 
            style={{ bottom: 16 }}
          >
            {slides.map((s, i) => {
              const active = i === index;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className="p-0 border-0 hero-ind"
                  style={{
                    width: active ? 22 : 10,
                    height: 10,
                    borderRadius: 999,
                    background: active ? 'rgba(0, 0, 0, 0.95)' : 'rgba(36, 36, 36, 0.6)',
                    transition: 'all .25s ease'
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Focus styles */}
      <style>{`
        .hero-ctrl:focus-visible,
        .hero-ind:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
