// src/components/WhatsAppButton.jsx
import React from "react";

export default function WhatsAppButton({
  phone = import.meta.env.VITE_WHATSAPP_NUMBER || "15551234567",
  text = "Hi! I’d like to know more about your art and classes.",
  show = true,
}) {
  if (!show) return null;

  // Strip non-digits to ensure proper wa.me format (no +, spaces, dashes)
  const digits = String(phone).replace(/\D/g, "");
  const href = `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="wa-fab"
      >
        {/* Bootstrap WhatsApp Icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          fill="currentColor"
          className="bi bi-whatsapp"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
        </svg>
      </a>

      <style>{`
        .wa-fab {
          position: fixed;
          left: 16px;
          bottom: 22px;
          z-index: 1060;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 2px solid white;
          background: #0eb02bff;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: background-color 160ms ease, color 160ms ease, transform 120ms ease, box-shadow 120ms ease;
        }
        .wa-fab:hover { background: #fff; color: #000; }
        .wa-fab:active { transform: scale(0.96); }
        .wa-fab:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        .wa-fab:focus { outline: 2px solid #000; outline-offset: 2px; }

        @media (max-width: 480px) {
          .wa-fab { left: 12px; bottom: 12px; width: 52px; height: 52px; }
        }
      `}</style>
    </>
  );
}
