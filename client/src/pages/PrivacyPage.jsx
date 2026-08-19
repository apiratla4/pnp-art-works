import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LAST_UPDATED = "August 28, 2025";

const PrivacyPage = () => (
  <div className="min-h-screen bg-[#f1efef]">
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white rounded-2xl shadow-md px-5 md:px-9 py-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h1 className="font-black text-2xl md:text-3xl text-black mb-0">Privacy Policy</h1>
          <span className="text-sm text-black">Last updated: {LAST_UPDATED}</span>
        </div>
        <p className="text-black">This Privacy Policy explains how PnpArtStudio collects, uses, discloses, and protects personal information when users visit or make a purchase from our website.</p>
        <SectionTitle>1. Information We Collect</SectionTitle>
        <ul className="list-disc list-inside text-black space-y-1">
          <li>Contact details (name, email, phone, shipping/billing addresses)</li>
          <li>Order details (items purchased, prices, transaction data)</li>
          <li>Account and preference information if a user creates an account</li>
          <li>Technical data (IP address, device, browser, cookies)</li>
        </ul>
        <SectionTitle>2. How We Use Information</SectionTitle>
        <ul className="list-disc list-inside text-black space-y-1">
          <li>To process orders, payments, shipping, and customer support</li>
          <li>To personalize content, improve services, and prevent fraud</li>
          <li>To send transactional emails; marketing only with consent or as permitted</li>
        </ul>
        <SectionTitle>3. Cookies &amp; Similar Technologies</SectionTitle>
        <p className="text-black">
          We use cookies and similar tools to improve site performance and user experience. The browser settings can be adjusted to refuse cookies, which may affect site functionality.
        </p>
        <SectionTitle>4. Sharing of Information</SectionTitle>
        <p className="text-black">We may share information with service providers that assist with payments, shipping, analytics, or marketing. We do not sell personal information.</p>
        <SectionTitle>5. Data Retention</SectionTitle>
        <p className="text-black">We retain personal information for as long as necessary to fulfill the purposes outlined in this policy unless a longer retention is required by law.</p>
        <SectionTitle>6. Security</SectionTitle>
        <p className="text-black">
          We implement reasonable technical and organizational measures to safeguard personal information. However, no method of transmission or storage is 100% secure.
        </p>
        <SectionTitle>7. Children’s Privacy</SectionTitle>
        <p className="text-black">
          Our services are not directed to children under the age applicable by local law. We do not knowingly collect personal data from children.
        </p>
        <SectionTitle>8. International Transfers</SectionTitle>
        <p className="text-black">Personal information may be transferred and processed outside the user’s country. Steps are taken to ensure an adequate level of data protection where required.</p>
        <SectionTitle>9. User Rights</SectionTitle>
        <p className="text-black">
          Depending on the jurisdiction, the user may have rights to access, correct, delete, or restrict personal data processing. Requests can be sent to <a href="mailto:pnp.artstudio7@gmail.com" className="underline text-blue-600">pnp.artstudio7@gmail.com</a>.
        </p>
        <SectionTitle>10. Changes to This Policy</SectionTitle>
        <p className="text-black">
          We may update this Privacy Policy periodically. Continued use after updates indicates acceptance of the revised policy.
        </p>
        <SectionTitle>11. Contact</SectionTitle>
        <p className="text-black">
          For privacy questions, contact <a href="mailto:pnp.artstudio7@gmail.com" className="underline text-blue-600">pnp.artstudio7@gmail.com</a> or use the <Link to="/contact" className="underline text-blue-600">Contact</Link> page.
        </p>
        <div className="border border-black bg-white rounded-xl px-4 py-3 text-base shadow mt-6 text-black">
          This template is provided for general informational purposes and may require updates to comply with local privacy regulations.
        </div>
      </motion.div>
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h5 className="font-bold mt-6 mb-2 text-lg text-black">{children}</h5>
);

export default PrivacyPage;
