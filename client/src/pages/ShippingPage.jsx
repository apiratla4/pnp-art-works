// src/pages/ShippingPage.jsx
import React from "react";
import { motion } from "framer-motion";

const LAST_UPDATED = "August 28, 2025";

const ShippingPage = () => {
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
              <h1 className="fw-bold mb-0" style={{ color: "#000" }}>Shipping Policy</h1>
              <span className="small" style={{ color: "#000" }}>Last updated: {LAST_UPDATED}</span>
            </div>

            <h5 className="fw-semibold mt-2" style={{ color: "#000" }}>Processing Times</h5>
            <p style={{ color: "#000" }}>
              Orders typically process in 2–3 business days. Custom orders may require additional lead time as communicated during purchase.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>Shipping Methods & Rates</h5>
            <p style={{ color: "#000" }}>
              We partner with reputable carriers offering standard and expedited options. Shipping rates are calculated at checkout based on destination, weight, and service level.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>Tracking</h5>
            <p style={{ color: "#000" }}>
              Tracking details are emailed once the order ships. Please allow up to 24 hours for carrier updates to appear.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>International Shipping</h5>
            <p style={{ color: "#000" }}>
              International orders may be subject to customs duties, taxes, and fees charged by the destination country. These charges are the recipient’s responsibility and are not included in our prices or shipping rates.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>Delivery Issues</h5>
            <ul style={{ color: "#000" }}>
              <li>Undeliverable or incorrect addresses may cause delays or returns</li>
              <li>Lost/delayed packages require a carrier investigation before resolution</li>
              <li>Weather or carrier disruptions can impact delivery times</li>
            </ul>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>Split Shipments</h5>
            <p style={{ color: "#000" }}>
              Orders may be split into multiple shipments to improve handling and delivery times. Users will receive separate tracking as needed.
            </p>

            <div className="mono-alert mt-4 mb-0">
              Shipping questions? Contact <a href="mailto:pnp.artstudio7@gmail.com">pnp.artstudio7@gmail.com</a> for assistance.
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

export default ShippingPage;
