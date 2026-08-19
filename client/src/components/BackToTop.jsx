// src/components/BackToTop.jsx
import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const BackToTop = ({
  threshold = 280,     // show after this many px scrolled
  right = 16,          // px from right
  bottom = 24,         // px from bottom
  zIndex = 1050,       // higher than header/footer overlays
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      setVisible(y > threshold);
    };
    onScroll(); // initialize
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Back to top"
        onClick={scrollToTop}
        className={`back-to-top ${visible ? "show" : ""}`}
        style={{ right, bottom, zIndex }}
        tabIndex={visible ? 0 : -1}
      >
        <ChevronUp size={22} />
      </button>

      {/* Local styles: monochrome + accessible focus ring */}
      <style>{`
        .back-to-top {
          position: fixed;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #000;
          color: #fff;
          border: 2px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 0 0 2px #fff,   /* white stroke for visibility on dark content */
            0 2px 10px rgba(0,0,0,.15);
          transition: opacity 180ms ease, transform 180ms ease, background-color 160ms ease, color 160ms ease;
          opacity: 0;
          pointer-events: none;
        }
        .back-to-top.show {
          opacity: 1;
          pointer-events: auto;
        }
        .back-to-top:hover {
          background: #fff;
          color: #000;
        }
        /* Keyboard focus visibility (WCAG 2.4.7) */
        .back-to-top:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 2px #000,   /* inner ring contrasts on light */
            0 0 0 5px #fff,   /* outer ring contrasts on dark */
            0 2px 10px rgba(0,0,0,.2);
        }
        /* Fallback focus for older UAs */
        .back-to-top:focus {
          outline: 2px solid #000;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};

export default BackToTop;
