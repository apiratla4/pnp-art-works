// src/pages/PrivacyPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LAST_UPDATED = "August 28, 2025";

const PrivacyPage = () => {
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
              <h1 className="fw-bold mb-0" style={{ color: "#000" }}>Privacy Policy</h1>
              <span className="small" style={{ color: "#000" }}>Last updated: {LAST_UPDATED}</span>
            </div>

            <p style={{ color: "#000" }}>
              This Privacy Policy explains how PnpArtStudio collects, uses, discloses, and protects personal information when users visit or make a purchase from our website.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>1. Information We Collect</h5>
            <ul style={{ color: "#000" }}>
              <li>Contact details (name, email, phone, shipping/billing addresses)</li>
              <li>Order details (items purchased, prices, transaction data)</li>
              <li>Account and preference information if a user creates an account</li>
              <li>Technical data (IP address, device, browser, cookies)</li>
            </ul>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>2. How We Use Information</h5>
            <ul style={{ color: "#000" }}>
              <li>To process orders, payments, shipping, and customer support</li>
              <li>To personalize content, improve services, and prevent fraud</li>
              <li>To send transactional emails; marketing only with consent or as permitted</li>
            </ul>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>3. Cookies &amp; Similar Technologies</h5>
            <p style={{ color: "#000" }}>
              We use cookies and similar tools to improve site performance and user experience. The browser settings can be adjusted to refuse cookies, which may affect site functionality.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>4. Sharing of Information</h5>
            <p style={{ color: "#000" }}>
              We may share information with service providers that assist with payments, shipping, analytics, or marketing. We do not sell personal information.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>5. Data Retention</h5>
            <p style={{ color: "#000" }}>
              We retain personal information for as long as necessary to fulfill the purposes outlined in this policy unless a longer retention is required by law.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>6. Security</h5>
            <p style={{ color: "#000" }}>
              We implement reasonable technical and organizational measures to safeguard personal information. However, no method of transmission or storage is 100% secure.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>7. Children’s Privacy</h5>
            <p style={{ color: "#000" }}>
              Our services are not directed to children under the age applicable by local law. We do not knowingly collect personal data from children.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>8. International Transfers</h5>
            <p style={{ color: "#000" }}>
              Personal information may be transferred and processed outside the user’s country. Steps are taken to ensure an adequate level of data protection where required.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>9. User Rights</h5>
            <p style={{ color: "#000" }}>
              Depending on the jurisdiction, the user may have rights to access, correct, delete, or restrict personal data processing. Requests can be sent to <a href="mailto:pnp.artstudio7@gmail.com">pnp.artstudio7@gmail.com</a>.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>10. Changes to This Policy</h5>
            <p style={{ color: "#000" }}>
              We may update this Privacy Policy periodically. Continued use after updates indicates acceptance of the revised policy.
            </p>

            <h5 className="fw-semibold mt-4" style={{ color: "#000" }}>11. Contact</h5>
            <p style={{ color: "#000" }}>
              For privacy questions, contact <a href="mailto:pnp.artstudio7@gmail.com">pnp.artstudio7@gmail.com</a> or use the <Link to="/contact">Contact</Link> page.
            </p>

            <div className="mono-alert mt-4 mb-0">
              This template is provided for general informational purposes and may require updates to comply with local privacy regulations.
            </div>
          </div>
        </motion.div>
      </div>

      {/* Local monochrome + focus-visible styles */}
      <style>{`
        .mono-alert {
          border: 1px solid #000;
          background: #fff;
          color: #000;
          border-radius: 0.5rem;
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

export default PrivacyPage;
