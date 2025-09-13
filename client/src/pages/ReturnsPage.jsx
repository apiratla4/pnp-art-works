// src/pages/ReturnsPage.jsx
import React from "react";
import { motion } from "framer-motion";

const LAST_UPDATED = "August 28, 2025";

const ReturnsPage = () => {
  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f1efef" }}>
      <div className="container py-4 py-lg-5">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="card border-0 shadow-sm rounded-4"
          style={{ background: "#fff", color: "#000" }}
        >
          <div className="card-body p-4 p-lg-5">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <h1 className="fw-bold mb-0" style={{ color: "#000" }}>Returns & Refunds</h1>
              <span className="small" style={{ color: "#000" }}>Last updated: {LAST_UPDATED}</span>
            </div>

            <h5 className="fw-semibold mt-2" style={{ color: "#000" }}>Return Window</h5>
            <p style={{ color: "#000" }}>
              Returns are accepted within 7 days of delivery for eligible items. To be eligible, the item must be unused, in original condition, and in original packaging.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>Non‑returnable Items</h5>
            <ul style={{ color: "#000" }}>
              <li>Custom orders and commissions</li>
              <li>Digital downloads</li>
              <li>Gift cards</li>
              <li>Final sale or clearance items (if marked)</li>
            </ul>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>Return Process</h5>
            <ol style={{ color: "#000" }}>
              <li>Email a return request with order number and reason to <a href="mailto:pnp.artstudio7@gmail.com">pnp.artstudio7@gmail.com</a>.</li>
              <li>Wait for return authorization and instructions.</li>
              <li>Pack securely and ship using a trackable method within 5 days of authorization.</li>
            </ol>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>Refunds</h5>
            <p style={{ color: "#000" }}>
              Once received and inspected, approved refunds are issued to the original payment method within 5–10 business days. Shipping fees are non‑refundable unless the return is due to our error or a defective item.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>Damages & Issues</h5>
            <p style={{ color: "#000" }}>
              Please inspect the order upon delivery and contact us within 48 hours if the item is defective, damaged, or incorrect. Provide photos of the packaging and item to expedite resolution.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>Exchanges</h5>
            <p style={{ color: "#000" }}>
              Exchanges may be possible for equal or higher‑value items (price differences apply). Contact us for availability and instructions.
            </p>

            <div className="mono-alert mt-4 mb-0">
              For any return questions, email <a href="mailto:pnp.artstudio7@gmail.com">pnp.artstudio7@gmail.com</a>. Policies may vary for international orders.
            </div>
          </div>
        </motion.div>
      </div>

      {/* Local monochrome + focus-visible */}
      <style>{`
        .mono-alert {
          border: 1px solid #000;
          background: #fff;
          color: #000;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
        }
        a:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        a:focus { outline: 2px solid #000; outline-offset: 2px; }
      `}</style>
    </div>
  );
};

export default ReturnsPage;
