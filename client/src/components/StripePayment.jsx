// client/src/components/StripePayment.jsx
import React, { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';

function InnerPaymentForm({ orderId, onDone }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setMsg(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/confirmation?orderId=${encodeURIComponent(orderId)}`,
      },
      // redirect: 'if_required', // optional advanced flow
    });

    if (error) setMsg(error.message || 'Payment failed, please try again.');
    else setMsg('Processing…');
    setSubmitting(false);
    onDone?.(); // allow parent to transition UI
  };

  return (
    <form onSubmit={submit}>
      <PaymentElement />
      <button className="btn btn-danger w-100 mt-3" disabled={!stripe || submitting}>
        {submitting ? 'Processing…' : 'Pay now'}
      </button>
      {msg && <div className="small mt-2">{msg}</div>}
    </form>
  );
}

export default function StripePayment({ clientSecret, orderId, onDone }) {
  if (!clientSecret) return null;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <InnerPaymentForm orderId={orderId} onDone={onDone} />
    </Elements>
  );
}
