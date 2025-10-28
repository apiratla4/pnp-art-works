import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatUSD } from '../utils/currency';

// Utility: description truncation
function truncateWords(desc = '', n = 10) {
  if (!desc) return '';
  const words = desc.trim().split(/\s+/);
  if (words.length <= n) return desc;
  return words.slice(0, n).join(' ') + ' ...';
}

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

  const addToCart = () => {
    if (!product?.inStock) return;
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        image: cover,
        category: product.category,
        subcategory: product.subcategory,
        subsubcategory: product.subsubcategory,
        color: product.color,
        description: product.description
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
        image: cover,
        category: product.category,
        subcategory: product.subcategory,
        subsubcategory: product.subsubcategory,
        color: product.color
      }
    });
  };

  return (
    <motion.article
      className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
      style={{ background: '#fff', color: '#000' }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="position-relative">
        {/* 1:1 thumbnail */}
        <div className="ratio ratio-1x1">
          <img
            src={cover}
            alt={`${product.title} thumbnail`}
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
            loading="lazy"
            decoding="async"
            onError={handleImgError}
          />
        </div>

        {/* Main Category/Status */}
        <span className="mono-badge position-absolute top-0 start-0 m-2 rounded-pill">
          {product.category}
        </span>
        {product.inStock ? (
          product.featured && (
            <span className="mono-badge position-absolute top-0 end-0 m-2 rounded-pill">
              Featured
            </span>
          )
        ) : (
          <span className="mono-badge position-absolute top-0 end-0 m-2 rounded-pill">
            Sold Out
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={toggleWishlist}
          className={`wish-btn position-absolute ${isWishlisted ? 'active' : ''}`}
          style={{ right: 8, bottom: 8 }}
        >
          <Heart size={18} />
        </button>
      </div>

      <div className="card-body d-flex flex-column" style={{ color: '#000' }}>
        <h3 className="h6 fw-semibold mb-1 line-clamp-2" style={{ color: '#000' }}>
          {product.title}
        </h3>
        {/* Category hierarchy */}
        <div className="small mb-2" style={{ color: '#000' }}>
          {product.category}
          {product.subcategory && ` • ${product.subcategory}`}
          {product.subsubcategory && ` • ${product.subsubcategory}`}
        </div>
        {/* 10-word truncated description */}
        <p className="small mb-3 line-clamp-2" style={{ color: '#000' }}>
          {truncateWords(product.description, 10)}
        </p>

        <div className="mt-auto d-flex align-items-center justify-content-between">
          <div className="fw-bold" style={{ color: '#000' }}>
            {formatUSD(Number(product.price || 0))}
          </div>
          <div className="d-flex gap-2">
            <motion.button
              whileHover={{ scale: product.inStock ? 1.03 : 1 }}
              whileTap={{ scale: product.inStock ? 0.98 : 1 }}
              type="button"
              onClick={addToCart}
              disabled={!product.inStock}
              className="mono-btn mono-btn-sm rounded-pill d-inline-flex align-items-center gap-1"
              title={product.inStock ? 'Add to cart' : 'Out of stock'}
            >
              <ShoppingCart size={16} />
              <span>Add</span>
            </motion.button>
            <Link
              to={`/product-details?id=${product.id}`}
              className="mono-btn mono-btn-sm rounded-pill text-decoration-none"
            >
              View
            </Link>
          </div>
        </div>
      </div>
      {/* Styles unchanged */}
      <style>{`
        .mono-badge {
          display: inline-block;
          padding: 6px 10px;
          border: 1px solid #000;
          border-radius: 999px;
          background: #fff;
          color: #000;
          font-weight: 700;
        }
        .wish-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1px solid #000;
          background: #fff;
          color: #000;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
        }
        .wish-btn:hover { background: #000; color: #fff; }
        .wish-btn.active { background: #000; color: #fff; }
        .wish-btn:active { transform: scale(0.98); }
        .wish-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .wish-btn:focus { outline: 2px solid #000; outline-offset: 2px; }
        .mono-btn {
          border: 1px solid #000; background: #fff; color: #000; padding: 8px 12px; font-weight: 700; border-radius: 8px;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
          white-space: nowrap;
        }
        .mono-btn:hover { background: #000; color: #fff; }
        .mono-btn:active { transform: scale(0.98); }
        .mono-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .mono-btn:focus { outline: 2px solid #000; outline-offset: 2px; }
        .mono-btn-sm { padding: 6px 10px; border-radius: 999px; }
      `}</style>
    </motion.article>
  );
};

export default ProductCard;
