// client/src/pages/OrderConfirmation.jsx
import React, { useEffect, useState } from 'react';

export default function OrderConfirmation() {
  const [msg, setMsg] = useState('Confirming your payment…');
  useEffect(() => {
    // Optionally parse orderId from query and poll your API for status
    setMsg('Thank you! We will email the receipt after confirmation.');
  }, []);
  return <div className="container py-5"><h2>{msg}</h2></div>;
}
