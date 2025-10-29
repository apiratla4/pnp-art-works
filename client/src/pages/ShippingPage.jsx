import React from "react";
import { motion } from "framer-motion";

const LAST_UPDATED = "August 28, 2025";

const ShippingPage = () => (
  <div className="min-h-screen bg-[#f1efef]">
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white rounded-2xl shadow-md px-5 md:px-9 py-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h1 className="font-black text-2xl md:text-3xl text-black mb-0">Shipping Policy</h1>
          <span className="text-sm text-black">Last updated: {LAST_UPDATED}</span>
        </div>
        <SectionTitle>Processing Times</SectionTitle>
        <p className="text-black">Orders typically process in 2–3 business days. Custom orders may require additional lead time as communicated during purchase.</p>
        <SectionTitle>Shipping Methods &amp; Rates</SectionTitle>
        <p className="text-black">We partner with reputable carriers offering standard and expedited options. Shipping rates are calculated at checkout based on destination, weight, and service level.</p>
        <SectionTitle>Tracking</SectionTitle>
        <p className="text-black">Tracking details are emailed once the order ships. Please allow up to 24 hours for carrier updates to appear.</p>
        <SectionTitle>International Shipping</SectionTitle>
        <p className="text-black">
          International orders may be subject to customs duties, taxes, and fees charged by the destination country. These charges are the recipient’s responsibility and are not included in our prices or shipping rates.
        </p>
        <SectionTitle>Delivery Issues</SectionTitle>
        <ul className="list-disc list-inside text-black space-y-1">
          <li>Undeliverable or incorrect addresses may cause delays or returns</li>
          <li>Lost/delayed packages require a carrier investigation before resolution</li>
          <li>Weather or carrier disruptions can impact delivery times</li>
        </ul>
        <SectionTitle>Split Shipments</SectionTitle>
        <p className="text-black">Orders may be split into multiple shipments to improve handling and delivery times. Users will receive separate tracking as needed.</p>
        <div className="border border-black bg-white rounded-xl px-4 py-3 text-base shadow mt-5 text-black">
          Shipping questions? Contact <a href="mailto:pnp.artstudio7@gmail.com" className="underline text-blue-600">pnp.artstudio7@gmail.com</a> for assistance.
        </div>
      </motion.div>
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h5 className="font-bold mt-6 mb-2 text-lg text-black">{children}</h5>
);

export default ShippingPage;
