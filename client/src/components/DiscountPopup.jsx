import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import discountimg from "../assets/ma_durga.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const DiscountPopup = ({ delayMs = 5000 }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // "success"|"already"|"error"|backend error string
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(timeoutRef.current);
  }, [delayMs]);

  useEffect(() => {
    if (open) emailRef.current?.focus();
  }, [open]);

  const closeForNow = () => {
    setOpen(false);
    setEmail("");
    setStatus("");
    setCode("");
    setLoading(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    setCode("");
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/newsletters/claim-coupon`,
        { email },
        { withCredentials: true }
      );
      setStatus("success");
      setCode(data?.code);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setStatus("already");
      } else if (err.response?.data?.message) {
        setStatus(err.response.data.message);
      } else {
        setStatus("error");
      }
    }
    setLoading(false);
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

          {status === "success" ? (
            <div className="text-green-700 text-lg font-bold my-5">
              Coupon code: <span className="font-mono bg-gray-200 py-1 px-2 rounded">{code}</span>
              <br />
              <span className="block text-xs text-black/80 mt-2">Your coupon was also emailed to you!</span>
            </div>
          ) : status === "already" ? (
            <div className="text-yellow-600 my-5 font-semibold">
              You have already claimed a new customer coupon. Check your mailbox!
            </div>
          ) : status === "error" ? (
            <div className="text-red-600 my-5 font-semibold">
              Something went wrong. Please try again.
            </div>
          ) : typeof status === "string" && status ? (
            <div className="text-red-600 my-5 font-semibold">{status}</div>
          ) : (
            <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
              <input
                ref={emailRef}
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                aria-label="Email address"
                className="w-full px-4 py-3 rounded-lg border border-black bg-white text-black placeholder:text-black/50 outline-none focus:border-black/80 focus:ring-2 focus:ring-black"
                disabled={loading}
              />
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg border border-black bg-black text-white font-bold hover:bg-white hover:text-black transition-colors"
                disabled={loading}
              >
                {loading ? "Processing..." : "Claim discount"}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscountPopup;
