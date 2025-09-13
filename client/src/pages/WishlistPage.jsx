// src/pages/WishlistPage.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

// USD formatter
const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const WishlistPage = () => {
  const { state, dispatch } = useCart();

  const wishlist = state?.wishlist || []; // [{ id, title, price, image, category }]
  const hasItems = wishlist.length > 0;

  const total = useMemo(
    () => wishlist.reduce((sum, it) => sum + (it.price || 0), 0),
    [wishlist]
  );

  const removeFromWishlist = (id) => {
    dispatch?.({ type: "WISHLIST_REMOVE", payload: { id } });
  };

  const moveToCart = (item) => {
    dispatch?.({
      type: "ADD_ITEM",
      payload: {
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
      },
    });
    dispatch?.({ type: "WISHLIST_REMOVE", payload: { id: item.id } });
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f1efef" }}>
      <div className="container py-4 py-lg-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="fw-bold h3 mb-0 d-flex align-items-center gap-2" style={{ color: "#000" }}>
            <Heart size={22} />
            Wishlist
          </h1>
          {hasItems && (
            <div className="small" style={{ color: "#000" }}>
              {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} • {fmtUSD.format(total)}
            </div>
          )}
        </div>

        {!hasItems ? (
          <div className="text-center py-5">
            <div className="display-3 mb-2">💖</div>
            <h2 className="h5 fw-semibold mb-2" style={{ color: "#000" }}>No favorites yet</h2>
            <p className="mb-4" style={{ color: "#000" }}>
              Save artworks to the wishlist and return any time to complete the collection.
            </p>
            <Link to="/shop" className="mono-btn rounded-pill">
              Browse Artworks
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {/* List */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm rounded-4" style={{ background: "#fff", color: "#000" }}>
                <div className="card-body">
                  <div className="list-group list-group-flush">
                    {wishlist.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.03 }}
                        className="list-group-item py-3"
                        style={{ background: "#fff", color: "#000", borderColor: "#000" }}
                      >
                        <div className="d-flex align-items-center">
                          <Link to={`/product-details?id=${item.id}`} className="text-decoration-none">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="rounded object-fit-cover"
                              style={{ width: 72, height: 72, border: "1px solid #000" }}
                            />
                          </Link>

                          <div className="ms-3 flex-grow-1">
                            <Link
                              to={`/product-details?id=${item.id}`}
                              className="text-decoration-none"
                              style={{ color: "#000" }}
                            >
                              <div className="fw-semibold">{item.title}</div>
                            </Link>
                            <div className="small" style={{ color: "#000" }}>
                              {item.category} • {fmtUSD.format(Number(item.price || 0))}
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className="mono-btn mono-btn-sm rounded-pill d-inline-flex align-items-center gap-1"
                              onClick={() => moveToCart(item)}
                              type="button"
                            >
                              <ShoppingCart size={16} />
                              <span>Add to cart</span>
                            </motion.button>

                            <button
                              className="mono-btn mono-btn-sm rounded-pill d-inline-flex align-items-center gap-1"
                              onClick={() => removeFromWishlist(item.id)}
                              aria-label="Remove from wishlist"
                              type="button"
                            >
                              <Trash2 size={16} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4" style={{ background: "#fff", color: "#000" }}>
                <div className="card-body">
                  <h5 className="fw-semibold mb-3" style={{ color: "#000" }}>Summary</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small" style={{ color: "#000" }}>Items</span>
                    <span style={{ color: "#000" }}>{wishlist.length}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="small" style={{ color: "#000" }}>Estimated total</span>
                    <span className="fw-semibold" style={{ color: "#000" }}>{fmtUSD.format(total)}</span>
                  </div>

                  <Link to="/shop" className="mono-btn w-100 rounded-pill text-center">
                    Continue shopping
                  </Link>

                  <div className="small mt-3 mb-0" style={{ color: "#000" }}>
                    Moving items from wishlist adds them to the cart for checkout.
                  </div>
                </div>
              </div>

              <div className="mono-alert mt-3 mb-0">
                Tip: Use list groups for clean, actionable rows and badges for quick status labels.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Local monochrome + focus-visible */}
      <style>{`
        /* Monochrome button */
        .mono-btn {
          border: 1px solid #000;
          background: #fff;
          color: #000;
          padding: 8px 14px;
          font-weight: 700;
          border-radius: 10px;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
          white-space: nowrap;
        }
        .mono-btn:hover { background: #000; color: #fff; }
        .mono-btn:active { transform: scale(0.98); }
        .mono-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .mono-btn:focus { outline: 2px solid #000; outline-offset: 2px; }
        .mono-btn-sm { padding: 6px 10px; border-radius: 999px; }

        /* Alert */
        .mono-alert {
          border: 1px solid #000;
          background: #fff;
          color: #000;
          border-radius: 12px;
          padding: 10px 12px;
        }

        /* Links focus ring */
        a:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        a:focus { outline: 2px solid #000; outline-offset: 2px; }
      `}</style>
    </div>
  );
};

export default WishlistPage;
