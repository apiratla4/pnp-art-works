// src/pages/CheckoutPage.jsx
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Truck, ShieldCheck, Percent, Tag } from 'lucide-react';
import axios from 'axios';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import FancyButton from '../components/FancyButton';


const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';


// USD formatter
const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });


// Helper: ODR-XXXXXXXXXXXX id (timestamp tail + 4 random digits)
function generateOrderId() {
  const ts = Date.now().toString().slice(-8);
  const rnd = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ODR-${ts}${rnd}`;
}


function StripeInnerForm({ orderId, onDone }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);


  const onSubmitStripe = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;


    setSubmitting(true);
    setMessage(null);


    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/confirmation?orderId=${encodeURIComponent(orderId)}`,
      },
    });


    if (error) setMessage(error.message || 'Payment failed, please check your details and try again.');
    else setMessage('Processing…');
    setSubmitting(false);
    onDone?.();
  };


  return (
    <form onSubmit={onSubmitStripe}>
      <PaymentElement />
      <FancyButton as="button" type="submit" className="fancy-sm w-100 mt-3" disabled={!stripe || !elements || submitting}>
        {submitting ? 'Processing…' : 'Pay now'}
      </FancyButton>
      {message && <div className="small mt-2" style={{ color: '#000' }}>{message}</div>}
    </form>
  );
}


