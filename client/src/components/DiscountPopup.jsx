import React, { useEffect, useRef, useState } from "react";
import discountimg from "../assets/ma_durga.png";

const DiscountPopup = ({ delayMs = 5000 }) => {
  // Force always show in all environments (for dev/test)
  const [open, setOpen] = useState(false);
  const emailRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Always show for every user/page refresh (disable localStorage logic)
    timeoutRef.current = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(timeoutRef.current);
  }, [delayMs]);

  useEffect(() => {
    if (open) emailRef.current?.focus();
  }, [open]);

  const closeForNow = () => setOpen(false);

  const onSubmit = (e) => {
    e.preventDefault();
    // Optionally, add newsletter subscription logic here
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-10000 flex items-end sm:items-center justify-center"
      onClick={closeForNow}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discountTitle"
        aria-describedby="discountDesc"
        className="relative w-full max-w-xl sm:max-w-2xl bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl grid grid-cols-1 sm:grid-cols-2 overflow-hidden mx-4 mb-8 sm:mx-0 sm:mb-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Left image (desktop) */}
        <div
          className="hidden sm:block min-h-[280px] bg-cover bg-center"
          style={{
            backgroundImage: `url(${discountimg})`
          }}
        />
        {/* Top image (mobile) */}
        <div
          className="sm:hidden h-32 w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/3739656/pexels-photo-3739656.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop)"
          }}
        />

        {/* Popup content */}
        <div className="relative flex flex-col items-center justify-center px-6 sm:px-8 py-7 sm:py-10 w-full">
          <button
            type="button"
            aria-label="Close"
            onClick={closeForNow}
            className="absolute top-3 right-3 w-8 h-8 rounded-full border border-black bg-white text-black hover:bg-black hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="text-xl">&times;</span>
          </button>

          <div className="text-center w-full">
            <div className="font-mono text-sm uppercase tracking-widest mb-2 font-bold">PNP ART STUDIO</div>
            <h2 id="discountTitle" className="font-serif font-extrabold text-2xl sm:text-3xl mb-3 text-black">
              Get 35% OFF your order
            </h2>
            <p id="discountDesc" className="text-black/80 mb-5">
              Sign up and unlock an instant discount.
            </p>
          </div>

          <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
            <input
              ref={emailRef}
              type="email"
              required
              placeholder="Email address"
              aria-label="Email address"
              className="w-full px-4 py-3 rounded-lg border border-black bg-white text-black placeholder:text-black/50 outline-none focus:border-black/80 focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg border border-black bg-black text-white font-bold hover:bg-white hover:text-black transition-colors"
            >
              Claim discount
            </button>
            <button
              type="button"
              onClick={closeForNow}
              className="w-full text-sm font-semibold text-blue-600 underline bg-transparent border-none py-1"
            >
              No, thanks
            </button>
            <small className="text-xs text-black/50 text-center mt-1">
              You are signing up to receive communication via email and can unsubscribe at any time.
            </small>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DiscountPopup;
