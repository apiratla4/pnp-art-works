import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart, ShoppingCart, Share2, Star, Ruler, Palette as PaletteIcon, ChevronLeft, ChevronRight
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { getProduct, listProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import FancyButton from "../components/FancyButton";

const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const FALLBACK_IMG = "/placeholder.png";
const toUrl = (entry) => {
  if (!entry) return "";
  if (typeof entry === "string") return entry.trim();
  if (typeof entry === "object") {
    const u = entry.secure_url || entry.url || entry.src || entry.path || "";
    return String(u).trim();
  }
  return "";
};

function wordLimitDesc(text, limit = 30) {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ") + " ...";
}

const ProductViewPage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { state, dispatch } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) { setProduct(null); return; }
      try {
        setLoading(true); setErr("");
        const p = await getProduct(id);
        if (!cancelled) {
          setProduct(p?.id ? p : null);
          setSelectedImageIndex(0);
        }
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Failed to load product";
        if (!cancelled) { setErr(msg); setProduct(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    setDescExpanded(false);
    return () => { cancelled = true; };
  }, [id]);

  const [related, setRelated] = useState([]);
  useEffect(() => {
    let cancelled = false;
    async function loadRelated() {
      if (!product?.category || !product?.subcategory) { setRelated([]); return; }
      try {
        const { items } = await listProducts({
          category: product.category,
          subcategory: product.subcategory,
          published: true
        });
        const trimmed = items.filter((p) => p.id !== product.id).slice(0, 4);
        if (!cancelled) setRelated(trimmed);
      } catch {
        if (!cancelled) setRelated([]);
      }
    }
    loadRelated();
  }, [product?.category, product?.subcategory, product?.id]);

  const images = useMemo(() => {
    if (!product) return [];
    const fromArray = Array.isArray(product.images) ? product.images.map(toUrl).filter(Boolean) : [];
    if (fromArray.length > 0) return fromArray;
    const single = toUrl(product.image);
    return single ? [single] : [];
  }, [product]);

  useEffect(() => {
    if (selectedImageIndex >= images.length) {
      setSelectedImageIndex(0);
    }
  }, [images, selectedImageIndex]);

  const nextImage = () => {
    if (images.length === 0) return;
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = () => {
    if (images.length === 0) return;
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMG;
  };

  const addToCart = () => {
    if (!product?.inStock) return;
    const cover = images || FALLBACK_IMG;
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        title: product.title,
        price: product.price,
        salePrice: product.salePrice,
        image: cover,
        images,
        category: product.category,
        subcategory: product.subcategory,
        subsubcategory: product.subsubcategory,
        color: product.color,
        description: product.description || "",
        quantity
      }
    });
  };

  const isWishlisted = product
    ? (state?.wishlist || []).some((w) => w.id === product.id)
    : false;

  const toggleWishlist = () => {
    if (!product) return;
    const cover = images || FALLBACK_IMG;
    dispatch({
      type: "WISHLIST_TOGGLE",
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1efef]">
        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-black border-t-transparent animate-spin rounded-full"></div>
          <p className="mb-0 text-black text-lg">Loading artwork…</p>
        </div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1efef]">
        <div className="text-center p-4">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="font-black text-xl mb-2 text-black">Artwork not found</h2>
          <p className="mb-6 text-black">{err || 'The artwork being searched for doesn’t exist or has been moved.'}</p>
          <FancyButton to="/shop" className="fancy-sm py-3 px-10 rounded-full text-lg font-bold">
            Browse All Artworks
          </FancyButton>
        </div>
      </div>
    );
  }

  const cover = images || FALLBACK_IMG;
  const desc = product.description || "";
  const isLong = desc.trim().split(/\s+/).length > 30;

  const whatsappHref = (() => {
    const phone = String(import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
    const msg = product ? `Hi! I'm interested in "${product.title}". Could you please share the price?` : "";
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : "#";
  })();

  const renderPrice = () => {
    if (product.donated) {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-lg font-bold">
          🙏 Donated
        </span>
      );
    }
    if (product.contactForPrice) {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-300 text-green-700 text-lg font-bold">
          💬 Price on Request
        </span>
      );
    }
    return (
      <span className="font-black text-2xl md:text-3xl text-black">
        {typeof product.salePrice === "number" && product.salePrice !== null && product.salePrice < product.price ? (
          <>
            <span className="line-through text-gray-400 mr-3 font-normal text-xl">{fmtUSD.format(product.price)}</span>
            <span>{fmtUSD.format(product.salePrice)}</span>
          </>
        ) : (
          fmtUSD.format(product.price)
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f1efef]">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-7 py-7">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-black/60">
          <ol className="flex flex-wrap items-center space-x-1">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li>/</li>
            <li><Link to="/shop" className="hover:underline">Shop</Link></li>
            <li>/</li>
            <li className="text-black">{product.title}</li>
          </ol>
        </nav>
        <div className="flex flex-col lg:flex-row gap-10 mb-6">
          {/* GALLERY */}
          <div className="w-full lg:w-[48%] flex flex-col gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden bg-white shadow aspect-square flex items-center justify-center"
            >
              <img
                src={images.length > 0 ? images[selectedImageIndex] : cover}
                alt={`${product.title} image`}
                className="w-full h-full object-cover rounded-2xl"
                onError={handleImgError}
              />
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black transition" aria-label="Previous image">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black transition" aria-label="Next image">
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-1 overflow-x-auto">
                {images.map((img, idx) => {
                  const active = selectedImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`rounded-lg ${active ? "ring-2 ring-black" : "ring-1 ring-black/40"} p-0 w-20 h-20 overflow-hidden shrink-0`}
                      aria-label={`Thumbnail ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`${product.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={handleImgError}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* INFO */}
          <div className="w-full lg:w-[52%] flex flex-col">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block text-xs font-semibold px-4 py-1 rounded-full border border-black mb-4 bg-white text-black">
                {product.category}
              </span>
              <h1 className="text-2xl md:text-4xl font-black mb-3 text-black">{product.title}</h1>
              <div className="flex items-center flex-wrap gap-4 mb-3">
                {renderPrice()}
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={19} color="#101010" fill="#101010" className="mr-1" />
                  ))}
                  <span className="ml-2 text-gray-600 font-semibold">(4.9) • 24 reviews</span>
                </div>
              </div>
              {/* Description */}
              {desc && (
                <div className="text-gray-800 text-lg/relaxed mb-4">
                  {descExpanded ? desc : wordLimitDesc(desc, 30)}
                  {isLong && (
                    <button
                      className="inline-block ml-2 text-blue-600 hover:underline font-medium"
                      onClick={() => setDescExpanded(v => !v)}
                      type="button"
                    >
                      {descExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="bg-gray-100 rounded-xl p-5 shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-black flex items-center justify-center bg-white text-black">
                      <Ruler size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase">Dimensions</div>
                      <div className="font-semibold text-black">{product.dimensions}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-black flex items-center justify-center bg-white text-black">
                      <PaletteIcon size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase">Color</div>
                      <div className="font-semibold text-black">{product.color}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {/* Quantity controls — hidden for donated or contactForPrice */}
                {!product.donated && !product.contactForPrice && (
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-black">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-lg border border-black flex items-center justify-center text-black transition hover:bg-black hover:text-white"
                      >−</button>
                      <span className="font-bold text-xl w-10 text-center">{quantity}</span>
                      <button type="button" onClick={() => setQuantity(q => q + 1)}
                        className="w-8 h-8 rounded-lg border border-black flex items-center justify-center text-black transition hover:bg-black hover:text-white"
                      >+</button>
                    </div>
                  </div>
                )}
                {/* BUTTONS */}
                <div className="flex gap-2 mt-1 flex-wrap">
                  {!product.donated && !product.contactForPrice && (
                    <FancyButton
                      as="button"
                      type="button"
                      className="fancy-sm flex items-center justify-center gap-2 py-2 px-6 text-lg font-bold rounded-full"
                      onClick={addToCart}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart size={20} className="inline-block -mt-0.5" />
                      <span>Add to Cart</span>
                    </FancyButton>
                  )}
                  {product.contactForPrice && !product.donated && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-full border-2 border-[#25d366] bg-[#25d366] text-white font-bold text-base py-2 px-6 hover:bg-white hover:text-[#25d366] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                      </svg>
                      Contact on WhatsApp
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={toggleWishlist}
                    className={`w-12 h-12 rounded-lg border-2 border-black flex items-center justify-center text-black transition hover:bg-black hover:text-white ${isWishlisted ? "bg-black text-white" : "bg-white"}`}
                    aria-label="Toggle wishlist"
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={21} />
                  </button>
                  <button
                    type="button"
                    className="w-12 h-12 rounded-lg border-2 border-black flex items-center justify-center text-black transition hover:bg-black hover:text-white bg-white"
                    aria-label="Share"
                    title="Copy product link"
                    onClick={() => {
                      const url = window.location.href;
                      if (navigator.clipboard?.writeText) {
                        navigator.clipboard.writeText(url);
                      }
                    }}>
                    <Share2 size={21} />
                  </button>
                </div>
                {/* Stock info */}
                <div className="mt-1 px-4 py-2 bg-white border border-black/10 rounded-xl text-[15px] text-black font-semibold">
                  {product.inStock ? 'In Stock - Ready to Ship' : 'Currently Unavailable'} {product.inStock && <span className="text-gray-500 pl-2 font-normal">Ships within 2–3 business days</span>}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
              <h2 className="font-black text-xl text-black mb-1">Related Artworks</h2>
              <Link to={`/shop?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`}
                className="font-semibold underline text-black/70 hover:text-black text-sm md:text-base">
                View all in {product.category} / {product.subcategory}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((rp, idx) => (
                <motion.div
                  key={rp.id}
                  initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }} viewport={{ once: true }}>
                  <ProductCard product={rp} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductViewPage;
