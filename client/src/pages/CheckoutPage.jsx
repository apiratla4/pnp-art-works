import React, { useMemo, useState, useCallback, useRef } from 'react';
import { CreditCard, Truck, ShieldCheck, Percent, Tag, Store } from 'lucide-react';
import axios from 'axios';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import FancyButton from '../components/FancyButton';

// --- Store Pickup Modal ---
function StorePickupModal({ show, onClose, onSubmit }) {
  const [fields, setFields] = useState({ fullName: '', phone: '', email: '' });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (e) => setFields(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleBlur = (e) => setTouched(t => ({ ...t, [e.target.name]: true }));
  const validate = () => {
    const e = {};
    if (!fields.fullName.trim()) e.fullName = 'Required';
    if (!fields.phone.trim()) e.phone = 'Required';
    if (fields.phone && !/^\+?[0-9 ()-]{7,}$/.test(fields.phone)) e.phone = 'Invalid phone';
    if (!fields.email.trim()) e.email = 'Required';
    if (fields.email && !/^\S+@\S+\.\S+$/.test(fields.email)) e.email = 'Invalid email';
    return e;
  };
  const errors = validate();
  const disabled = Object.keys(errors).length > 0 || loading;

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white p-7 rounded-2xl shadow-lg w-full max-w-lg relative">
        <button className="absolute top-2 right-3 text-xl font-bold" onClick={onClose}>&times;</button>
        <h3 className="font-bold text-lg mb-3">Store Pickup Details</h3>
        <form onSubmit={e => {
          e.preventDefault();
          setTouched({ fullName: true, phone: true, email: true });
          setErr("");
          if (Object.keys(validate()).length > 0) return;
          setLoading(true);
          Promise.resolve(onSubmit(fields))
            .then(onClose)
            .catch(e => setErr(e?.message || "Failed"))
            .finally(() => setLoading(false));
        }} className="space-y-4">
          <div>
            <label className="font-semibold block mb-1">Full Name</label>
            <input
              name="fullName"
              className={`w-full border rounded px-3 py-2 ${touched.fullName && errors.fullName ? "border-red-500" : "border-gray-300"}`}
              value={fields.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
            />
            {touched.fullName && errors.fullName && <div className="text-red-600 text-xs">{errors.fullName}</div>}
          </div>
          <div>
            <label className="font-semibold block mb-1">Phone</label>
            <input
              name="phone"
              className={`w-full border rounded px-3 py-2 ${touched.phone && errors.phone ? "border-red-500" : "border-gray-300"}`}
              value={fields.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              placeholder="+1 555 555 5555"
            />
            {touched.phone && errors.phone && <div className="text-red-600 text-xs">{errors.phone}</div>}
          </div>
          <div>
            <label className="font-semibold block mb-1">Email</label>
            <input
              name="email"
              type="email"
              className={`w-full border rounded px-3 py-2 ${touched.email && errors.email ? "border-red-500" : "border-gray-300"}`}
              value={fields.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
            />
            {touched.email && errors.email && <div className="text-red-600 text-xs">{errors.email}</div>}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button type="submit" disabled={disabled} className="bg-black text-white px-5 py-2 rounded font-bold hover:bg-gray-900 disabled:opacity-60">{loading ? "Placing..." : "Confirm Pickup"}</button>
            <button type="button" className="px-5 py-2 rounded border" onClick={onClose} disabled={loading}>Cancel</button>
          </div>
          {err && <div className="text-red-600">{err}</div>}
        </form>
      </div>
    </div>
  );
}

// --- CheckoutPage component ---
const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const api = (path) => `${API_ORIGIN}/api${path}`;
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const hasPayPalClient = typeof PAYPAL_CLIENT_ID === 'string' && PAYPAL_CLIENT_ID.trim().length > 0;
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
const getUnitPrice = (it) =>
  typeof it.salePrice === "number" && it.salePrice !== null && it.salePrice < it.price
    ? it.salePrice
    : it.price;

const SHIPPING_THRESHOLD = 100;
const SHIPPING_FEE = 15;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { state, clearCart } = useCart();
  const items = state.items || [];

  const [coupon, setCoupon] = useState({ code: '', percent: 0, status: '' });
  const [promoMsg, setPromoMsg] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', address1: '', address2: '',
    city: '', state: '', zip: '', country: 'US', sameAsShipping: true, promo: ''
  });
  const [touched, setTouched] = useState({});
  const [showPickup, setShowPickup] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + getUnitPrice(it) * Number(it.qty ?? it.quantity ?? 1), 0),
    [items]
  );
  const shipping = subtotal > 0 && subtotal < SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
  const discount = useMemo(
    () => Math.round(subtotal * (coupon.percent / 100) * 100) / 100,
    [subtotal, coupon.percent]
  );
  const total = Math.max(0, Math.round((subtotal + shipping - discount) * 100) / 100);

  const itemsPayload = useMemo(() => items.map(it => ({
    productId: it.id,
    name: it.name || it.title || '',
    qty: Number(it.qty ?? it.quantity ?? 1),
    price: Number(getUnitPrice(it)),
    total: Number(getUnitPrice(it)) * Number(it.qty ?? it.quantity ?? 1),
    variant: it.variant || '',
    description: it.description || '',
    image: getCover(it) || '',
    category: it.category || '',
    sku: it.sku || '',
    brand: it.brand || '',
    meta: it.meta || {}
  })), [items]);
  const setField = useCallback((name, value) => setForm((f) => ({ ...f, [name]: value })), []);
  const applyPromo = useCallback(async (e) => {
    e.preventDefault();
    const raw = form.promo.trim();
    if (!raw) {
      setPromoMsg('Enter a code'); return;
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
  const handleStorePickup = async (fields) => {
    try {
      await axios.post(api("/store-pickup-orders"), {
        fullName: fields.fullName,
        phone: fields.phone,
        email: fields.email,
        items: itemsPayload,
        total
      });
      clearCart();
      navigate("/store-pickup-success", { replace: true });
    } catch (e) {
      throw new Error("Failed to place store pickup order: " + (e?.response?.data?.error || e.message));
    }
  };

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
  const onBlur = useCallback((e) => setTouched((t) => ({ ...t, [e.target.name]: true })), []);
  const shippingAddress = useMemo(() => ({
    fullName: `${form.firstName} ${form.lastName}`.trim(),
    line1: form.address1,
    line2: form.address2,
    city: form.city,
    state: form.state,
    postalCode: form.zip,
    countryCode: form.country,
    phone: form.phone,
    email: form.email
  }), [form]);
  const billingAddress = useMemo(
    () => form.sameAsShipping
      ? { ...shippingAddress }
      : {
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        line1: form.address1,
        line2: form.address2,
        city: form.city,
        state: form.state,
        postalCode: form.zip,
        countryCode: form.country,
        phone: form.phone,
        email: form.email
      },
    [form, shippingAddress]
  );
  const totals = useMemo(() => ({
    subtotal, shipping, discount, grandTotal: total, currency: "USD"
  }), [subtotal, discount, total, shipping]);

  // PayPal logic
  const approvalLinkRef = useRef(null);
  const saveOrder = useCallback(async (raw) => {
    const orderData = {
      customer: {
        firstName: form.firstName, lastName: form.lastName, email: form.email,
      },
      items: itemsPayload, shippingAddress, billingAddress, totals,
      paymentMethod: 'paypal', ...raw
    };
    const { data } = await axios.post(api("/orders"), orderData, {
      headers: { "Content-Type": "application/json" }
    });
    return data;
  }, [form, itemsPayload, shippingAddress, billingAddress, totals]);
  const createPaypalOrder = useCallback(async () => {
    if (Object.keys(errors).length > 0) return undefined;
    try {
      const { data } = await axios.post(api("/paypal/create-order"), {
        items: itemsPayload,
        customer: {
          firstName: form.firstName, lastName: form.lastName, email: form.email
        },
        shippingAddress, billingAddress, totals,
        returnUrl: `${window.location.origin}/order/success`,
        cancelUrl: `${window.location.origin}/order/cancel`
      }, { headers: { "Content-Type": "application/json" } });
      approvalLinkRef.current = data?.approvalLink || null;
      return data?.id;
    } catch (err) {
      console.error('Create order failed:', err?.message || err);
      throw err;
    }
  }, [errors, itemsPayload, form, shippingAddress, billingAddress, totals]);
  const onApprovePaypal = useCallback(async (data) => {
    try {
      const captureRes = await axios.post(api('/paypal/capture-order'), { orderId: data.orderID }, {
        headers: { "Content-Type": "application/json" }
      });
      const orderData = {
        paypalOrderId: data.orderID, status: 'paid', paymentMethod: 'paypal',
        paypalCaptureResponse: captureRes.data
      };
      const saved = await saveOrder(orderData);
      const referenceId = saved?.referenceId || saved?.orderId || data.orderID || "ODR-UNKNOWN";
      sessionStorage.setItem("lastOrderId", referenceId);
      clearCart();
      navigate(`/order/success?orderId=${encodeURIComponent(referenceId)}`, { replace: true });
    } catch (err) {
      console.error('Order creation failed:', err);
      alert('Payment captured but order creation failed. Please contact support.');
    }
  }, [navigate, saveOrder, clearCart]);
  const onErrorPaypal = useCallback((err) => {
    console.error('PayPal error:', err);
    const msg = String(err?.message || err || '').toLowerCase();
    if (msg.includes('global_session_not_found') && approvalLinkRef.current) {
      window.location.href = approvalLinkRef.current;
      return;
    }
    alert('PayPal error. Please try again.');
  }, []);
  const onCancelPaypal = useCallback(() => { }, []);
  const paypalKey = `pp-${total}-USD`;

  return (
    <div className="min-h-screen bg-gray-50">
      {showPickup && (
        <StorePickupModal
          show={showPickup}
          onClose={() => setShowPickup(false)}
          onSubmit={handleStorePickup}
        />
      )}
      <div className="max-w-7xl mx-auto p-2 sm:p-6">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Checkout</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form and Store Pickup in left/center */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm mb-7 p-5">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                <Truck size={18} /> Shipping & PayPal
              </h2>
              <form noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    First name<span className="text-red-600">*</span>
                  </label>
                  <input
                    name="firstName"
                    className={`w-full rounded border bg-gray-50 px-3 py-2 text-base focus:ring-2 focus:ring-black outline-none ${touched.firstName && errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                    value={form.firstName}
                    onChange={e => setField('firstName', e.target.value)}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    Last name<span className="text-red-600">*</span>
                  </label>
                  <input
                    name="lastName"
                    className={`w-full rounded border bg-gray-50 px-3 py-2 text-base focus:ring-2 focus:ring-black outline-none ${touched.lastName && errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                    value={form.lastName}
                    onChange={e => setField('lastName', e.target.value)}
                    onBlur={onBlur}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    Email<span className="text-red-600">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    className={`w-full rounded border bg-gray-50 px-3 py-2 text-base focus:ring-2 focus:ring-black outline-none ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    onBlur={onBlur}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-base focus:ring-2 focus:ring-black outline-none"
                    value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                    onBlur={onBlur}
                    placeholder="+1 555 555 5555"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    Address line 1<span className="text-red-600">*</span>
                  </label>
                  <input
                    name="address1"
                    className={`w-full rounded border bg-gray-50 px-3 py-2 text-base focus:ring-2 focus:ring-black outline-none ${touched.address1 && errors.address1 ? 'border-red-500' : 'border-gray-300'}`}
                    value={form.address1}
                    onChange={e => setField('address1', e.target.value)}
                    onBlur={onBlur}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    Address line 2
                  </label>
                  <input
                    name="address2"
                    className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-base focus:ring-2 focus:ring-black outline-none"
                    value={form.address2}
                    onChange={e => setField('address2', e.target.value)}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    Country<span className="text-red-600">*</span>
                  </label>
                  <select
                    name="country"
                    className="w-full rounded border bg-gray-50 px-3 py-2 text-base border-gray-300 focus:ring-2 focus:ring-black outline-none"
                    value={form.country}
                    onChange={e => setField('country', e.target.value)}
                  >
                    <option value="US">United States</option>
                    <option value="IN">India</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AE">UAE</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    State<span className="text-red-600">*</span>
                  </label>
                  <input
                    name="state"
                    className={`w-full rounded border bg-gray-50 px-3 py-2 text-base focus:ring-2 focus:ring-black outline-none ${touched.state && errors.state ? 'border-red-500' : 'border-gray-300'}`}
                    value={form.state}
                    onChange={e => setField('state', e.target.value)}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    City<span className="text-red-600">*</span>
                  </label>
                  <input
                    name="city"
                    className={`w-full rounded border bg-gray-50 px-3 py-2 text-base focus:ring-2 focus:ring-black outline-none ${touched.city && errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    value={form.city}
                    onChange={e => setField('city', e.target.value)}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    ZIP<span className="text-red-600">*</span>
                  </label>
                  <input
                    name="zip"
                    className={`w-full rounded border bg-gray-50 px-3 py-2 text-base focus:ring-2 focus:ring-black outline-none ${touched.zip && errors.zip ? 'border-red-500' : 'border-gray-300'}`}
                    value={form.zip}
                    onChange={e => setField('zip', e.target.value)}
                    onBlur={onBlur}
                  />
                </div>
                <div className="md:col-span-2 flex items-center mt-2">
                  <input
                    id="sameAsShipping"
                    name="sameAsShipping"
                    type="checkbox"
                    className="mr-2 h-4 w-4 border-gray-300 rounded focus:ring-black"
                    checked={form.sameAsShipping}
                    onChange={e => setField('sameAsShipping', e.target.checked)}
                  />
                  <label htmlFor="sameAsShipping" className="text-sm text-gray-700">
                    Billing address same as shipping
                  </label>
                </div>
              </form>
              {hasPayPalClient && (
                <div className="mt-6">
                  <PayPalButtons
                    key={paypalKey}
                    style={{ layout: 'vertical' }}
                    createOrder={createPaypalOrder}
                    onApprove={onApprovePaypal}
                    onError={onErrorPaypal}
                    onCancel={onCancelPaypal}
                    disabled={items.length === 0 || Object.keys(errors).length > 0}
                  />
                  <div className="border border-black bg-white rounded-lg p-3 mt-3 flex items-center gap-2 text-black">
                    <ShieldCheck size={20} />
                    <span className="text-sm">Pay securely with PayPal; capture occurs immediately after approval.</span>
                  </div>
                </div>
              )}
            </div>
            {/* Store Pickup */}
            <div className="bg-white rounded-2xl shadow-sm mb-7 p-5">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                <Store size={18} /> Store Pickup
              </h2>
              <FancyButton
                type="button"
                className="w-full py-3 text-base mb-2"
                onClick={() => setShowPickup(true)}
                disabled={items.length === 0}
              >
                Place Store Pickup Order
              </FancyButton>
            </div>
          </div>
          {/* Order summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm mb-7 p-4">
              <h2 className="font-bold text-lg mb-3">Order summary</h2>
              {items.length === 0 ? (
                <div className="text-gray-500">No items in cart.</div>
              ) : (
                <div className="flex flex-col space-y-5">
                  {items.map(it => (
                    <div key={it.id} className="flex items-center gap-4">
                      <img src={getCover(it) || FALLBACK_IMG}
                        alt={it.name || it.title}
                        className="h-16 w-16 rounded object-cover border border-black"
                        onError={handleImgError}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-base">{it.name || it.title}</div>
                        <div className="text-xs text-gray-600">{it.category} • Qty {Number(it.qty ?? it.quantity ?? 1)}</div>
                      </div>
                      <div className="font-bold text-black text-base min-w-[90px] text-right">
                        {typeof it.salePrice === "number" && it.salePrice !== null && it.salePrice < it.price ? (
                          <>
                            <span className="line-through text-gray-400 mr-2">
                              {fmtUSD.format(it.price * Number(it.qty ?? it.quantity ?? 1))}
                            </span>
                            <span>
                              {fmtUSD.format(it.salePrice * Number(it.qty ?? it.quantity ?? 1))}
                            </span>
                          </>
                        ) : (
                          fmtUSD.format(it.price * Number(it.qty ?? it.quantity ?? 1))
                        )}
                      </div>
                    </div>
                  ))}
                  <hr />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Subtotal</span>
                    <span>{fmtUSD.format(subtotal)}</span>
                  </div>
                  {shipping > 0 ? (
                    <div className="flex justify-between text-base">
                      <span>Shipping</span>
                      <span>{fmtUSD.format(shipping)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-base text-green-700">
                      <span>Shipping</span>
                      <span>FREE</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-base">
                      <span>Discount {coupon.code ? `(${coupon.code})` : ''}</span>
                      <span className="text-red-700">-{fmtUSD.format(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{fmtUSD.format(total)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-sm mb-7 p-4">
              <h4 className="font-semibold mb-1 flex items-center gap-1 text-gray-700">
                <Tag size={17} /> Apply promo code
              </h4>
              <form onSubmit={applyPromo} className="flex gap-2 mt-1">
                <input
                  type="text"
                  id="promo"
                  name="promo"
                  autoComplete="off"
                  className="grow py-2 rounded border border-gray-300 px-3 text-base focus:ring-2 focus:ring-black outline-none"
                  placeholder="Enter code"
                  value={form.promo}
                  onChange={(e) => setField('promo', e.target.value.toUpperCase())}
                />
                <button type="submit" className="flex gap-1 items-center px-4 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 transition">
                  <Percent size={16} />
                  Apply
                </button>
              </form>
              {promoMsg && <div className="text-sm text-black mt-1">{promoMsg}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
