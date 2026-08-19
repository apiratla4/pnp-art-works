import React from 'react';
import { useLocation, Link } from 'react-router-dom';

// Modern query param hook (if using React Router v6+)
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function OrderSuccess() {
  const q = useQuery();
  const orderId = q.get('orderId') || '';

  return (
    <div className="modern-success-wrap">
      <div className="modern-success-card">
        {/* Animated checkmark */}
        <div className="success-animation">
          <svg viewBox="0 0 60 60" className="success-check">
            <circle cx="30" cy="30" r="29" fill="#fff" stroke="#222" strokeWidth="2" />
            <polyline points="18,31 27,40 43,21" className="check" fill="none" stroke="#222" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="modern-success-h1">Order placed successfully!</h1>
        <p className="modern-success-info">
          Thank you for your order.<br />
          <span className="order-id-label">
            Order ID: <b>{orderId}</b>
          </span>
        </p>
        <div className="d-grid gap-3 mt-2 mb-2">
          <Link to="/shop" className="modern-success-btn">Continue shopping</Link>
          <Link
            to={`/track-order${orderId ? '?orderId=' + encodeURIComponent(orderId) : ''}`}
            className="modern-success-track-btn"
          >
            Track this Order
          </Link>
        </div>
      </div>
      {/* Modern, responsive styles */}
      <style>{`
        .modern-success-wrap {
          min-height: 65vh; display: flex; align-items: center; justify-content: center; background: #f7f7f7;
        }
        .modern-success-card {
          background: #fff;
          border-radius: 32px;
          box-shadow: 0 4px 32px -7px #aaa4, 0 2.5px 14px -7px #bbb6;
          text-align: center;
          padding: 48px 36px 44px 36px;
          margin: 40px 0;
          max-width: 390px;
          width: 100%;
        }
        .success-animation {
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
        }
        .success-check {
          width: 80px; height: 80px; display: block;
          margin: 0 auto;
        }
        .success-check circle {
          stroke-dasharray: 182;
          stroke-dashoffset: 182;
          animation: drawCircle 0.65s ease forwards;
        }
        .success-check .check {
          stroke-dasharray: 34;
          stroke-dashoffset: 34;
          animation: drawCheck 0.45s 0.54s cubic-bezier(.42,2,.54,.98) forwards;
        }
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck { to { stroke-dashoffset: 0; } }
        .modern-success-h1 {
          font-size: 2.08rem;
          font-weight: 900;
          letter-spacing: -0.01em;
          margin-bottom: 0.7rem;
          color: #191919;
        }
        .modern-success-info {
          color: #434343;
          font-size: 1.21rem;
          margin-bottom: 1.6rem;
        }
        .order-id-label {
          display: inline-block;
          margin-top: 0.2em;
          color: #111;
          font-size: 1.08em;
          background: #f3f3f7;
          border-radius: 7px;
          padding: 0.2em 0.6em;
          font-family: 'JetBrains Mono', 'Menlo', 'Consolas', 'monospace';
          font-weight: 700;
          letter-spacing: 0.01em;
        }
        .modern-success-btn,
        .modern-success-track-btn {
          display: block;
          background: #191919;
          color: #fff;
          font-weight: 700;
          border-radius: 11px;
          padding: 13px 0;
          font-size: 1.08em;
          text-decoration: none;
          margin: 0 auto 0 auto;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 1.5px 8px -2px #1d1d1d18;
          transition: background .18s, box-shadow .18s, color .17s;
        }
        .modern-success-btn:hover,
        .modern-success-btn:focus,
        .modern-success-track-btn:hover,
        .modern-success-track-btn:focus {
          background: #141414;
          color: #fff;
          box-shadow: 0 5px 24px -7px #2228;
          text-decoration: none;
        }
        .modern-success-track-btn {
          margin-top: 0.2em;
          background: #f0f0f0;
          color: #1d1d1d;
          border: 1px solid #bbb;
          font-weight: 700;
        }
        .modern-success-track-btn:hover,
        .modern-success-track-btn:focus {
          background: #e6e6e6;
          color: #111;
        }
        @media (max-width: 600px) {
          .modern-success-card { padding: 23px 0.8em; border-radius: 21px; }
          .modern-success-h1 { font-size: 1.45rem; }
        }
      `}</style>
    </div>
  );
}
