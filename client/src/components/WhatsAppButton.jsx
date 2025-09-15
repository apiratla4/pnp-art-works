// src/components/WhatsAppButton.jsx
import React from "react";
import { MessageCircle } from "lucide-react"; // neutral chat icon from lucide-react [no brand marks]


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
        <MessageCircle size={26} aria-hidden="true" />
      </a>

      <style>{`
        .wa-fab {
          position: fixed;
          left: 16px;
          bottom: 16px;
          z-index: 1060;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #000;
          color: #fff;
          border: 2px solid #000;
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
