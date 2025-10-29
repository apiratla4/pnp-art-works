import React, { useEffect, useState } from 'react';

export default function OrderConfirmation() {
  const [msg, setMsg] = useState('Confirming your payment');

  useEffect(() => {
    // Example: perform API check here, then set a message
    const timer = setTimeout(() => {
      setMsg('Thank you! We will email the receipt after confirmation.');
    }, 1700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f6f6f6] py-12">
      <div className="bg-white rounded-2xl shadow px-8 py-14 w-full max-w-md text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black">
          {msg}
          {msg.startsWith("Confirming") && (
            <span className="animate-pulse ml-1 text-gray-400">...</span>
          )}
        </h2>
        <p className="text-gray-600 text-base mt-1">You will be redirected soon.</p>
      </div>
    </div>
  );
}
