import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star, X } from "lucide-react";
import { ThreeDScrollTriggerContainer, ThreeDScrollTriggerRow } from "./ThreeDScrollTrigger";

const API = (import.meta.env.VITE_API_URL ?? "") + "/api/testimonials";
const REVIEW_LIMIT = 160;

const Stars = ({ rating = 5 }) => (
  <span className="inline-flex gap-0.5" aria-label={`${rating} stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={15} color="#000" fill={i < rating ? "#000" : "none"} className={i < rating ? "" : "opacity-20"} />
    ))}
  </span>
);

function TestimonialCard({ testimonial, onShowMore }) {
  const review = testimonial.review || "";
  const isLong = review.length > REVIEW_LIMIT;

  return (
    <div
      className="inline-flex flex-col gap-2 bg-white rounded-2xl shadow-sm border border-black/10 p-5 mx-3 w-[300px] align-top whitespace-normal"
      style={{ verticalAlign: "top" }}
    >
      <div className="flex items-center gap-3">
        <img
          src={testimonial.avatar || "https://placehold.co/48x48?text=?"}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover border border-black/15 shrink-0"
          onError={e => { e.currentTarget.src = "https://placehold.co/48x48?text=?"; }}
        />
        <div className="min-w-0">
          <div className="font-bold text-sm text-black truncate">{testimonial.name}</div>
          {testimonial.city && <div className="text-xs text-black/50 truncate">{testimonial.city}</div>}
        </div>
      </div>
      <Stars rating={Number(testimonial.rating) || 5} />
      <p className="text-sm text-black/75 leading-relaxed">
        &ldquo;{isLong ? review.slice(0, REVIEW_LIMIT) + "…" : review}&rdquo;
        {isLong && (
          <button
            className="ml-1 text-black underline underline-offset-2 text-xs font-semibold hover:opacity-60 transition-opacity"
            onClick={() => onShowMore(testimonial)}
            type="button"
          >
            Show more
          </button>
        )}
      </p>
    </div>
  );
}

function ReviewModal({ testimonial, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-black/10 p-8 max-w-lg w-full z-10"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-4 mb-4">
          <img
            src={testimonial.avatar || "https://placehold.co/56x56?text=?"}
            alt={testimonial.name}
            className="w-14 h-14 rounded-full object-cover border border-black/15"
            onError={e => { e.currentTarget.src = "https://placehold.co/56x56?text=?"; }}
          />
          <div>
            <div className="font-bold text-black text-base">{testimonial.name}</div>
            {testimonial.city && <div className="text-sm text-black/50">{testimonial.city}</div>}
          </div>
        </div>
        <Stars rating={Number(testimonial.rating) || 5} />
        <p className="mt-3 text-black/80 leading-relaxed text-sm">
          &ldquo;{testimonial.review}&rdquo;
        </p>
      </div>
    </div>
  );
}

function TestimonialsRow({ testimonials, direction }) {
  const [paused, setPaused] = useState(false);
  const [modal, setModal] = useState(null);

  const items = testimonials.length > 0
    ? [...testimonials, ...testimonials, ...testimonials]
    : [];

  return (
    <>
      <ThreeDScrollTriggerRow
        direction={direction}
        baseVelocity={3}
        paused={paused}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="py-2"
      >
        {items.map((t, i) => (
          <TestimonialCard key={`${t.id || t._id || i}-${direction}`} testimonial={t} onShowMore={setModal} />
        ))}
      </ThreeDScrollTriggerRow>
      {modal && <ReviewModal testimonial={modal} onClose={() => setModal(null)} />}
    </>
  );
}

const TestimonialsCarousel = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    axios.get(API).then(res => {
      let items =
        Array.isArray(res.data) ? res.data :
        res.data.items || res.data.testimonials || [];
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

  const row1 = testimonials;
  const row2 = [...testimonials].reverse();

  return (
    <section className="w-full py-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <h2 className="font-bold text-3xl text-black mb-2">What Our Customers Say</h2>
        <p className="text-black/60">Trusted by art lovers worldwide</p>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center text-black/40 py-10 text-lg">No testimonials yet.</div>
      ) : (
        <ThreeDScrollTriggerContainer className="flex flex-col gap-4">
          <TestimonialsRow testimonials={row1} direction={1} />
          <TestimonialsRow testimonials={row2} direction={-1} />
        </ThreeDScrollTriggerContainer>
      )}
    </section>
  );
};

export default TestimonialsCarousel;
