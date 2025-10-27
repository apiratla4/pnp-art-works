// src/pages/CheckoutPage.jsx
import React, { useMemo, useState, useCallback, useRef } from 'react';
import { CreditCard, Truck, ShieldCheck, Percent, Tag } from 'lucide-react';
import axios from 'axios';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import FancyButton from '../components/FancyButton';

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const api = (path) => `${API_ORIGIN}/api${path}`;
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const hasClient = typeof PAYPAL_CLIENT_ID === 'string' && PAYPAL_CLIENT_ID.trim().length > 0;
const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const FALLBACK_IMG = '/placeholder.png';

const toUrl = (entry) => {
  if (!entry) return '';
  if (typeof entry === 'string') return entry.trim();
  if (typeof entry === 'object') {
    const u = entry.secure_url || entry.url || entry.src || entry.path || '';
    return String(u).trim();
  }
  return '';
};

const getCover = (item) => {
  const single = toUrl(item?.image);
  if (single) return single;
  const arr = Array.isArray(item?.images) ? item.images : [];
  const first = arr.find(Boolean);
  return toUrl(first);
};

const handleImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_IMG;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { state } = useCart();

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
    paymentMethod: 'cod',
    promo: ''
  });

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState({ code: '', percent: 0, status: '' });
  const [promoMsg, setPromoMsg] = useState('');

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

  const setField = useCallback((name, value) => setForm((f) => ({ ...f, [name]: value })), []);
  const onBlur = useCallback((e) => setTouched((t) => ({ ...t, [e.target.name]: true })), []);

  const applyPromo = useCallback(async (e) => {
    e.preventDefault();
    const raw = form.promo.trim();
    if (!raw) {
      setPromoMsg('Enter a code');
      return;
    }
    try {
      const { data } = await axios.get(api(`/coupons/validate/${encodeURIComponent(raw)}`));
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
  }, [form.promo]);

  const itemsPayload = useMemo(() => items.map(it => ({
    name: it.title,
    price: Number(it.price),
    quantity: Number(it.quantity || 1),
    description: it.description || '',
    id: it.id,
    variant: it.variant || ''
  })), [items]);

  const shippingAddress = useMemo(() => ({
    firstName: form.firstName,
    lastName: form.lastName,
    address1: form.address1,
    address2: form.address2,
    city: form.city,
    state: form.state,
    zip: form.zip,
    country: form.country,
    phone: form.phone,
    email: form.email
  }), [form]);

  const customer = useMemo(() => ({
    email: form.email,
    firstName: form.firstName,
    lastName: form.lastName
  }), [form.email, form.firstName, form.lastName]);

  const placeCodOrder = useCallback(async () => {
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        api('/checkout/cod-order'),
        {
          cart: itemsPayload,
          customer,
          payment: { method: 'cod' },
          summary: { subtotal, tax, shipping, discount, total },
          note: 'COD checkout'
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const oid = data?.orderId || 'ODR-LOCAL';
      navigate(`/order/success?orderId=${encodeURIComponent(oid)}`, { replace: true });
    } catch {
      navigate(`/order/success`, { replace: true });
    } finally {
      setSubmitting(false);
    }
  }, [itemsPayload, customer, subtotal, tax, shipping, discount, total, navigate]);

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    setTouched(t => {
      const all = { ...t };
      required.forEach(k => (all[k] = true));
      return all;
    });
    if (Object.keys(errors).length > 0) return;
    if (form.paymentMethod === 'cod') {
      await placeCodOrder();
      return;
    }
  }, [errors, form.paymentMethod, placeCodOrder]);

  const approvalLinkRef = useRef(null);

  const createPaypalOrder = useCallback(async () => {
    if (Object.keys(errors).length > 0) return undefined;
    const payload = {
      items: itemsPayload,
      customer,
      shippingAddress,
      returnUrl: "https://pnpartstudio.com/order/success",
      cancelUrl: "https://pnpartstudio.com/order/cancel"
    };
    try {
      const { data } = await axios.post(
        api('/paypal/create-order'),
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      approvalLinkRef.current = data?.approvalLink || null;
      return data?.id;
    } catch (err) {
      console.error('Create order failed:', err);
      throw err;
    }
  }, [errors, itemsPayload, customer, shippingAddress]);

  const onApprovePaypal = useCallback(async (data) => {
    try {
      const payload = { orderId: data.orderID };
      const res = await axios.post(
        api('/paypal/capture-order'),
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const orderId = res?.data?.id || data.orderID || 'ODR-UNKNOWN';
      navigate(`/order/success?orderId=${encodeURIComponent(orderId)}`, { replace: true });
    } catch (err) {
      console.error('Capture failed:', err);
      alert('Payment capture failed. Please contact support.');
    }
  }, [navigate]);

  const onErrorPaypal = useCallback((err) => {
    console.error('PayPal error:', err);
    const msg = String(err?.message || err || '').toLowerCase();
    if (msg.includes('global_session_not_found') && approvalLinkRef.current) {
      window.location.href = approvalLinkRef.current;
      return;
    }
    alert('PayPal error. Please try again.');
  }, []);

  const onCancelPaypal = useCallback(() => {}, []);
  const paypalKey = `pp-${total}-USD`;

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f1efef' }}>
      <div className="container py-4 py-lg-5">
        <div className="mb-4">
          <h1 className="fw-bold h3 mb-1" style={{ color: '#000' }}>Checkout</h1>
          <p className="mb-0" style={{ color: '#000' }}>Secure payment and fast delivery</p>
        </div>
        <div className="row g-4 g-lg-5">
          <div className="col-12 col-lg-7">
            <form id="checkoutForm" noValidate onSubmit={onSubmit} className="needs-validation">
              <div className="card border-0 shadow-sm rounded-4 mb-3" style={{ background: '#fff', color: '#000' }}>
                <div className="card-body">
                  <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ color: '#000' }}>
                    <Truck size={18} /> Shipping address
                  </h5>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="firstName">First name</label>
                      <input
                        id="firstName"
                        name="firstName"
                        autoComplete="given-name"
                        type="text"
                        className={`form-control ${touched.firstName && errors.firstName ? 'is-invalid' : ''}`}
                        value={form.firstName}
                        onChange={(e) => setField('firstName', e.target.value)}
                        onBlur={onBlur}
                        required
                      />
                      <div className="invalid-feedback">First name is required</div>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="lastName">Last name</label>
                      <input
                        id="lastName"
                        name="lastName"
                        autoComplete="family-name"
                        type="text"
                        className={`form-control ${touched.lastName && errors.lastName ? 'is-invalid' : ''}`}
                        value={form.lastName}
                        onChange={(e) => setField('lastName', e.target.value)}
                        onBlur={onBlur}
                        required
                      />
                      <div className="invalid-feedback">Last name is required</div>
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="email">Email</label>
                      <input
                        id="email"
                        name="email"
                        autoComplete="email"
                        type="email"
                        className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                        value={form.email}
                        onChange={(e) => setField('email', e.target.value)}
                        onBlur={onBlur}
                        required
                      />
                      <div className="invalid-feedback">{errors.email || 'Valid email required'}</div>
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="phone">Phone (optional)</label>
                      <input
                        id="phone"
                        name="phone"
                        autoComplete="tel"
                        type="tel"
                        className={`form-control ${touched.phone && errors.phone ? 'is-invalid' : ''}`}
                        value={form.phone}
                        onChange={(e) => setField('phone', e.target.value)}
                        onBlur={onBlur}
                        placeholder="+1 555 555 5555"
                      />
                      <div className="invalid-feedback">{errors.phone}</div>
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="address1">Address line 1</label>
                      <input
                        id="address1"
                        name="address1"
                        autoComplete="address-line1"
                        type="text"
                        className={`form-control ${touched.address1 && errors.address1 ? 'is-invalid' : ''}`}
                        value={form.address1}
                        onChange={(e) => setField('address1', e.target.value)}
                        onBlur={onBlur}
                        required
                      />
                      <div className="invalid-feedback">Address is required</div>
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="address2">Address line 2 (optional)</label>
                      <input
                        id="address2"
                        name="address2"
                        autoComplete="address-line2"
                        type="text"
                        className="form-control"
                        value={form.address2}
                        onChange={(e) => setField('address2', e.target.value)}
                        onBlur={onBlur}
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label" htmlFor="country">Country</label>
                      <select
                        id="country"
                        name="country"
                        autoComplete="country"
                        className="form-select"
                        value={form.country}
                        onChange={(e) => setField('country', e.target.value)}>
                        <option value="US">United States</option>
                        <option value="IN">India</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AE">UAE</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" htmlFor="state">State</label>
                      <input
                        id="state"
                        name="state"
                        autoComplete="address-level1"
                        type="text"
                        className={`form-control ${touched.state && errors.state ? 'is-invalid' : ''}`}
                        value={form.state}
                        onChange={(e) => setField('state', e.target.value)}
                        onBlur={onBlur}
                        required
                      />
                      <div className="invalid-feedback">State is required</div>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label" htmlFor="city">City</label>
                      <input
                        id="city"
                        name="city"
                        autoComplete="address-level2"
                        type="text"
                        className={`form-control ${touched.city && errors.city ? 'is-invalid' : ''}`}
                        value={form.city}
                        onChange={(e) => setField('city', e.target.value)}
                        onBlur={onBlur}
                        required
                      />
                      <div className="invalid-feedback">City is required</div>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label" htmlFor="zip">ZIP</label>
                      <input
                        id="zip"
                        name="zip"
                        autoComplete="postal-code"
                        type="text"
                        className={`form-control ${touched.zip && errors.zip ? 'is-invalid' : ''}`}
                        value={form.zip}
                        onChange={(e) => setField('zip', e.target.value)}
                        onBlur={onBlur}
                        required
                      />
                      <div className="invalid-feedback">ZIP is required</div>
                    </div>
                  </div>
                  <div className="form-check mt-3">
                    <input
                      id="sameAsShipping"
                      name="sameAsShipping"
                      className="form-check-input"
                      type="checkbox"
                      checked={form.sameAsShipping}
                      onChange={(e) => setField('sameAsShipping', e.target.checked)} />
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
                      id="pm-cod"
                      name="paymentMethod"
                      className="form-check-input"
                      type="radio"
                      checked={form.paymentMethod === 'cod'}
                      onChange={() => setField('paymentMethod', 'cod')} />
                    <label className="form-check-label" htmlFor="pm-cod">
                      Cash on Delivery (COD)
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      id="pm-paypal"
                      name="paymentMethod"
                      className="form-check-input"
                      type="radio"
                      checked={form.paymentMethod === 'paypal'}
                      onChange={() => setField('paymentMethod', 'paypal')}
                      disabled={items.length === 0} />
                    <label className="form-check-label" htmlFor="pm-paypal">
                      PayPal
                    </label>
                  </div>
                  {form.paymentMethod === 'paypal' ? (
                    <div className="mb-0">
                      {hasClient ? (
                        <PayPalButtons
                          key={paypalKey}
                          style={{ layout: 'vertical' }}
                          createOrder={createPaypalOrder}
                          onApprove={onApprovePaypal}
                          onError={onErrorPaypal}
                          onCancel={onCancelPaypal}
                          disabled={items.length === 0 || Object.keys(errors).length > 0}
                        />
                      ) : (
                        <div className="mono-alert small">
                          PayPal is unavailable: missing client ID.
                        </div>
                      )}
                      <div className="mono-alert d-flex align-items-center gap-2 mb-0 mt-2">
                        <ShieldCheck size={18} />
                        <div className="small mb-0" style={{ color: '#000' }}>
                          Pay securely with PayPal; capture occurs immediately after approval.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mono-alert d-flex align-items-center gap-2 mb-0">
                      <ShieldCheck size={18} />
                      <div className="small mb-0" style={{ color: '#000' }}>
                        Select PayPal to pay now, or place a COD order.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {form.paymentMethod === 'cod' && (
                <div className="d-grid mt-3">
                  <FancyButton
                    as="button"
                    type="submit"
                    form="checkoutForm"
                    className="fancy-sm py-3"
                    disabled={submitting || items.length === 0}>
                    {submitting ? 'Placing order...' : `Place order • ${fmtUSD.format(total)}`}
                  </FancyButton>
                </div>
              )}
            </form>
          </div>
          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 mb-3" style={{ background: '#fff', color: '#000' }}>
              <div className="card-body">
                <h5 className="fw-semibold mb-3" style={{ color: '#000' }}>Order summary</h5>
                {items.length === 0 ? (
                  <p className="mb-0" style={{ color: '#000' }}>No items in cart.</p>
                ) : (
                  <div className="vstack gap-3">
                    {items.map(it => (
                      <div key={it.id} className="d-flex align-items-center">
                        <img
                          src={getCover(it) || FALLBACK_IMG}
                          alt={it.title}
                          className="rounded me-3 object-fit-cover"
                          style={{ width: 56, height: 56, border: '1px solid #000' }}
                          onError={handleImgError}
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
            <div className="card border-0 shadow-sm rounded-4" style={{ background: '#fff', color: '#000' }}>
              <div className="card-body">
                <h6 className="fw-semibold mb-2 d-flex align-items-center gap-2" style={{ color: '#000' }}>
                  <Tag size={16} /> Apply promo code
                </h6>
                <form onSubmit={applyPromo} className="d-flex gap-2">
                  <input
                    type="text"
                    id="promo"
                    name="promo"
                    autoComplete="off"
                    className="form-control"
                    placeholder="Enter code"
                    value={form.promo}
                    onChange={(e) => setField('promo', e.target.value.toUpperCase())}
                  />
                  <FancyButton as="button" type="submit" className="fancy-sm d-inline-flex align-items-center gap-2">
                    <Percent size={16} />
                    Apply
                  </FancyButton>
                </form>
                {promoMsg && <div className="small mt-2" style={{ color: '#000' }}>{promoMsg}</div>}
              </div>
            </div>
          </div>
        </div>
        <style>{`
          .form-control:focus,
          .form-select:focus { border-color: #000 !important; box-shadow: none !important; }
          .form-check-input { accent-color: #000; }
          .form-control.is-invalid,
          .was-validated .form-control:invalid { border-color: #000 !important; background-image: none !important; }
          .invalid-feedback { color: #000 !important; }
          .mono-alert { border: 1px solid #000; background: #fff; color: #000; border-radius: 0.5rem; padding: 0.5rem 0.75rem; }
        `}</style>
      </div>
    </div>
  );
}
