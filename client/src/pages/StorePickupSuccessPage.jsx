import React from "react";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

// Simple confetti SVG animation
const Confetti = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none animate-fadeIn" viewBox="0 0 180 80" fill="none">
    <g>
      {[...Array(10)].map((_, i) => (
        <circle
          key={i}
          cx={Math.random() * 180}
          cy={Math.random() * 70 + 5}
          r={Math.random() * 3 + 2}
          fill={["#38bdf8", "#a21caf", "#eab308", "#22c55e", "#f472b6"][i % 5]}
          opacity="0.75"
        >
          <animate
            attributeName="cy"
            from={Math.random() * 80}
            to="80"
            dur="1.25s"
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  </svg>
);

const StorePickupSuccessPage = () => (
  <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-violet-100 overflow-hidden">
    <Confetti />
    <div className="z-10 max-w-md w-full mx-4 bg-white rounded-2xl shadow-2xl px-6 py-10 flex flex-col items-center">
      <CheckCircle className="text-green-500 mb-4 animate-popIn" size={64} />
      <h1 className="text-2xl md:text-3xl font-bold text-center text-black mb-2 animate-fadeIn">
        Store Pickup Order Successful!
      </h1>
      <p className="text-lg text-gray-700 text-center mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        Thank you for your order. <br />
        Our team will reach out to you soon to confirm your pickup details.
      </p>
      <Link
        to="/"
        className="inline-block rounded-lg bg-black text-white font-semibold px-6 py-3 hover:bg-gray-900 shadow transition animate-fadeIn"
        style={{ animationDelay: '0.2s' }}
      >
        Back to Home
      </Link>
    </div>
    {/* Animations */}
    <style>{`
      @keyframes popIn { 
        0% { transform: scale(0.7); opacity: 0 }
        85% { transform: scale(1.08); opacity: 1 }
        100% { transform: scale(1); opacity: 1 }
      }
      @keyframes fadeIn { to { opacity: 1; transform: none; } }
      .animate-popIn { animation: popIn 0.75s cubic-bezier(.32,1.2,.47,1) both; }
      .animate-fadeIn { opacity: 0; transform: translateY(12px); animation: fadeIn .8s cubic-bezier(.25,0,.3,1) .2s both; }
    `}</style>
  </div>
);

export default StorePickupSuccessPage;
