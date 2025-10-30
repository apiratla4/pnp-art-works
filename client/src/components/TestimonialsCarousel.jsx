import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";

const API = (import.meta.env.VITE_API_URL ?? "") + "/api/testimonials";

const Stars = ({ rating = 5 }) => (
  <span className="inline-flex" aria-label={`${rating} stars`}>
    {Array.from({ length: 5 }).map((_, i) =>
      <Star
        key={i}
        size={19}
        color="#000"
        fill={i < rating ? "#000" : "none"}
        className={i < rating ? "" : "opacity-25"}
      />
    )}
  </span>
);

const useFetchedTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  useEffect(() => {
    axios.get(API).then(res => {
      let items =
        Array.isArray(res.data)
          ? res.data
          : res.data.items || res.data.testimonials || [];
      if (!Array.isArray(items) && typeof items === "object") items = Object.values(items);
      items = Array.isArray(items)
        ? items.filter(t => (t.text || t.review) && t.name)
        : [];
      setTestimonials(items.map(t => ({
        ...t,
        review: t.review || t.text,
        avatar: t.avatar || t.imageUrl,
        id: t.id || t._id,
      })));
    }).catch(() => setTestimonials([]));
  }, []);
  // Only duplicate if 2 or more testimonials
  return testimonials.length > 1
    ? [...testimonials, ...testimonials]
    : testimonials;
};

const TestimonialsMarquee = () => {
  const testimonials = useFetchedTestimonials();
  const trackRef = useRef();
  const [paused, setPaused] = useState(false);

  // Animation: move left infinitly
  useEffect(() => {
    if (!trackRef.current || testimonials.length === 0) return;
    let rafId, startTime, scrollWidth = trackRef.current.scrollWidth / 2;

    function animate(ts) {
      if (!startTime) startTime = ts;
      if (!trackRef.current) return;
      if (paused) { rafId = requestAnimationFrame(animate); return; }
      let progress = (performance.now() - startTime) * 0.04; // speed
      let current = progress % scrollWidth;
      trackRef.current.scrollLeft = current;
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);
    return () => rafId && cancelAnimationFrame(rafId);
  }, [paused, testimonials]);

  return (
    <section className="w-full py-14 px-1">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-bold mb-2 text-black text-3xl">What Our Customers Say</h2>
          <p className="text-black">Trusted by art lovers worldwide</p>
        </div>
        <div
          ref={trackRef}
          className="no-scrollbar whitespace-nowrap overflow-x-auto flex gap-8 items-stretch py-2"
          style={{ cursor: paused ? "pointer" : "grab" }}
          tabIndex={0}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {testimonials.length === 0 ? (
            <div className="text-gray-400 mx-auto text-lg p-7">No testimonials found.</div>
          ) : (
            testimonials.map((t, i) => (
              <div
                key={t.id || i}
                className="testimonial-box min-w-[320px] max-w-xs w-[88vw] bg-white rounded-2xl shadow flex flex-col gap-3 p-6 items-center border border-black mx-2 shrink-0"
                style={{ flex: "0 0 320px" }}
              >
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-16 h-16 rounded-full shadow object-cover border border-black mb-2"
                  onError={e => { e.currentTarget.src = "https://placehold.co/64x64?text=?" }}
                />
                <Stars rating={Number(t.rating) || 5} />
                <blockquote className="italic text-black text-base mb-2 text-center line-clamp-5 max-w-full wrap-break-word">
                  “{t.review}”
                </blockquote>
                <div className="text-base font-bold text-black">{t.name}</div>
                {t.city &&
                  <div className="text-xs text-black/60">{t.city}</div>
                }
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .testimonial-box { box-sizing: border-box; overflow: hidden; }
        .line-clamp-5 {
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsMarquee;
