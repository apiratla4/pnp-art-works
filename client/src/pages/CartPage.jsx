// src/pages/CartPage.jsx (Monochrome + Fancy buttons)
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Minus, X, ShoppingBag, ArrowLeft, Gift, Truck, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import FancyButton from '../components/FancyButton';

const CartPage = () => {
  const { state, dispatch, totalPrice, totalItems } = useCart();

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const shippingCost = totalPrice > 100 ? 0 : 15;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shippingCost + tax;

  // Empty state
  if (state.items.length === 0) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: '#f1efef' }}
      >
        <div className="text-center container" style={{ maxWidth: 520 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
            style={{ width: 128, height: 128, background: '#ffffff', border: '2px solid #000', color: '#000' }}
          >
            <ShoppingBag size={64} />
          </motion.div>

          <h2 className="fw-bold mb-3" style={{ color: '#000' }}>Your cart is empty</h2>
          <p className="mb-4" style={{ color: '#000' }}>
            Looks like no beautiful artworks have been added yet. Explore the collection and find a favorite.
          </p>

          <FancyButton to="/shop" className="fancy-sm">
            Start Shopping
          </FancyButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f1efef' }}>
      <div className="container py-4 py-lg-5">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-1" style={{ color: '#000' }}>Shopping Cart</h1>
            <p className="mb-0" style={{ color: '#000' }}>
              {totalItems} item{totalItems !== 1 ? 's' : ''} in the cart
            </p>
          </div>

          <Link
            to="/shop"
            className="d-inline-flex align-items-center gap-2 text-decoration-none"
            style={{ color: '#000' }}
          >
            <ArrowLeft size={18} />
            <span className="fw-medium">Continue Shopping</span>
          </Link>
        </div>

        <div className="row g-4">
          {/* Cart Items + Benefits */}
          <div className="col-lg-8">
            {/* Items card */}
            <div className="card shadow-sm border-0 rounded-4 mb-4" style={{ color: '#000', background: '#fff' }}>
              <div className="card-header bg-white border-0 p-4 d-flex align-items-center justify-content-between" style={{ color: '#000' }}>
                <h2 className="h5 fw-semibold mb-0">Your Items</h2>
                <button
                  onClick={clearCart}
                  className="cart-link-btn"
                  type="button"
                >
                  Clear Cart
                </button>
              </div>

              <div className="list-group list-group-flush">
                {state.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="list-group-item p-4"
                    style={{ color: '#000', background: '#fff' }}
                  >
                    <div className="d-flex gap-3">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="rounded-3 object-fit-cover"
                          style={{ width: 96, height: 96, border: '1px solid #000' }}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h3 className="h6 fw-semibold mb-1" style={{ color: '#000' }}>{item.title}</h3>
                            <div className="small mb-2" style={{ color: '#000' }}>{item.category}</div>
                            <div className="fs-5 fw-bold" style={{ color: '#000' }}>${item.price}</div>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="cart-icon-btn"
                            title="Remove item"
                            type="button"
                            aria-label={`Remove ${item.title}`}
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          {/* Quantity controls */}
                          <div className="d-inline-flex align-items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="cart-icon-btn"
                              title="Decrease"
                              type="button"
                              aria-label={`Decrease quantity of ${item.title}`}
                            >
                              <Minus size={16} />
                            </button>

                            <span className="fw-medium" style={{ minWidth: 32, textAlign: 'center', color: '#000' }}>
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="cart-icon-btn"
                              title="Increase"
                              type="button"
                              aria-label={`Increase quantity of ${item.title}`}
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="fw-bold" style={{ color: '#000' }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <div className="card h-100 text-center shadow-sm border-0 rounded-4" style={{ background: '#fff', color: '#000' }}>
                  <div className="card-body">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{ width: 48, height: 48, background: '#ffffff', color: '#000', border: '1px solid #000' }}
                    >
                      <Truck size={22} />
                    </div>
                    <h3 className="h6 fw-semibold mb-1" style={{ color: '#000' }}>Free Shipping</h3>
                    <p className="small mb-0" style={{ color: '#000' }}>On orders over $100</p>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="card h-100 text-center shadow-sm border-0 rounded-4" style={{ background: '#fff', color: '#000' }}>
                  <div className="card-body">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{ width: 48, height: 48, background: '#ffffff', color: '#000', border: '1px solid #000' }}
                    >
                      <Shield size={22} />
                    </div>
                    <h3 className="h6 fw-semibold mb-1" style={{ color: '#000' }}>Secure Packaging</h3>
                    <p className="small mb-0" style={{ color: '#000' }}>Art-safe materials</p>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="card h-100 text-center shadow-sm border-0 rounded-4" style={{ background: '#fff', color: '#000' }}>
                  <div className="card-body">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{ width: 48, height: 48, background: '#ffffff', color: '#000', border: '1px solid #000' }}
                    >
                      <Gift size={22} />
                    </div>
                    <h3 className="h6 fw-semibold mb-1" style={{ color: '#000' }}>Gift Wrapping</h3>
                    <p className="small mb-0" style={{ color: '#000' }}>Available at checkout</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4 p-4 sticky-top" style={{ top: '2rem', background: '#fff', color: '#000' }}>
              <h2 className="h5 fw-semibold mb-4" style={{ color: '#000' }}>Order Summary</h2>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2" style={{ color: '#000' }}>
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2" style={{ color: '#000' }}>
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                </div>

                <div className="d-flex justify-content-between mb-3" style={{ color: '#000' }}>
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                {totalPrice < 100 && (
                  <div className="mono-alert mb-3">
                    💡 Add ${(100 - totalPrice).toFixed(2)} more for free shipping!
                  </div>
                )}

                <div className="pt-3" style={{ borderTop: '1px solid #000' }}>
                  <div className="d-flex justify-content-between align-items-center" style={{ color: '#000' }}>
                    <span className="fw-bold fs-5">Total</span>
                    <span className="fw-bold fs-5">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2">
                <FancyButton to="/checkout" className="fancy-sm">
                  Proceed to Checkout
                </FancyButton>

                <FancyButton as="button" type="button" className="fancy-sm">
                  Save for Later
                </FancyButton>
              </div>

              <div className="mt-4 pt-3" style={{ borderTop: '1px solid #000' }}>
                <h3 className="h6 fw-semibold mb-3" style={{ color: '#000' }}>Accepted Payment Methods</h3>
                <div className="d-flex flex-wrap gap-2">
                  <span className="mono-badge">VISA</span>
                  <span className="mono-badge">MASTERCARD</span>
                  <span className="mono-badge">PAYPAL</span>
                  <span className="mono-badge">APPLE PAY</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Local styles for monochrome controls and focus visibility */}
        <style>{`
          .cart-icon-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: transparent;
            color: #000;
            border: 2px solid #000;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background-color 160ms ease, color 160ms ease, transform 120ms ease;
          }
          .cart-icon-btn:hover { background: #000; color: #fff; }
          .cart-icon-btn:active { transform: scale(0.96); }
          .cart-icon-btn:focus-visible {
            outline: none;
            box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
          }
          .cart-icon-btn:focus { outline: 2px solid #000; outline-offset: 2px; }

          .cart-link-btn {
            background: transparent;
            border: none;
            color: #000;
            padding: 0;
            font-weight: 600;
            cursor: pointer;
          }
          .cart-link-btn:hover { text-decoration: underline; }
          .cart-link-btn:focus-visible {
            outline: none;
            box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
          }
          .cart-link-btn:focus { outline: 2px solid #000; outline-offset: 2px; }

          .mono-badge {
            padding: 0.5rem 0.75rem;
            border: 1px solid #000;
            border-radius: 999px;
            background: #fff;
            color: #000;
            font-weight: 600;
            line-height: 1;
          }

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
};

export default CartPage;
