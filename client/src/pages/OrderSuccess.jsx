// src/pages/OrderSuccess.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function OrderSuccess() {
  const q = useQuery();
  const orderId = q.get('orderId');

  return (
    <div className="container py-5">
      <h1 className="h3 fw-bold mb-2">Order placed successfully</h1>
      <p className="text-muted">
        Thank you! The order has been created{orderId ? ` (ID: ${orderId})` : ''}. [6]
      </p>
      <div className="d-flex gap-2">
        <Link to="/" className="btn btn-danger">Continue shopping</Link>
        <Link to={`/orders/${orderId || ''}`} className="btn btn-outline-secondary">
          View order
        </Link>
      </div>
    </div>
  );
}
