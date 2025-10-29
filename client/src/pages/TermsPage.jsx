import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LAST_UPDATED = "August 28, 2025";

const TermsPage = () => (
  <div className="min-h-screen bg-[#f1efef]">
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white rounded-2xl shadow-md px-5 md:px-9 py-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h1 className="font-black text-2xl md:text-3xl text-black mb-0">Terms & Conditions</h1>
          <span className="text-sm text-black">Last updated: {LAST_UPDATED}</span>
        </div>
        <p className="text-black">Please read these Terms & Conditions carefully before using the PnpArtStudio website and services. By accessing or using our site, the user agrees to be bound by these Terms. If the user disagrees with any part, the user should discontinue use of the services.</p>
        <SectionTitle>1. Eligibility &amp; Accounts</SectionTitle>
        <p className="text-black">To place orders, the user may be required to create an account. The user agrees to provide accurate information and is responsible for maintaining the confidentiality of login credentials and for all activities under the account.</p>
        <SectionTitle>2. Orders, Pricing &amp; Availability</SectionTitle>
        <p className="text-black">All orders are subject to acceptance and availability. Prices may change without notice. If an error in pricing or product details occurs, PnpArtStudio may cancel or adjust the order after notifying the user.</p>
        <SectionTitle>3. Payments</SectionTitle>
        <p className="text-black">Accepted payment methods are displayed at checkout. By submitting payment information, the user represents that they are authorized to use the selected method and authorizes charges for the order total, including taxes and shipping.</p>
        <SectionTitle>4. Shipping & Delivery</SectionTitle>
        <p className="text-black">Processing times and delivery estimates are outlined on our <Link to="/shipping" className="underline text-blue-600">Shipping</Link> page. Risk of loss transfers upon delivery by the carrier to the address provided by the user.</p>
        <SectionTitle>5. Returns & Refunds</SectionTitle>
        <p className="text-black">Our return windows, conditions, and exclusions are described on the <Link to="/returns" className="underline text-blue-600">Returns</Link> page. Custom orders and digital items are typically non‑returnable.</p>
        <SectionTitle>6. Intellectual Property</SectionTitle>
        <p className="text-black">All artworks, images, logos, and content on this site are owned by or licensed to PnpArtStudio and protected by applicable laws. The user may not reproduce, distribute, or create derivative works without prior written consent.</p>
        <SectionTitle>7. User Content &amp; Reviews</SectionTitle>
        <p className="text-black">By submitting reviews or content, the user grants PnpArtStudio a non‑exclusive, royalty‑free license to use, reproduce, and display such content in connection with the services.</p>
        <SectionTitle>8. Prohibited Uses</SectionTitle>
        <p className="mb-1 text-black">The user agrees not to:</p>
        <ul className="list-disc list-inside text-black space-y-1">
          <li>Violate laws or infringe third‑party rights</li>
          <li>Interfere with site security or functionality</li>
          <li>Upload malicious code or spam</li>
          <li>Misrepresent identity or purchase information</li>
        </ul>
        <SectionTitle>9. Disclaimer &amp; Limitation of Liability</SectionTitle>
        <p className="text-black">The services are provided “as is” and “as available.” To the fullest extent permitted by law, PnpArtStudio disclaims all warranties and is not liable for indirect or consequential damages.</p>
        <SectionTitle>10. Indemnification</SectionTitle>
        <p className="text-black">The user agrees to indemnify and hold PnpArtStudio harmless from claims arising out of the user’s violation of these Terms or misuse of the services.</p>
        <SectionTitle>11. Governing Law</SectionTitle>
        <p className="text-black">These Terms are governed by the laws of the user’s local jurisdiction unless otherwise required by applicable law. Venue and jurisdiction shall be as permitted by law.</p>
        <SectionTitle>12. Changes to Terms</SectionTitle>
        <p className="text-black">We may update these Terms from time to time. Continued use after changes become effective constitutes acceptance of the revised Terms.</p>
        <SectionTitle>13. Contact</SectionTitle>
        <p className="text-black">Questions about these Terms can be sent to <a href="mailto:pnp.artstudio7@gmail.com" className="underline text-blue-600">pnp.artstudio7@gmail.com</a>.</p>
        <div className="border border-black bg-white rounded-xl px-4 py-3 text-base shadow mt-6 text-black">
          This page provides general information and does not constitute legal advice. Consider consulting a qualified attorney to tailor these terms to specific business needs.
        </div>
      </motion.div>
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h5 className="font-bold mt-6 mb-2 text-lg text-black">{children}</h5>
);

export default TermsPage;
