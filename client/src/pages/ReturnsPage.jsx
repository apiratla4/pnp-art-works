import React from "react";
import { motion } from "framer-motion";

const LAST_UPDATED = "August 28, 2025";

const ReturnsPage = () => (
  <div className="min-h-screen bg-[#f1efef]">
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white rounded-2xl shadow-md px-5 md:px-9 py-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h1 className="font-black text-2xl md:text-3xl text-black mb-0">Returns & Refunds</h1>
          <span className="text-sm text-black">Last updated: {LAST_UPDATED}</span>
        </div>
        <SectionTitle>Return Window</SectionTitle>
        <p className="text-black">Returns are accepted within 7 days of delivery for eligible items. To be eligible, the item must be unused, in original condition, and in original packaging.</p>
        <SectionTitle>Non‑returnable Items</SectionTitle>
        <ul className="list-disc list-inside text-black space-y-1">
          <li>Custom orders and commissions</li>
          <li>Digital downloads</li>
          <li>Gift cards</li>
          <li>Final sale or clearance items (if marked)</li>
        </ul>
        <SectionTitle>Return Process</SectionTitle>
        <ol className="list-decimal list-inside text-black space-y-1">
          <li>Email a return request with order number and reason to <a href="mailto:pnp.artstudio7@gmail.com" className="underline text-blue-600">pnp.artstudio7@gmail.com</a>.</li>
          <li>Wait for return authorization and instructions.</li>
          <li>Pack securely and ship using a trackable method within 5 days of authorization.</li>
        </ol>
        <SectionTitle>Refunds</SectionTitle>
        <p className="text-black">Once received and inspected, approved refunds are issued to the original payment method within 5–10 business days. Shipping fees are non‑refundable unless the return is due to our error or a defective item.</p>
        <SectionTitle>Damages & Issues</SectionTitle>
        <p className="text-black">Please inspect the order upon delivery and contact us within 48 hours if the item is defective, damaged, or incorrect. Provide photos of the packaging and item to expedite resolution.</p>
        <SectionTitle>Exchanges</SectionTitle>
        <p className="text-black">Exchanges may be possible for equal or higher‑value items (price differences apply). Contact us for availability and instructions.</p>
        <div className="border border-black bg-white rounded-xl px-4 py-3 text-base shadow mt-6 text-black">
          For any return questions, email <a href="mailto:pnp.artstudio7@gmail.com" className="underline text-blue-600">pnp.artstudio7@gmail.com</a>. Policies may vary for international orders.
        </div>
      </motion.div>
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h5 className="font-bold mt-6 mb-2 text-lg text-black">{children}</h5>
);

export default ReturnsPage;
