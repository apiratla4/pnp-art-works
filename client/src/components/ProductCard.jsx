import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
      className="h-full rounded-3xl backdrop-blur-xl bg-white/70 border border-black/10 shadow-xl overflow-hidden flex flex-col transition-all"
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
        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full border border-black bg-white text-black shadow-sm select-none">
          {product.category}
        </span>
        {/* Featured / Sold Out Badge */}
        {product.inStock ? (
          product.featured && (
            <span className="absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full border border-black bg-white text-black shadow-sm select-none">
              Featured
            </span>
          )
        ) : (
          <span className="absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full border border-black bg-white text-black shadow-sm select-none">
            Sold Out
          </span>
        )}
        {/* Wishlist Button */}
        <button
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={toggleWishlist}
          className={`absolute right-3 bottom-3 w-10 h-10 rounded-full border border-black flex items-center justify-center shadow transition-colors
            ${isWishlisted ? 'bg-black text-white' : 'bg-white text-black'}
            hover:bg-black hover:text-white`}
        >
          <Heart size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-extrabold text-lg mb-1 line-clamp-2 text-black tracking-tight">{product.title}</h3>
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

        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="font-bold text-black flex flex-col text-base leading-tight">
            {typeof product.salePrice === "number" && product.salePrice !== null ? (
              <>
                <span className="text-xs line-through text-gray-400">{formatUSD(Number(product.price || 0))}</span>
                <span className="text-[1.09em]">{formatUSD(Number(product.salePrice))}</span>
              </>
            ) : (
              <span className="text-[1.07em]">{formatUSD(Number(product.price || 0))}</span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {/* Quantity selector for kolam products */}
            {isKolamMinQty(product.subsubcategory) && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-black flex items-center justify-center text-black bg-white hover:bg-black hover:text-white transition-all"
                  onClick={() => setQty(q => Math.max(MIN_KOLAM_QTY, q - 1))}
                  disabled={qty <= MIN_KOLAM_QTY}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="mx-1 font-bold">{qty}</span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-black flex items-center justify-center text-black bg-white hover:bg-black hover:text-white transition-all"
                  onClick={() => setQty(q => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={addToCart}
              disabled={!product.inStock}
              className={`px-5 py-2 rounded-full border font-bold text-xs flex items-center gap-1 transition-colors
                ${product.inStock
                  ? 'bg-black text-white border-black hover:bg-white hover:text-black'
                  : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                }`}
              title={product.inStock ? 'Add to cart' : 'Out of stock'}
            >
              <ShoppingCart size={16} />
              <span>Add</span>
            </button>
            <Link
              to={`/product-details?id=${product.id}`}
              className="px-5 py-2 rounded-full border font-bold text-xs text-black bg-white border-black hover:bg-black hover:text-white transition-colors"
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