export default function CheckoutPage() {
  const navigate = useNavigate();
  const { state } = useCart?.() || { state: { items: [] } };


  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    sameAsShipping: true,
    paymentMethod: 'cod', // cod | card
    promo: ''
  });


  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);


  // Stripe state
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [startingCardPay, setStartingCardPay] = useState(false);


  // Coupons
  const [coupon, setCoupon] = useState({ code: '', percent: 0, status: '' });
  const [promoMsg, setPromoMsg] = useState('');


  // Cart totals (USD)
  const items = state.items || [];
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * (it.quantity || 1), 0),
    [items]
  );
  const shipping = subtotal > 50 ? 0 : 4.99;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const discount = useMemo(
    () => Math.round(subtotal * (coupon.percent / 100) * 100) / 100,
    [subtotal, coupon.percent]
  );
  const total = Math.max(0, Math.round((subtotal + shipping + tax - discount) * 100) / 100);


  // Validation
  const required = ['firstName', 'lastName', 'email', 'address1', 'city', 'state', 'zip'];
  const errors = useMemo(() => {
    const e = {};
    for (const k of required) {
      const v = (form[k] || '').trim();
      if (!v) e[k] = 'Required';
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (form.phone && form.phone.trim() && !/^\+?[0-9 ()-]{7,}$/.test(form.phone)) e.phone = 'Invalid phone';
    return e;
  }, [form]);


  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));


  // Validate/apply coupon using backend
  const applyPromo = async (e) => {
    e.preventDefault();
    const raw = form.promo.trim();
    if (!raw) {
      setPromoMsg('Enter a code');
      return;
    }
    try {
      const { data } = await axios.get(
        `${API_BASE}/api/coupons/validate/${encodeURIComponent(raw)}`,
        { withCredentials: true }
      );
      if (data?.valid) {
        setCoupon({ code: data.code, percent: Number(data.percent || 0), status: 'applied' });
        setPromoMsg(`Promo applied: ${data.percent}% off`);
      } else {
        setCoupon({ code: '', percent: 0, status: 'invalid' });
        setPromoMsg(data?.message || 'Invalid code');
      }
    } catch {
      setCoupon({ code: '', percent: 0, status: 'error' });
      setPromoMsg('Unable to validate code. Try again.');
    }
  };


  // Payloads for server
  const cartPayload = items.map((it) => ({
    productId: it.id,
    qty: it.quantity || 1,
  }));


  const customerPayload = {
    email: form.email,
    name: `${form.firstName} ${form.lastName}`.trim(),
    address: {
      line1: form.address1,
      line2: form.address2,
      city: form.city,
      state: form.state,
      postal_code: form.zip,
      country: form.country || 'US',
    },
    phone: form.phone || '',
  };


  const buildClientSummary = () => {
    const itemsPreview = items.map((it) => ({
      id: it.id,
      title: it.title,
      image: it.image,
      unitPrice: it.price,
      qty: it.quantity || 1,
      lineTotal: it.price * (it.quantity || 1),
      category: it.category || '',
    }));
    return {
      promoCode: coupon.code || '',
      percent: coupon.percent || 0,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      itemsPreview,
      currency: 'USD'
    };
  };


  // Start Stripe flow
  const startStripeFlow = async () => {
    try {
      setStartingCardPay(true);
      const res = await axios.post(
        `${API_BASE}/api/checkout/payment-intent`,
        { cart: cartPayload, customer: customerPayload },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      setClientSecret(res.data.clientSecret);
      setOrderId(res.data.orderId);
    } catch (e) {
      console.error(e);
      alert('Could not start payment, please try again.');
    } finally {
      setStartingCardPay(false);
    }
  };


  // COD
  const placeCodOrder = async () => {
    setSubmitting(true);
    const localOid = generateOrderId();
    try {
      const summary = buildClientSummary();
      await axios.post(
        `${API_BASE}/api/checkout/cod-order`,
        {
          cart: cartPayload,
          customer: customerPayload,
          payment: { method: 'cod' },
          summary,
          note: 'COD checkout',
          clientOrderId: localOid
        },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      ).catch(() => {});
    } catch {
      // ignore server failure
    } finally {
      setSubmitting(false);
      navigate(`/order/success?orderId=${encodeURIComponent(localOid)}`, { replace: true });
    }
  };


  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched((t) => {
      const all = { ...t };
      ['firstName','lastName','email','address1','city','state','zip'].forEach((k) => (all[k] = true));
      return all;
    });
    if (Object.keys(errors).length > 0) return;


    if (form.paymentMethod === 'cod') {
      await placeCodOrder();
      return;
    }
    if (form.paymentMethod === 'card') {
      if (!clientSecret) await startStripeFlow();
      return;
    }
  };


  // Stripe Elements appearance (monochrome)
  const elementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'flat',
          variables: {
            colorPrimary: '#000000',
            colorBackground: '#ffffff',
            colorText: '#000000',
            colorDanger: '#000000',
            fontSizeBase: '16px',
            spacingUnit: '4px',
            borderRadius: '4px'
          }
        }
      }
    : undefined;


  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f1efef' }}>
      <div className="container py-4 py-lg-5">
        <div className="mb-4">
          <h1 className="fw-bold h3 mb-1" style={{ color: '#000' }}>Checkout</h1>
          <p className="mb-0" style={{ color: '#000' }}>Secure payment and fast delivery</p>
        </div>


        <div className="row g-4 g-lg-5">
          {/* Form */}
          <div className="col-12 col-lg-7">
            <form id="checkoutForm" noValidate onSubmit={onSubmit} className="needs-validation">
              <div className="card border-0 shadow-sm rounded-4 mb-3" style={{ background: '#fff', color: '#000' }}>
                <div className="card-body">
                  <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ color: '#000' }}>
                    <Truck size={18} /> Shipping address
                  </h5>


                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label">First name</label>
                      <input
                        name="firstName" type="text"
                        className={`form-control ${touched.firstName && errors.firstName ? 'is-invalid' : ''}`}
                        value={form.firstName}
                        onChange={(e) => setField('firstName', e.target.value)}
                        onBlur={onBlur} required
                      />
                      <div className="invalid-feedback">First name is required</div>
                    </div>


                    <div className="col-sm-6">
                      <label className="form-label">Last name</label>
                      <input
                        name="lastName" type="text"
                        className={`form-control ${touched.lastName && errors.lastName ? 'is-invalid' : ''}`}
                        value={form.lastName}
                        onChange={(e) => setField('lastName', e.target.value)}
                        onBlur={onBlur} required
                      />
                      <div className="invalid-feedback">Last name is required</div>
                    </div>


                    <div className="col-12">
                      <label className="form-label">Email</label>
                      <input
                        name="email" type="email"
                        className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                        value={form.email}
                        onChange={(e) => setField('email', e.target.value)}
                        onBlur={onBlur} required
                      />
                      <div className="invalid-feedback">{errors.email || 'Valid email required'}</div>
                    </div>


                    <div className="col-12">
                      <label className="form-label">Phone (optional)</label>
                      <input
                        name="phone" type="tel"
                        className={`form-control ${touched.phone && errors.phone ? 'is-invalid' : ''}`}
                        value={form.phone}
                        onChange={(e) => setField('phone', e.target.value)}
                        onBlur={onBlur}
                        placeholder="+1 555 555 5555"
                      />
                      <div className="invalid-feedback">{errors.phone}</div>
                    </div>


                    <div className="col-12">
                      <label className="form-label">Address line 1</label>
                      <input
                        name="address1" type="text"
                        className={`form-control ${touched.address1 && errors.address1 ? 'is-invalid' : ''}`}
                        value={form.address1}
                        onChange={(e) => setField('address1', e.target.value)}
                        onBlur={onBlur} required
                      />
                      <div className="invalid-feedback">Address is required</div>
                    </div>


                    <div className="col-12">
                      <label className="form-label">Address line 2 (optional)</label>
                      <input
                        name="address2" type="text"
                        className="form-control"
                        value={form.address2}
                        onChange={(e) => setField('address2', e.target.value)}
                        onBlur={onBlur}
                      />
                    </div>


                    <div className="col-md-5">
                      <label className="form-label">Country</label>
                      <select
                        name="country" className="form-select"
                        value={form.country}
                        onChange={(e) => setField('country', e.target.value)}
                      >
                        <option value="US">United States</option>
                        <option value="IN">India</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AE">UAE</option>
                      </select>
                    </div>


                    <div className="col-md-4">
                      <label className="form-label">State</label>
                      <input
                        name="state" type="text"
                        className={`form-control ${touched.state && errors.state ? 'is-invalid' : ''}`}
                        value={form.state}
                        onChange={(e) => setField('state', e.target.value)}
                        onBlur={onBlur} required
                      />
                      <div className="invalid-feedback">State is required</div>
                    </div>


                    <div className="col-md-3">
                      <label className="form-label">ZIP</label>
                      <input
                        name="zip" type="text"
                        className={`form-control ${touched.zip && errors.zip ? 'is-invalid' : ''}`}
                        value={form.zip}
                        onChange={(e) => setField('zip', e.target.value)}
                        onBlur={onBlur} required
                      />
                      <div className="invalid-feedback">ZIP is required</div>
                    </div>
                  </div>


                  <div className="form-check mt-3">
                    <input
                      id="sameAsShipping" className="form-check-input" type="checkbox"
                      checked={form.sameAsShipping}
                      onChange={(e) => setField('sameAsShipping', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="sameAsShipping">
                      Billing address same as shipping
                    </label>
                  </div>
                </div>
              </div>


              <div className="card border-0 shadow-sm rounded-4 mb-3" style={{ background: '#fff', color: '#000' }}>
                <div className="card-body">
                  <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ color: '#000' }}>
                    <CreditCard size={18} /> Payment
                  </h5>


                  <div className="form-check mb-2">
                    <input
                      id="pm-cod" className="form-check-input" type="radio" name="paymentMethod"
                      checked={form.paymentMethod === 'cod'}
                      onChange={() => setField('paymentMethod', 'cod')}
                    />
                    <label className="form-check-label" htmlFor="pm-cod">
                      Cash on Delivery (COD)
                    </label>
                  </div>


                  <div className="form-check mb-3">
                    <input
                      id="pm-card" className="form-check-input" type="radio" name="paymentMethod"
                      checked={form.paymentMethod === 'card'}
                      onChange={async () => {
                        setField('paymentMethod', 'card');
                        if (!clientSecret && items.length > 0) {
                          await startStripeFlow();
                        }
                      }}
                    />
                    <label className="form-check-label" htmlFor="pm-card">
                      Card / UPI
                    </label>
                  </div>


                  {form.paymentMethod === 'card' && (
                    clientSecret && elementsOptions ? (
                      <Elements stripe={stripePromise} options={elementsOptions}>
                        <StripeInnerForm orderId={orderId} onDone={() => {}} />
                      </Elements>
                    ) : (
                      <div className="mono-alert mb-0">
                        Preparing secure payment… {startingCardPay ? 'Please wait.' : ''}
                      </div>
                    )
                  )}


                  {form.paymentMethod !== 'card' && (
                    <div className="mono-alert d-flex align-items-center gap-2 mb-0">
                      <ShieldCheck size={18} />
                      <div className="small mb-0" style={{ color: '#000' }}>
                        Payments are processed securely; select Card/UPI to pay now.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>


          {/* Summary */}
          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 mb-3" style={{ background: '#fff', color: '#000' }}>
              <div className="card-body">
                <h5 className="fw-semibold mb-3" style={{ color: '#000' }}>Order summary</h5>
                {items.length === 0 ? (
                  <p className="mb-0" style={{ color: '#000' }}>No items in cart.</p>
                ) : (
                  <div className="vstack gap-3">
                    {items.map((it) => (
                      <div key={it.id} className="d-flex align-items-center">
                        <img
                          src={it.image} alt={it.title}
                          className="rounded me-3 object-fit-cover"
                          style={{ width: 56, height: 56, border: '1px solid #000' }}
                        />
                        <div className="flex-grow-1" style={{ color: '#000' }}>
                          <div className="small fw-semibold">{it.title}</div>
                          <div className="small">
                            {it.category} • Qty {it.quantity || 1}
                          </div>
                        </div>
                        <div className="small fw-semibold" style={{ color: '#000' }}>
                          {fmtUSD.format(it.price * (it.quantity || 1))}
                        </div>
                      </div>
                    ))}
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between small" style={{ color: '#000' }}>
                      <span>Subtotal</span>
                      <span>{fmtUSD.format(subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between small" style={{ color: '#000' }}>
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : fmtUSD.format(shipping)}</span>
                    </div>
                    <div className="d-flex justify-content-between small" style={{ color: '#000' }}>
                      <span>Tax (est.)</span>
                      <span>{fmtUSD.format(tax)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="d-flex justify-content-between small" style={{ color: '#000' }}>
                        <span>Discount {coupon.code ? `(${coupon.code})` : ''}</span>
                        <span>-{fmtUSD.format(discount)}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between fw-bold" style={{ color: '#000' }}>
                      <span>Total</span>
                      <span>{fmtUSD.format(total)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Promo */}
            <div className="card border-0 shadow-sm rounded-4" style={{ background: '#fff', color: '#000' }}>
              <div className="card-body">
                <h6 className="fw-semibold mb-2 d-flex align-items-center gap-2" style={{ color: '#000' }}>
                  <Tag size={16} /> Apply promo code
                </h6>
                <form onSubmit={applyPromo} className="d-flex gap-2">
                  <input
                    type="text" className="form-control" placeholder="Enter code"
                    value={form.promo} onChange={(e) => setField('promo', e.target.value.toUpperCase())}
                  />
                  <FancyButton as="button" type="submit" className="fancy-sm d-inline-flex align-items-center gap-2">
                    <Percent size={16} />
                    Apply
                  </FancyButton>
                </form>
                {promoMsg && <div className="small mt-2" style={{ color: '#000' }}>{promoMsg}</div>}
              </div>
            </div>

            {/* Place order button under promo code section */}
            <div className="d-grid mt-3">
              <FancyButton
                as="button"
                type="submit"
                form="checkoutForm"
                className="fancy-sm py-3"
                disabled={submitting || items.length === 0}
              >
                {submitting ? 'Placing order...' : `Place order • ${fmtUSD.format(total)}`}
              </FancyButton>
            </div>
          </div>
        </div>



        {/* Local overrides for monochrome forms and alerts */}
        <style>{`
          /* Form controls focus in black, no blue glow */
          .form-control:focus,
          .form-select:focus {
            border-color: #000 !important;
            box-shadow: none !important;
          }
          /* Radios/checkboxes in black */
          .form-check-input {
            accent-color: #000;
          }
          /* Invalid state in black (no red) */
          .form-control.is-invalid,
          .was-validated .form-control:invalid {
            border-color: #000 !important;
            background-image: none !important;
          }
          .invalid-feedback { color: #000 !important; }


          /* Monochrome alert */
          .mono-alert {
            border: 1px solid #000;
            background: #fff;
            color: #000;
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
          }
        `}</style>
      </div>
    </div>
  );
}
