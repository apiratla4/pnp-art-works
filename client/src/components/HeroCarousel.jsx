import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import FancyButton from './FancyButton';

const API = (import.meta.env.VITE_API_URL ?? "") + "/api/hero-sliders";

const imageVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.55, ease: 'easeOut' } },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0, transition: { duration: 0.45, ease: 'easeIn' } })
};
const contentVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
};

const HeroCarousel = ({
  autoPlay = true,
  interval = 3600,
  showArrows = true,
  showIndicators = true,
  onSlideChange
}) => {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const timeoutRef = useRef(null);
  const pausedRef = useRef(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // --- Fetch slides from backend
  useEffect(() => {
    axios.get(API)
      .then(res => setSlides(Array.isArray(res.data) ? res.data : res.data.items || []))
      .catch(() => setSlides([]));
  }, []);

  const total = slides.length;

  const goTo = i => {
    if (!total) return;
    const nextIdx = (i + total) % total;
    const dir = nextIdx === index ? 0 : (nextIdx > index ? 1 : -1);
    setDirection(dir || 1);
    setIndex(nextIdx);
    if (typeof onSlideChange === 'function') onSlideChange(nextIdx);
  };
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  const clearTimer = () => { if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; } };
  const startTimer = () => {
    if (!autoPlay || total <= 1 || pausedRef.current) return;
    clearTimer();
    timeoutRef.current = setTimeout(next, Math.max(1500, interval));
  };
  useEffect(() => { startTimer(); return clearTimer; }, [index, autoPlay, interval, total]);
  const onMouseEnter = () => { pausedRef.current = true; clearTimer(); };
  const onMouseLeave = () => { pausedRef.current = false; startTimer(); };
  const onTouchStart = e => { if (e.changedTouches?.length) touchStartX.current = e.changedTouches[0].clientX; };
  const onTouchMove = e => { if (e.changedTouches?.length) touchEndX.current = e.changedTouches[0].clientX; };
  const onTouchEnd = () => {
    const dx = touchEndX.current - touchStartX.current;
    if (Math.abs(dx) > 40) (dx > 0 ? prev() : next());
    touchStartX.current = 0; touchEndX.current = 0;
  };

  const currentSlide = useMemo(() => slides[index] || {}, [slides, index]);

  return (
    <div
      className="w-full flex flex-col overflow-hidden"
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
      {/* Image Section */}
      <div className="relative w-full" style={{ height: '65%' }}>
        <AnimatePresence custom={direction} initial={false} mode="popLayout">
          {currentSlide.image && (
            <motion.img
              key={currentSlide._id || currentSlide.image}
              src={currentSlide.image}
              alt={currentSlide.alt || ''}
              variants={imageVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
              style={{ userSelect: "none", height: '100%' }}
            />
          )}
        </AnimatePresence>
        {/* Arrows */}
        {showArrows && total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={prev}
              className="absolute z-10 flex items-center justify-center"
              style={{
                top: '50%', left: 16, transform: 'translateY(-50%)',
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(255,255,255,.9)', boxShadow: '0 2px 10px rgba(0,0,0,.15)'
              }}
              tabIndex={0}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={next}
              className="absolute z-10 flex items-center justify-center"
              style={{
                top: '50%', right: 16, transform: 'translateY(-50%)',
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(255,255,255,.9)', boxShadow: '0 2px 10px rgba(0,0,0,.15)'
              }}
              tabIndex={0}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>
      {/* Text Content Section */}
      <div
        className="relative flex items-center justify-center px-3 sm:px-6"
        style={{ height: '35%' }}
      >
        <div className="w-full" style={{ maxWidth: 980 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`content-${currentSlide._id || index}`}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center"
            >
              {currentSlide.eyebrow && (
                <div
                  className="font-semibold mb-2 text-black"
                  style={{ letterSpacing: 1, fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)' }}
                >
                  {currentSlide.eyebrow}
                </div>
              )}
              <h2
                className="font-bold mb-2 text-black"
                style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', lineHeight: 1.2 }}
              >
                {currentSlide.heading}
              </h2>
              {currentSlide.sub && (
                <p
                  className="mb-3"
                  style={{
                    color: 'rgba(0, 0, 0, 0.85)',
                    fontSize: 'clamp(0.85rem, 1.5vw, 1rem)'
                  }}
                >
                  {currentSlide.sub}
                </p>
              )}
              {currentSlide.ctaLabel && currentSlide.ctaHref && (
                <FancyButton
                  to={currentSlide.ctaHref}
                  className="fancy-sm"
                  aria-label={currentSlide.ctaLabel}
                >
                  {currentSlide.ctaLabel} <ArrowRight className="inline" size={17} />
                </FancyButton>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Indicators */}
        {showIndicators && total > 1 && (
          <div
            className="absolute left-1/2 flex flex-row gap-2 z-30"
            style={{ bottom: 16, transform: "translateX(-50%)" }}
          >
            {slides.map((s, i) => {
              const active = i === index;
              return (
                <button
                  key={s._id || i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className="transition-all duration-200"
                  style={{
                    borderRadius: 999,
                    width: active ? 22 : 10,
                    height: 10,
                    background: active ? 'rgba(0, 0, 0, 0.95)' : 'rgba(36, 36, 36, 0.6)',
                    outline: 'none',
                    border: 'none'
                  }}
                  tabIndex={0}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroCarousel;
