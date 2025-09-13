// src/pages/ProductViewPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Share2, Star, Ruler, Calendar, Palette as PaletteIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProduct, listProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import FancyButton from '../components/FancyButton';

// USD currency formatter (renders like "$1,234.56")
const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const ProductViewPage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { state, dispatch } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Load product by idOrSlug via API
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) { setProduct(null); return; }
      try {
        setLoading(true); setErr('');
        const p = await getProduct(id);
        if (!cancelled) {
          setProduct(p?.id ? p : null);
          setSelectedImageIndex(0);
        }
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || 'Failed to load product';
        if (!cancelled) { setErr(msg); setProduct(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  // Related via API: same category, exclude self, limit 4
  const [related, setRelated] = useState([]);
  useEffect(() => {
    let cancelled = false;
    async function loadRelated() {
      if (!product?.category) { setRelated([]); return; }
      try {
        const { items } = await listProducts({ category: product.category, limit: 8, published: true });
        const trimmed = items.filter((p) => p.id !== product.id).slice(0, 4);
        if (!cancelled) setRelated(trimmed);
      } catch {
        if (!cancelled) setRelated([]);
      }
    }
    loadRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.category, product?.id]);

  const images = product
    ? (Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []))
    : [];

  const addToCart = () => {
    if (!product?.inStock) return;
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity
      }
    });
  };

  const isWishlisted = product
    ? (state?.wishlist || []).some((w) => w.id === product.id)
    : false;

  const toggleWishlist = () => {
    if (!product) return;
    dispatch({
      type: 'WISHLIST_TOGGLE',
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category
      }
    });
  };

  // Loading / error / not found
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f1efef' }}>
        <div className="text-center p-4">
          <div className="spinner-border mb-3" role="status" />
          <p className="mb-0" style={{ color: '#000' }}>Loading artwork…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f1efef' }}>
        <div className="text-center p-4">
          <div className="display-3 mb-3">🎨</div>
          <h2 className="fw-bold mb-2" style={{ color: '#000' }}>Artwork not found</h2>
          <p className="mb-4" style={{ color: '#000' }}>{err || 'The artwork being searched for doesn’t exist or has been moved.'}</p>
          <FancyButton to="/shop" className="fancy-sm">Browse All Artworks</FancyButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f1efef' }}>
      <div className="container py-4 py-lg-5">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/shop" className="text-decoration-none">Shop</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{product.title}</li>
          </ol>
        </nav>

        <div className="row g-4 g-lg-5 mb-4">
          {/* Gallery */}
          <div className="col-12 col-lg-6">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card border-0 shadow rounded-4 overflow-hidden" style={{ background: '#fff', color: '#000' }}>
              <div className="ratio ratio-1x1">
                <img src={images[selectedImageIndex]} alt={`${product.title} image`} className="w-100 h-100 object-fit-cover" />
              </div>
            </motion.div>
            {images.length > 1 && (
              <div className="d-flex gap-2 mt-3 overflow-auto pb-1">
                {images.map((img, idx) => {
                  const active = selectedImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className="thumb-btn"
                      aria-label={`Thumbnail ${idx + 1}`}
                    >
                      <div className="rounded-3 overflow-hidden" style={{ width: 80, height: 80, border: active ? '3px solid #000' : '2px solid #000' }}>
                        <img src={img} alt={`${product.title} ${idx + 1}`} className="w-100 h-100 object-fit-cover" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="col-12 col-lg-6">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <span className="mono-badge mb-3">{product.category}</span>
              <h1 className="fw-bold display-6 mb-2" style={{ color: '#000' }}>{product.title}</h1>

              <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
                <div className="fw-bold" style={{ fontSize: 28, color: '#000' }}>{fmtUSD.format(product.price)}</div>
                <div className="d-flex align-items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={18} color="#000000" fill="#000000" className="me-1" />
                  ))}
                  <span className="small ms-2" style={{ color: '#000' }}>(4.9) • 24 reviews</span>
                </div>
              </div>

              <p className="lead mb-4" style={{ lineHeight: 1.6, color: '#000' }}>{product.description}</p>

              <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ background: '#fff', color: '#000' }}>
                <div className="card-body">
                  <h3 className="h6 fw-semibold mb-3" style={{ color: '#000' }}>Artwork Details</h3>
                  <div className="row g-3">
                    <div className="col-12 col-sm-4 d-flex align-items-center gap-2">
                      <div className="mono-circle">
                        <Ruler size={18} />
                      </div>
                      <div>
                        <div className="small" style={{ color: '#000' }}>Dimensions</div>
                        <div className="fw-medium" style={{ color: '#000' }}>{product.dimensions}</div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-4 d-flex align-items-center gap-2">
                      <div className="mono-circle">
                        <PaletteIcon size={18} />
                      </div>
                      <div>
                        <div className="small" style={{ color: '#000' }}>Medium</div>
                        <div className="fw-medium" style={{ color: '#000' }}>{product.medium}</div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-4 d-flex align-items-center gap-2">
                      <div className="mono-circle">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div className="small" style={{ color: '#000' }}>Year</div>
                        <div className="fw-medium" style={{ color: '#000' }}>{product.year}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="vstack gap-3">
                <div className="d-flex align-items-center gap-3">
                  <span className="fw-medium" style={{ color: '#000' }}>Quantity:</span>
                  <div className="d-inline-flex align-items-center gap-2">
                    <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="mono-icon-btn">−</button>
                    <span className="fw-medium text-center" style={{ width: 36, color: '#000' }}>{quantity}</span>
                    <button type="button" onClick={() => setQuantity((q) => q + 1)} className="mono-icon-btn">+</button>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <FancyButton as="button" type="button" className="fancy-sm flex-grow-1" onClick={addToCart} disabled={!product.inStock}>
                    <ShoppingCart size={18} />
                    Add to Cart
                  </FancyButton>

                  <button
                    type="button"
                    onClick={toggleWishlist}
                    className={`mono-square-btn ${isWishlisted ? 'active' : ''}`}
                    aria-label="Toggle wishlist"
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={20} />
                  </button>

                  <button
                    type="button"
                    className="mono-square-btn"
                    aria-label="Share"
                    title="Copy product link"
                    onClick={() => {
                      const url = window.location.href;
                      if (navigator.clipboard?.writeText) {
                        navigator.clipboard.writeText(url);
                      }
                    }}
                  >
                    <Share2 size={20} />
                  </button>
                </div>

                <div className="mono-alert mb-0">
                  <div className="fw-medium mb-1" style={{ color: '#000' }}>{product.inStock ? 'In Stock - Ready to Ship' : 'Currently Unavailable'}</div>
                  {product.inStock && <div className="small mb-0" style={{ color: '#000' }}>Ships within 2–3 business days</div>}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="pb-2">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="fw-bold h4 mb-0" style={{ color: '#000' }}>Related Artworks</h2>
              <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="text-decoration-none fw-medium" style={{ color: '#000' }}>
                View all in {product.category}
              </Link>
            </div>
            <div className="row g-3 g-lg-4">
              {related.map((rp, idx) => (
                <motion.div key={rp.id} className="col-12 col-md-6 col-lg-3" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.05 }} viewport={{ once: true }}>
                  <ProductCard product={rp} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Local monochrome styles + focus-visible */}
      <style>{`
        .thumb-btn {
          background: transparent; border: 0; padding: 0; flex: 0 0 auto; cursor: pointer;
        }
        .thumb-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        .thumb-btn:focus { outline: 2px solid #000; outline-offset: 2px; }

        .mono-badge {
          display: inline-block;
          padding: 6px 12px;
          border: 1px solid #000;
          border-radius: 999px;
          background: #fff;
          color: #000;
          font-weight: 600;
        }

        .mono-circle {
          width: 40px; height: 40px; border-radius: 50%;
          background: #fff; color: #000; border: 1px solid #000;
          display: inline-flex; align-items: center; justify-content: center;
        }

        .mono-icon-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid #000;
          background: #fff;
          color: #000;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background-color 160ms ease, color 160ms ease, transform 120ms ease, box-shadow 120ms ease;
        }
        .mono-icon-btn:hover { background: #000; color: #fff; }
        .mono-icon-btn:active { transform: scale(0.98); }
        .mono-icon-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .mono-icon-btn:focus { outline: 2px solid #000; outline-offset: 2px; }

        .mono-square-btn {
          width: 56px; height: 56px;
          border-radius: 12px;
          border: 2px solid #000;
          background: #fff;
          color: #000;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background-color 160ms ease, color 160ms ease, transform 120ms ease, box-shadow 120ms ease;
        }
        .mono-square-btn:hover { background: #000; color: #fff; }
        .mono-square-btn.active { background: #000; color: #fff; }
        .mono-square-btn:active { transform: scale(0.98); }
        .mono-square-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .mono-square-btn:focus { outline: 2px solid #000; outline-offset: 2px; }

        .mono-alert {
          border: 1px solid #000;
          background: #fff;
          color: #000;
          border-radius: 12px;
          padding: 12px 14px;
        }
      `}</style>
    </div>
  );
};

export default ProductViewPage;
