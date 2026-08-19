import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Droplets, CheckSquare, Square, AlertCircle } from "lucide-react";
import { applyWatermark, uploadToCloudinary, urlToFile, PALETTE } from "../utils/watermark.js";
import { WatermarkPositionModal } from "../components/WatermarkModal.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const PRODUCTS_URL = `${API_BASE}/api/products`;

axios.defaults.withCredentials = true;

export default function BulkWatermarkPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, current: "" });
  const [showWmModal, setShowWmModal] = useState(false);
  const [previewFiles, setPreviewFiles] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(PRODUCTS_URL);
        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        setProducts(items.filter(p => Array.isArray(p.images) && p.images.length > 0));
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map(p => p._id)));
    }
  };

  const handleApplyClick = async () => {
    if (!selected.size) { toast.warn("Select at least one product"); return; }
    // Load first image of first selected product for preview
    const firstProduct = products.find(p => selected.has(p._id));
    try {
      const f = await urlToFile(firstProduct.images[0], "preview.jpg");
      setPreviewFiles([f]);
      setShowWmModal(true);
    } catch {
      toast.error("Failed to load preview image");
    }
  };

  const handleWmConfirm = async (opts) => {
    setShowWmModal(false);
    setPreviewFiles(null);
    const selectedProducts = products.filter(p => selected.has(p._id));
    const total = selectedProducts.reduce((sum, p) => sum + p.images.length, 0);
    setProgress({ done: 0, total, current: "" });
    setProcessing(true);

    let done = 0;
    const errors = [];

    for (const product of selectedProducts) {
      try {
        const newUrls = [];
        for (const imgUrl of product.images) {
          setProgress({ done, total, current: product.title || product._id });
          const file = await urlToFile(imgUrl, "img.jpg");
          const watermarked = await applyWatermark(file, opts);
          const { url } = await uploadToCloudinary(watermarked);
          newUrls.push(url);
          done++;
          setProgress({ done, total, current: product.title || product._id });
        }
        const token = sessionStorage.getItem("accessToken");
        await axios.put(
          `${PRODUCTS_URL}/${product._id}`,
          { images: newUrls },
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );
      } catch (e) {
        errors.push(product.title || product._id);
        console.error(e);
      }
    }

    setProcessing(false);
    setSelected(new Set());
    if (errors.length) {
      toast.error(`Failed for: ${errors.join(", ")}`);
    } else {
      toast.success(`Watermark applied to ${selectedProducts.length} product${selectedProducts.length !== 1 ? "s" : ""}!`);
    }
  };

  const handleWmCancel = () => {
    setShowWmModal(false);
    setPreviewFiles(null);
  };

  const allSelected = products.length > 0 && selected.size === products.length;

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Droplets size={26} className="text-blue-600" />
            <h1 className="text-2xl font-black text-black">Bulk Watermark</h1>
          </div>
          <p className="text-sm text-gray-500">Select products to re-watermark their existing images. Original images will be replaced.</p>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>This will <strong>replace</strong> each selected product's images with new watermarked versions. This cannot be undone.</span>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <button type="button"
            className="btn-outline"
            onClick={toggleAll}>
            {allSelected ? <CheckSquare size={17} /> : <Square size={17} />}
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          <span className="text-sm text-gray-500">{selected.size} of {products.length} selected</span>
          <button type="button"
            className="ml-auto inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleApplyClick}
            disabled={!selected.size || processing}>
            <Droplets size={17} />
            Apply Watermark to Selected
          </button>
        </div>

        {/* Processing progress */}
        {processing && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm px-5 py-4 mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-700">Processing…</span>
              <span className="text-xs text-gray-500 tabular-nums">{progress.done} / {progress.total}</span>
            </div>
            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : '0%' }}
              />
            </div>
            {progress.current && (
              <div className="text-xs text-gray-500 mt-1.5 truncate">Current: {progress.current}</div>
            )}
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-lg">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-lg">No products with images found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => {
              const isSelected = selected.has(product._id);
              return (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => !processing && toggleSelect(product._id)}
                  className={`relative text-left rounded-2xl border-2 transition-all overflow-hidden bg-white shadow-sm ${
                    isSelected
                      ? "border-blue-600 shadow-blue-100 shadow-md"
                      : "border-transparent hover:border-gray-300"
                  } ${processing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {/* Selection indicator */}
                  <div className={`absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? "bg-blue-600 text-white" : "bg-white/80 border border-gray-300 text-transparent"
                  }`}>
                    <CheckSquare size={14} />
                  </div>

                  {/* Image strip */}
                  <div className="flex gap-0.5 h-28 overflow-hidden">
                    {product.images.slice(0, 3).map((src, i) => (
                      <img key={i} src={src} alt="" className="flex-1 object-cover min-w-0" />
                    ))}
                    {product.images.length > 3 && (
                      <div className="flex-shrink-0 w-10 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        +{product.images.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="px-3 py-2.5">
                    <div className="font-semibold text-sm text-black truncate">{product.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{product.images.length} image{product.images.length !== 1 ? "s" : ""}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Watermark modal */}
      {showWmModal && previewFiles && (
        <WatermarkPositionModal
          files={previewFiles}
          onConfirm={handleWmConfirm}
          onCancel={handleWmCancel}
        />
      )}
    </div>
  );
}
