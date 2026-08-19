import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Minus, X, ShoppingBag, ArrowLeft, Truck, Shield, Award } from 'lucide-react';
import { useCart } from '../context/CartContext';
import FancyButton from '../components/FancyButton';

const FALLBACK_IMG = '/placeholder.png';

const getCover = (item) => {
  const single = typeof item?.image === 'string' ? item.image.trim() : '';
  if (single) return single;
  const arr = Array.isArray(item?.images) ? item.images : [];
  const first = arr.find(Boolean);
  if (!first) return '';
  if (typeof first === 'string') return first.trim();
  if (typeof first === 'object' && first !== null) {
    const url = first.secure_url || first.url || first.src || first.path || '';
    return String(url).trim();
  }
  return '';
};

const handleImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_IMG;
};

function wordLimitDesc(text, limit = 30) {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + ' ...';
}

const CartPage = () => {
  const navigate = useNavigate();
  const { state, dispatch, totalPrice, totalItems } = useCart();
  const [descExpanded, setDescExpanded] = useState({});

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const shippingCost = totalPrice > 100 ? 0 : 15;
  const finalTotal = totalPrice + shippingCost;

  const toggleDesc = (id) =>
    setDescExpanded((ex) => ({ ...ex, [id]: !ex[id] }));

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1efef]">
        <div className="text-center w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black bg-white text-black"
            style={{ width: 128, height: 128 }}
          >
            <ShoppingBag size={64} />
          </motion.div>
          <h2 className="font-black text-2xl mb-2 text-black">Your cart is empty</h2>
          <p className="mb-6 text-black text-base">
            Looks like no beautiful artworks have been added yet. Explore the collection and find a favorite.
          </p>
          <FancyButton to="/shop" className="fancy-sm py-2 px-7 rounded-full font-bold text-lg">
            Start Shopping
          </FancyButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1efef]">
      <div className="w-full max-w-6xl mx-auto px-2 md:px-5 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-7 gap-4">
          <div>
            <h1 className="font-black text-3xl md:text-4xl text-black mb-1">Shopping Cart</h1>
            <p className="text-black text-base">
              {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <Link to="/shop" className="flex items-center gap-2 text-black text-lg font-semibold hover:underline transition">
            <ArrowLeft size={20} />
            Continue Shopping
          </Link>
        </div>
        <div className="flex flex-col lg:flex-row gap-7">
          {/* Cart Items + Benefits */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">
            {/* Items card */}
            <div className="bg-white shadow-lg rounded-2xl mb-2">
              <div className="flex justify-between items-center border-b border-black/10 px-7 py-4">
                <h2 className="font-bold text-lg text-black mb-0">Your Items</h2>
                <button
                  onClick={clearCart}
                  className="font-semibold px-3 py-1 rounded-full border border-black text-black bg-white hover:bg-black hover:text-white transition text-base"
                  type="button"
                >
                  Clear Cart
                </button>
              </div>
              <div>
                {state.items.map((item, index) => {
                  const desc = item.description || '';
                  const isLong = desc.trim().split(/\s+/).length > 30;
                  // Build product details url
                  const productUrl = `/product-details?id=${item.productId || item.id}`;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.09 }}
                      className="relative px-7 py-6 flex flex-col sm:flex-row gap-4 border-b border-black/10 items-center sm:items-start"
                    >
                      {/* Remove btn */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute top-6 right-7 w-8 h-8 rounded-full border-2 border-black text-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition"
                        title="Remove item"
                        type="button"
                        aria-label={`Remove ${item.title}`}
                      >
                        <X size={18} />
                      </button>
                      {/* Image - navigates to product view */}
                      <Link to={productUrl} tabIndex={0}>
                        <img
                          src={getCover(item) || FALLBACK_IMG}
                          alt={item.title}
                          className="rounded-md border border-black/10 bg-white object-cover shrink-0 cursor-pointer"
                          style={{ width: 96, height: 96, minWidth: 96, minHeight: 96 }}
                          loading="lazy"
                          onError={handleImgError}
                        />
                      </Link>
                      {/* Details */}
                      <div className="flex-1 min-w-0 w-full flex flex-col gap-1">
                        {/* Product title also navigates to product view */}
                        <Link
                          to={productUrl}
                          tabIndex={0}
                          className="block font-bold text-black text-lg leading-tight cursor-pointer hover:underline outline-none"
                        >
                          {item.title}
                        </Link>
                        <div className="text-sm text-gray-700 mb-1">{item.category}</div>
                        {/* Price (SALE logic) */}
                        <div className="font-black text-lg text-black mb-1">
                          {typeof item.salePrice === "number" && item.salePrice !== null && item.salePrice < item.price ? (
                            <>
                              <span className="line-through text-gray-400 mr-2 text-base">
                                ${item.price.toFixed(2)}
                              </span>
                              <span>${item.salePrice.toFixed(2)}</span>
                            </>
                          ) : (
                            `$${item.price.toFixed(2)}`
                          )}
                        </div>
                        {desc && (
                          <div className="text-gray-800 text-sm mt-1">
                            {descExpanded[item.id]
                              ? desc
                              : wordLimitDesc(desc, 30)}
                            {isLong && (
                              <button
                                className="ml-2 text-blue-600 hover:underline font-medium"
                                onClick={() => toggleDesc(item.id)}
                                type="button"
                              >
                                {descExpanded[item.id] ? "Show less" : "Show more"}
                              </button>
                            )}
                          </div>
                        )}
                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border-2 border-black text-black flex items-center justify-center transition hover:bg-black hover:text-white"
                            title="Decrease"
                            aria-label={`Decrease quantity of ${item.title}`}
                            type="button"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-bold text-black text-lg w-10 text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border-2 border-black text-black flex items-center justify-center transition hover:bg-black hover:text-white"
                            title="Increase"
                            aria-label={`Increase quantity of ${item.title}`}
                            type="button"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            {/* Benefits */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white shadow rounded-xl text-center px-5 py-6 flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center border border-black rounded-full mb-3 bg-white text-black">
                  <Truck size={22} />
                </div>
                <div className="font-bold">Free Shipping</div>
                <div className="text-sm text-gray-700">On orders over $100</div>
              </div>
              <div className="bg-white shadow rounded-xl text-center px-5 py-6 flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center border border-black rounded-full mb-3 bg-white text-black">
                  <Shield size={22} />
                </div>
                <div className="font-bold">Secure Packaging</div>
                <div className="text-sm text-gray-700">Art-safe materials</div>
              </div>
              <div className="bg-white shadow rounded-xl text-center px-5 py-6 flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center border border-black rounded-full mb-3 bg-white text-black">
                  <Award size={22} />
                </div>
                <div className="font-bold">Free Pickup in Studio</div>
                <div className="text-sm text-gray-700">No Minimum Purchase Required</div>
              </div>
            </div>
          </div>
          {/* Summary Panel */}
          <div className="w-full max-w-sm shrink-0">
            <div className="bg-white shadow-xl rounded-2xl p-7 sticky top-8">
              <div className="font-black text-2xl text-black mb-2">Order Summary</div>
              <div className="flex justify-between mb-2 text-black font-medium">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 text-black font-medium">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              {totalPrice < 100 && (
                <div className="border border-black bg-white rounded-xl px-3 py-2 text-base my-3 text-black">
                  💡 Add ${(100 - totalPrice).toFixed(2)} more for free shipping!
                </div>
              )}
              <div className="border-t border-black my-3" />
              <div className="flex justify-between text-black items-center font-bold text-lg mb-4">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
              <FancyButton to="/checkout" className="w-full fancy-sm py-3 rounded-full text-base font-bold mb-2">
                Proceed to Checkout
              </FancyButton>
              <div className="pt-4 border-t border-black mt-3">
                <div className="font-bold mb-2 text-black">Accepted Payment</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 border border-black rounded-full text-sm font-semibold bg-white text-black">VISA</span>
                  <span className="px-3 py-1 border border-black rounded-full text-sm font-semibold bg-white text-black">MASTERCARD</span>
                  <span className="px-3 py-1 border border-black rounded-full text-sm font-semibold bg-white text-black">PAYPAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
