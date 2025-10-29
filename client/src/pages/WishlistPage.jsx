import React, { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import FancyButton from "../components/FancyButton";

const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const WishlistPage = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  const wishlist = state?.wishlist || [];
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

  // Move all wishlist items to the cart and then go to /cart
  const addAllToCartAndGo = () => {
    if (!wishlist.length) return;
    wishlist.forEach(item => {
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
    });
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-[#f1efef]">
      <div className="w-full max-w-5xl mx-auto px-3 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <h1 className="font-black text-3xl flex items-center gap-3 text-black">
            <Heart size={26} strokeWidth={2.3} />
            Wishlist
          </h1>
          {hasItems && (
            <div className="text-black text-base font-semibold">
              {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} • {fmtUSD.format(total)}
            </div>
          )}
        </div>

        {!hasItems ? (
          <div className="w-full flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-3">💖</div>
            <div className="text-xl font-bold mb-2 text-black">No favorites yet</div>
            <div className="mb-6 text-black text-base max-w-md">
              Save artworks to your wishlist and return anytime to complete your collection.
            </div>
            <FancyButton to="/shop" className="fancy-sm py-3 px-8 rounded-full text-lg font-bold">
              Browse Artworks
            </FancyButton>
          </div>
        ) : (
          <div className="flex flex-col-reverse lg:flex-row gap-8">
            {/* Wishlist Items */}
            <div className="flex-1 min-w-0">
              <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <div>
                  {wishlist.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.03 }}
                      className={`flex flex-col sm:flex-row items-center gap-4 px-6 py-5 border-b last:border-0 border-black/10 hover:bg-gray-50 transition`}
                    >
                      <Link to={`/product-details?id=${item.id}`}>
                        <img
                          src={item.image}
                          alt={item.title}
                          className="rounded-lg object-cover border border-black/10 bg-white"
                          style={{ width: 72, height: 72, minWidth: 72, minHeight: 72 }}
                        />
                      </Link>
                      <div className="flex-1 w-full min-w-0 flex flex-col sm:flex-row items-center gap-0 sm:gap-5">
                        <div className="flex-1 min-w-0 w-full">
                          <Link
                            to={`/product-details?id=${item.id}`}
                            className="block text-lg font-bold text-black truncate hover:underline"
                          >
                            {item.title}
                          </Link>
                          <div className="text-sm text-gray-700">
                            {item.category} • {fmtUSD.format(Number(item.price || 0))}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 sm:mt-0 shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="fancy-sm px-4 py-2 rounded-full font-bold flex items-center gap-1 transition whitespace-nowrap"
                            onClick={() => moveToCart(item)}
                            type="button"
                          >
                            <ShoppingCart size={17} /> <span>Add to cart</span>
                          </motion.button>
                          <button
                            className="fancy-sm px-4 py-2 rounded-full font-bold flex items-center gap-1 transition whitespace-nowrap bg-white text-black border border-black/60 hover:bg-black hover:text-white"
                            onClick={() => removeFromWishlist(item.id)}
                            aria-label="Remove from wishlist"
                            type="button"
                          >
                            <Trash2 size={17} /> <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            {/* Summary Panel */}
            <div className="w-full max-w-sm shrink-0">
              <div className="bg-white shadow-lg rounded-2xl mb-4">
                <div className="p-6">
                  <div className="font-extrabold mb-3 text-xl text-black">Summary</div>
                  <div className="flex justify-between mb-2 text-black font-medium">
                    <span>Items</span>
                    <span>{wishlist.length}</span>
                  </div>
                  <div className="flex justify-between mb-7 text-black font-bold">
                    <span>Estimated total</span>
                    <span>{fmtUSD.format(total)}</span>
                  </div>
                  <FancyButton
                    as="button"
                    onClick={addAllToCartAndGo}
                    className="fancy-sm w-full py-3 px-6 rounded-full font-bold text-base mt-1"
                  >
                    Continue shopping
                  </FancyButton>
                  <div className="text-sm mt-4 text-gray-600">
                    All items will be moved to your cart for checkout.
                  </div>
                </div>
              </div>
              <div className="border border-black bg-white text-black rounded-xl px-4 py-3 text-base shadow mt-2">
                Tip: Use your wishlist as a “save for later” — items can be added to your cart anytime.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
