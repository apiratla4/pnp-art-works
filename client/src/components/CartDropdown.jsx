import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import FancyButton from "./FancyButton";

const FALLBACK_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 600 600">
       <rect width="100%" height="100%" fill="white"/>
       <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="20">No Image</text>
     </svg>`
  );

const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const getCover = (item) => {
  if (typeof item?.image === "string" && item.image.trim()) return item.image.trim();
  if (Array.isArray(item?.images) && item.images.length > 0) {
    const first = item.images.find(Boolean);
    if (typeof first === "string" && first.trim()) return first.trim();
    if (first && typeof first === "object") {
      const v = first.secure_url ?? first.url ?? first.src ?? first.path ?? "";
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  const maybe =
    item?.thumbnail ??
    item?.cover ??
    item?.photo ??
    item?.picture ??
    "";
  if (typeof maybe === "string" && maybe.trim()) return maybe.trim();
  if (maybe && typeof maybe === "object") {
    const v = maybe.secure_url ?? maybe.url ?? maybe.src ?? maybe.path ?? "";
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
};

const handleImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_SVG;
};

const getUnitPrice = (it) =>
  typeof it.salePrice === "number" && it.salePrice !== null && it.salePrice < it.price
    ? it.salePrice
    : it.price;

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
            className="fixed inset-0 bg-black/25 z-1040"
            onClick={() => dispatch({ type: "CLOSE_CART" })}
            aria-label="Close cart overlay"
          />
          {/* Sidebar Cart */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-full w-88 max-w-full bg-white/80 backdrop-blur-xl shadow-2xl z-1050 overflow-y-auto border-l border-black/10"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-bold text-lg text-black">Shopping Cart</h5>
                <button
                  onClick={() => dispatch({ type: "CLOSE_CART" })}
                  type="button"
                  aria-label="Close cart"
                  className="w-8 h-8 rounded-full border-2 border-black text-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              {/* If cart empty */}
              {state.items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="mb-4 text-black">Your cart is empty</p>
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
                  <div className="mb-6">
                    {state.items.map((item) => {
                      const url = getCover(item);
                      const safeSrc = typeof url === "string" && url ? url : FALLBACK_SVG;
                      const productUrl = `/product-details?id=${item.productId || item.id}`;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center mb-4 p-2 rounded-xl border border-black/20 bg-white/90"
                        >
                          <Link to={productUrl} tabIndex={0}>
                            <img
                              src={safeSrc}
                              alt={item.title}
                              className="rounded-lg mr-3 cursor-pointer"
                              style={{ width: 60, height: 60, objectFit: "cover" }}
                              loading="lazy"
                              onError={handleImgError}
                              title={item.title}
                            />
                          </Link>
                          <div className="grow">
                            <Link
                              to={productUrl}
                              tabIndex={0}
                              className="font-semibold text-sm mb-1 text-black block truncate hover:underline cursor-pointer"
                            >
                              {item.title}
                            </Link>
                            <div className="font-bold text-black mb-1">
                              {typeof item.salePrice === "number" && item.salePrice !== null && item.salePrice < item.price ? (
                                <>
                                  <span className="line-through text-gray-400 mr-2">{fmtUSD.format(item.price)}</span>
                                  <span>{fmtUSD.format(item.salePrice)}</span>
                                </>
                              ) : (
                                fmtUSD.format(item.price)
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                type="button"
                                aria-label={`Decrease quantity of ${item.title}`}
                                className="w-8 h-8 rounded-full border-2 border-black text-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors mr-2"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-black text-sm w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                type="button"
                                aria-label={`Increase quantity of ${item.title}`}
                                className="w-8 h-8 rounded-full border-2 border-black text-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors ml-2"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })}
                            type="button"
                            aria-label={`Remove ${item.title} from cart`}
                            className="w-8 h-8 rounded-full border-2 border-black text-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors ml-2"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {/* Footer total */}
                  <div className="border-t border-black/20 pt-4">
                    <div className="flex justify-between items-center mb-4 text-black text-lg font-bold">
                      <span>Total:</span>
                      <span>{fmtUSD.format(totalPrice)}</span>
                    </div>
                    <div className="flex flex-col gap-2">
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDropdown;
