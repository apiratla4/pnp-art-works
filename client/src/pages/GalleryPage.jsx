import React, { useEffect, useMemo, useState } from "react";
import { X, Filter, Grid, Search, Heart, Share2, Copy, XCircle } from "lucide-react";
import axios from "axios";
import Masonry from "react-masonry-css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const fallbackImg =
  "https://images.unsplash.com/photo-1465101178521-c189089c8f94?auto=format&fit=crop&w=800&q=80&sat=0";
const defaultCategories = [
  "All",
  "Paintings",
  "Handcrafted Items",
  "Exhibitions",
  "Other",
];

const Toast = ({ show, text }) =>
  show ? (
    <div className="fixed left-1/2 bottom-7 z-50 transform -translate-x-1/2 bg-black text-white px-5 py-2 rounded-full text-sm shadow-lg pointer-events-none">
      {text}
    </div>
  ) : null;

const GalleryPage = () => {
  const [selected, setSelected] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [viewMode, setViewMode] = useState("masonry");
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState({ show: false, text: "" });

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    (async () => {
      setErr("");
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/gallery?limit=9999`,
          { withCredentials: true, signal: controller.signal }
        );
        if (ignore) return;
        const arr = (data.items || []).map((it) => ({
          ...it,
          src: it.src || it.url || fallbackImg,
        }));
        setItems(arr);
        const discrCats = Array.from(new Set(arr.map((i) => i.category).filter(Boolean)));
        if (discrCats.length) setCategories(["All", ...discrCats]);
      } catch (e) {
        if (!ignore) setErr("Could not load gallery.");
      }
    })();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  // Direct search as you type
  const filtered = useMemo(() => {
  let list = items;
  if (filterCategory !== "All") {
    const normCat = filterCategory.trim().toLowerCase();
    list = list.filter((i) =>
      (i.category || "").trim().toLowerCase() === normCat
    );
  }
  if (searchTerm.trim().length) {
    const q = searchTerm.toLowerCase();
    list = list.filter((i) =>
      [i.title, i.medium, i.description, i.category, i.year]
        .some((val) => (val ? String(val).toLowerCase() : "").includes(q))
    );
  }
  return list;
}, [items, filterCategory, searchTerm]);


  const breakpointColumns = { default: 4, 1400: 3, 900: 2, 0: 1 };

  const Overlay = ({ image }) => (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10 rounded-b-2xl">
      <div className="text-white text-base font-bold line-clamp-2">{image.title || "Untitled"}</div>
      {(image.medium || image.year) && (
        <div className="text-gray-200 text-xs mb-1 mt-0.5">{image.medium || ""}{image.year ? ` • ${image.year}` : ""}</div>
      )}
      {image.description && (
        <div className="text-gray-300 text-xs line-clamp-2">{image.description}</div>
      )}
    </div>
  );
  const CardBase = ({ image, ...props }) => (
    <div tabIndex={0}
      className="img-wrap group cursor-pointer rounded-2xl overflow-hidden bg-white shadow-sm transition hover:shadow-xl focus:shadow-xl focus:ring focus:ring-black/10 relative h-full flex flex-col select-none"
      {...props}
    >
      <img src={image.src || fallbackImg} alt={image.title}
        className="w-full h-full min-h-[200px] object-cover transition-transform duration-300 group-hover:scale-105 group-focus:scale-105" />
      <div className="absolute left-4 top-3 z-20">
        <span className="bg-white font-semibold px-3 py-0.5 text-xs rounded-full border border-black text-black select-none shadow">{image.category || "Other"}</span>
      </div>
      <Overlay image={image} />
    </div>
  );
  const GridCard = ({ image }) => (
    <CardBase image={image} onClick={() => setSelected(image)} />
  );
  const MasonryCard = ({ image }) => (
    <div className="mb-6"><CardBase image={image} onClick={() => setSelected(image)} /></div>
  );

  const downloadImage = async (src, name = "artwork.jpg") => {
    try {
      const res = await fetch(src, { mode: "cors" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      setToast({ show: true, text: "Download started" });
      setTimeout(() => setToast({ show: false, text: "" }), 1000);
    } catch {
      window.open(src, "_blank", "noopener");
    }
  };
  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); setToast({ show: true, text: "Copied" }); }
    catch { setToast({ show: true, text: "Copy failed" }); }
    finally { setTimeout(() => setToast({ show: false, text: "" }), 900); }
  };
  const shareImage = async (img) => {
    const title = img?.title || "Artwork";
    const text = `${title}${img?.description ? "  " + img.description : ""}`;
    const src = img?.src;
    try {
      if (navigator.share && src) {
        await navigator.share({ title, text, url: src });
        return;
      }
    } catch {}
    if (src && navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(src); setToast({ show: true, text: "Copied" }); setTimeout(() => setToast({ show: false, text: "" }), 800); return; } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-10">
      {/* Header */}
      <div className="w-full max-w-[1440px] mx-auto px-4 mb-0 pt-6">
        <h1 className="font-black text-5xl md:text-7xl text-center text-black mt-10 mb-2">Art Gallery</h1>
        <div className="mb-12 text-gray-700 text-xl max-w-3xl text-center mx-auto">
          Explore our complete collection of original artworks, exhibitions, and creative moments
        </div>
      </div>

      {/* Controls - floating card */}
      <div className="w-full max-w-[1320px] mx-auto flex justify-center px-2">
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 rounded-[2.5rem] bg-white shadow-xl px-6 py-6 md:py-7 mb-12" style={{ minHeight: 102 }}>
          {/* Search */}
          <div className="flex items-center flex-1 min-w-[280px] max-w-lg bg-white rounded-xl border border-gray-200 pr-2">
            <Search size={25} className="text-black/80 mx-3" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search artworks..."
              className="flex-1 py-3 px-2 bg-transparent text-black font-normal focus:outline-none text-lg"
              style={{ minWidth: 0, background: 'none' }}
            />
            {searchTerm && (
              <button type="button" className="ml-2 text-black/50 hover:text-black" onClick={() => setSearchTerm("")} aria-label="Clear search">
                <XCircle size={22} />
              </button>
            )}
          </div>
          {/* Categories */}
          <div className="flex gap-3 flex-wrap items-center justify-center px-2">
            {categories.map((cat) => (
              <button key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-6 h-12 text-lg rounded-full font-semibold border transition
                  ${filterCategory === cat
                    ? "bg-black text-white border-black shadow"
                    : "bg-white text-black border-black hover:bg-black hover:text-white"}
                `}
                style={{ minWidth: 90, borderWidth: 2 }}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Toggle */}
          <div className="flex items-center gap-3 ml-2">
            <button
              className={`rounded-xl border border-black shadow-sm flex items-center justify-center w-12 h-12 
                ${viewMode === "masonry"
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-black hover:text-white"}`}
              style={{ fontWeight: 700, borderWidth: 2 }}
              onClick={() => setViewMode("masonry")}
              aria-label="Masonry"
            >
              <Filter size={22} />
            </button>
            <button
              className={`rounded-xl border border-black shadow-sm flex items-center justify-center w-12 h-12 
                ${viewMode === "grid"
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-black hover:text-white"}`}
              style={{ fontWeight: 700, borderWidth: 2 }}
              onClick={() => setViewMode("grid")}
              aria-label="Grid"
            >
              <Grid size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="w-full max-w-[1440px] mx-auto mb-5 px-4 text-gray-500 text-base font-semibold">
        {filtered.length} {filtered.length === 1 ? "artwork" : "artworks"}
      </div>

      {/* Gallery */}
      <div className="max-w-[1390px] mx-auto w-full px-3">
        {err && <div className="bg-white text-red-700 border border-black/15 p-3 my-4 rounded-xl text-center">{err}</div>}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((img, i) => (
              <GridCard image={img} key={img._id || img.id || img.src + i} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-500 text-lg">No artworks match your filters.</div>
            )}
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex -mx-3"
            columnClassName="px-3"
          >
            {filtered.map((img, i) => (
              <MasonryCard image={img} key={img._id || img.id || img.src + i} />
            ))}
          </Masonry>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-5 relative flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setSelected(null)}
              className="absolute right-4 top-4 bg-white border border-black rounded-full p-1.5 focus:outline-none shadow hover:bg-black hover:text-white transition"
              aria-label="Close">
              <X size={19} />
            </button>
            <img
              src={selected.src || fallbackImg}
              alt={selected.title}
              className="rounded-lg mb-5 object-contain max-h-[48vh] w-full bg-gray-100"
            />
            <span className="inline-block text-xs mb-2 font-semibold px-3 py-1 rounded-full border border-black bg-white text-black">{selected.category || "Other"}</span>
            <h2 className="text-xl font-extrabold mb-2 text-black">{selected.title || "Untitled"}</h2>
            <p className="mb-0 text-gray-700">{selected.medium || ""}{selected.year && <> • {selected.year}</>}</p>
            <p className="my-2 text-gray-600">{selected.description || <span className="italic text-gray-400">No description.</span>}</p>
            <div className="w-full flex flex-col sm:flex-row items-center gap-3 mt-4">
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white border border-black text-sm font-semibold rounded-full hover:bg-gray-900 transition"
                onClick={() =>
                  downloadImage(
                    selected.src,
                    `${(selected.title || "artwork").replace(/\s+/g, "_")}.jpg`
                  )
                }
                type="button"
              >
                <Heart size={16} /> Download
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-black text-black text-sm font-semibold rounded-full hover:bg-black hover:text-white transition"
                onClick={() => shareImage(selected)} type="button"
              >
                <Share2 size={16} /> Share
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-black text-black text-sm font-semibold rounded-full hover:bg-black hover:text-white transition"
                onClick={() => copyToClipboard(selected.src)} type="button"
              >
                <Copy size={15} /> Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast show={toast.show} text={toast.text} />
    </div>
  );
};

export default GalleryPage;
