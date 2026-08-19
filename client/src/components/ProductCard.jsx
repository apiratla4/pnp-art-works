import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatUSD } from '../utils/currency';

function truncateWords(desc = '', n = 10) {
  if (!desc) return '';
  const words = desc.trim().split(/\s+/);
  if (words.length <= n) return desc;
  return words.slice(0, n).join(' ') + ' ...';
}

const isKolamMinQty = (subsub) =>
  typeof subsub === "string" &&
  ["kolam coasters", "kolam peetham"].includes(subsub.trim().toLowerCase());

const MIN_KOLAM_QTY = 5;
const MIN_DEFAULT_QTY = 1;

const ProductCard = ({ product }) => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const isWishlisted = (state?.wishlist || []).some((w) => w.id === product.id);

  const cover = React.useMemo(() => {
    const single = typeof product?.image === 'string' ? product.image.trim() : '';
    if (single) return single;
    const arr = Array.isArray(product?.images) ? product.images : [];
    const first = arr.find(Boolean);
    if (!first) return '';
    if (typeof first === 'string') return first;
    if (typeof first === 'object' && first !== null) {
      return first.secure_url || first.url || first.src || '';
    }
    return '';
  }, [product]);

  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
           <rect width="100%" height="100%" fill="white"/>
           <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="20">No Image</text>
         </svg>`
      );
  };

  const minQty =
    isKolamMinQty(product.subsubcategory) ? MIN_KOLAM_QTY : MIN_DEFAULT_QTY;
  const [qty, setQty] = useState(minQty);

  const addToCart = () => {
    if (!product?.inStock) return;
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        salePrice: product.salePrice,
        image: cover,
        category: product.category,
        subcategory: product.subcategory,
        subsubcategory: product.subsubcategory,
        color: product.color,
        description: product.description,
        quantity: qty,
      }
    });
  };

  const toggleWishlist = () => {
    dispatch({
      type: 'WISHLIST_TOGGLE',
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        salePrice: product.salePrice,
        image: cover,
        category: product.category,
        subcategory: product.subcategory,
        subsubcategory: product.subsubcategory,
        color: product.color
      }
    });
  };

  return (
    <article
      className="h-full rounded-3xl backdrop-blur-xl bg-white/70 border border-black/10 shadow-xl overflow-hidden flex flex-col transition-all cursor-pointer"
      onClick={() => navigate(`/product-details?id=${product.id}`)}
    >
      {/* Image + Badges + Wishlist */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={cover}
          alt={`${product.title} thumbnail`}
          className="object-cover w-full h-full"
          loading="lazy"
          decoding="async"
          onError={handleImgError}
        />
        {/* Category Badge */}
        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-bold rounded-full border border-violet-300 bg-violet-50 text-violet-700 shadow-sm select-none max-w-[45%] truncate">
          {product.category}
        </span>
        {/* Featured / Sold Out Badge */}
        {product.inStock ? (
          product.featured && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-bold rounded-full border border-yellow-400 bg-yellow-50 text-yellow-700 shadow-sm select-none">
              ⭐ Featured
            </span>
          )
        ) : (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-bold rounded-full border border-red-300 bg-red-50 text-red-600 shadow-sm select-none">
            Sold Out
          </span>
        )}
        {/* Wishlist Button */}
        <button
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
          className={`absolute right-3 bottom-3 w-10 h-10 rounded-full border border-black flex items-center justify-center shadow transition-colors
            ${isWishlisted ? 'bg-black text-white' : 'bg-white text-black'}
            hover:bg-black hover:text-white`}
        >
          <Heart size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="font-extrabold text-base sm:text-lg mb-1 line-clamp-2 text-black tracking-tight">{product.title}</h3>
        <div className="text-xs mb-2 text-black/60">
          {product.category}
          {product.subcategory && ` • ${product.subcategory}`}
          {product.subsubcategory && ` • ${product.subsubcategory}`}
          {isKolamMinQty(product.subsubcategory) ||
          isKolamMinQty(product.subsubcategory) ||
          isKolamMinQty(product.subsubcategory) ? null : null}
        </div>
        <p className="text-sm mb-4 line-clamp-2 text-black/80">
          {truncateWords(product.description, 10)}
        </p>

        {/* Min Order badge if kolam */}
        {isKolamMinQty(product.subsubcategory) && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 font-bold rounded-full text-xs">
              Min Order: {MIN_KOLAM_QTY}
            </span>
          </div>
        )}

        {/* Contact for Price — inline WhatsApp CTA */}
        {product.contactForPrice && !product.donated && (() => {
          const phone = String(import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
          const msg = `Hi! I'm interested in "${product.title}". Could you please share the price?`;
          const href = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : "#";
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-3 flex items-center justify-center gap-2 w-full rounded-full border border-[#25d366] bg-[#25d366] text-white font-bold text-xs px-4 py-2 hover:bg-white hover:text-[#25d366] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
              </svg>
              Contact on WhatsApp
            </a>
          );
        })()}

        <div className="mt-auto flex items-center justify-between pt-1 gap-2">
          <div className="font-bold text-black flex flex-col text-sm sm:text-base leading-tight">
            {product.donated ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-semibold">
                🙏 Donated
              </span>
            ) : product.contactForPrice ? (
              <span className="text-xs text-gray-500 italic">Price on request</span>
            ) : typeof product.salePrice === "number" && product.salePrice !== null ? (
              <>
                <span className="text-xs line-through text-gray-400">{formatUSD(Number(product.price || 0))}</span>
                <span className="text-[1.09em]">{formatUSD(Number(product.salePrice))}</span>
              </>
            ) : (
              <span className="text-[1.07em]">{formatUSD(Number(product.price || 0))}</span>
            )}
          </div>
          <div className="flex gap-1 sm:gap-2 items-center flex-shrink-0">
            {/* Quantity selector for kolam products */}
            {isKolamMinQty(product.subsubcategory) && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-black flex items-center justify-center text-black bg-white hover:bg-black hover:text-white transition-all"
                  onClick={(e) => { e.stopPropagation(); setQty(q => Math.max(MIN_KOLAM_QTY, q - 1)); }}
                  disabled={qty <= MIN_KOLAM_QTY}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="mx-1 font-bold">{qty}</span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-black flex items-center justify-center text-black bg-white hover:bg-black hover:text-white transition-all"
                  onClick={(e) => { e.stopPropagation(); setQty(q => q + 1); }}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
            )}
            {!product.donated && !product.contactForPrice && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); addToCart(); }}
                disabled={!product.inStock}
                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border font-bold text-xs flex items-center gap-1 transition-colors
                  ${product.inStock
                    ? 'bg-black text-white border-black hover:bg-white hover:text-black'
                    : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                  }`}
                title={product.inStock ? 'Add to cart' : 'Out of stock'}
              >
                <ShoppingCart size={16} />
                <span>Add</span>
              </button>
            )}
            <Link
              to={`/product-details?id=${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border font-bold text-xs text-black bg-white border-black hover:bg-black hover:text-white transition-colors"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
