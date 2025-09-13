// src/components/CartDropdown.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import FancyButton from "./FancyButton";

const CartDropdown = () => {
  const { state, dispatch, totalPrice } = useCart();

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: id });
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    }
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: "rgba(0,0,0,0.25)", zIndex: 1040 }}
            onClick={() => dispatch({ type: "CLOSE_CART" })}
            aria-label="Close cart overlay"
          />

          {/* Sidebar Cart */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="position-fixed top-0 end-0 h-100 shadow-lg"
            style={{ width: "22rem", zIndex: 1050, overflowY: "auto", backgroundColor: "#fff" }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="p-4">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ color: "#000" }}>Shopping Cart</h5>
                <button
                  onClick={() => dispatch({ type: "CLOSE_CART" })}
                  type="button"
                  className="cart-icon-btn"
                  aria-label="Close cart"
                >
                  <X size={18} />
                </button>
              </div>

              {/* If cart empty */}
              {state.items.length === 0 ? (
                <div className="text-center py-5">
                  <p className="mb-3" style={{ color: "#000" }}>Your cart is empty</p>
                  <FancyButton
                    to="/shop"
                    onClick={() => dispatch({ type: "CLOSE_CART" })}
                    className="fancy-sm"
                  >
                    Start Shopping
                  </FancyButton>
                </div>
              ) : (
                <>
                  {/* Cart items */}
                  <div className="mb-4">
                    {state.items.map((item) => (
                      <div
                        key={item.id}
                        className="d-flex align-items-center mb-3 p-2"
                        style={{ border: "1px solid #000", borderRadius: 8 }}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="rounded me-3"
                          style={{ width: 64, height: 64, objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-1" style={{ color: "#000" }}>{item.title}</h6>
                          <p className="fw-bold mb-1" style={{ color: "#000" }}>${item.price}</p>
                          <div className="d-flex align-items-center">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              type="button"
                              className="cart-icon-btn me-2"
                              aria-label={`Decrease quantity of ${item.title}`}
                            >
                              <Minus size={14} />
                            </button>
                            <span style={{ color: "#000", minWidth: 20, textAlign: "center" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              type="button"
                              className="cart-icon-btn ms-2"
                              aria-label={`Increase quantity of ${item.title}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })}
                          type="button"
                          className="cart-icon-btn ms-2"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Footer total */}
                  <div className="border-top pt-3" style={{ borderColor: "#000" }}>
                    <div className="d-flex justify-content-between mb-3" style={{ color: "#000" }}>
                      <span className="fw-bold">Total:</span>
                      <span className="fw-bold">${totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="d-grid gap-2">
                      <FancyButton
                        to="/cart"
                        onClick={() => dispatch({ type: "CLOSE_CART" })}
                        className="fancy-sm"
                      >
                        View Cart
                      </FancyButton>
                      <FancyButton
                        to="/checkout"
                        onClick={() => dispatch({ type: "CLOSE_CART" })}
                        className="fancy-sm"
                      >
                        Checkout
                      </FancyButton>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Local styles for monochrome icon buttons and focus visibility */}
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
              .cart-icon-btn:hover {
                background: #000;
                color: #fff;
              }
              .cart-icon-btn:active {
                transform: scale(0.96);
              }
              /* Keyboard focus indicator (only when appropriate) */
              .cart-icon-btn:focus-visible {
                outline: none;
                box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
              }
              .cart-icon-btn:focus {
                outline: 2px solid #000; /* fallback */
                outline-offset: 2px;
              }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDropdown;
