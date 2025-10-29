import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, MapPin, Paintbrush, CheckCircle2, GraduationCap, Wifi } from "lucide-react";
import axios from "axios";
import artvideo from "../assets/art_classes_video.mp4";

const ENQUIRY_URL = "https://docs.google.com/forms/d/e/1FAIpQLScHGdiGiQwG06LCjQ0BYfLw0QU8_wI9LoM_b4RE2YAJ6_z1RQ/viewform";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const cardHover = { y: -4, scale: 1.01, boxShadow: "0 12px 28px rgba(17, 24, 39, 0.12)" };
const imgHover = { scale: 1.04 };
const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const ArtClassesPage = () => {
  const [mode, setMode] = useState("online");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/classes`, { withCredentials: true });
        if (!ignore) {
          const arr = Array.isArray(res.data?.items) ? res.data.items : [];
          setItems(arr);
          setErr("");
        }
      } catch (e) {
        if (!ignore) setErr("Failed to load classes");
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const mapped = useMemo(() => {
    return (items || []).map((c) => ({
      id: c._id,
      title: c.title,
      level: c.level || "",
      date: c.startDate || "",
      time: c.time || "",
      seats: typeof c.seats === "number" ? c.seats : 0,
      location: (c.mode === "Online" ? "Online (Live)" : "Studio"),
      price: typeof c.price === "number" ? c.price : 0,
      image: c.cover || "",
      highlights: (c.description ? c.description.split(",").map((s) => s.trim()).filter(Boolean) : []),
      mode: c.mode || "Online",
      published: !!c.published
    }));
  }, [items]);

  const onlineSessions = useMemo(() => mapped.filter((s) => s.mode === "Online" && s.published), [mapped]);
  const offlineSessions = useMemo(() => mapped.filter((s) => s.mode !== "Online" && s.published), [mapped]);
  const sessions = mode === "online" ? onlineSessions : offlineSessions;

  return (
    <div className="min-h-screen bg-[#f1efef] text-black">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 pt-5 mb-7">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="rounded-2xl overflow-hidden shadow-lg bg-white flex items-center">
            <video
              src={artvideo}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center">
            <div className="flex items-center justify-center rounded-full border-2 border-black bg-white w-16 h-16 mb-4">
              <GraduationCap size={28} />
            </div>
            <h2 className="font-bold text-2xl mb-2">Learn, Create, Thrive</h2>
            <p>Join live online sessions or enroll in immersive studio workshops guided by experienced instructors.</p>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="mono-alert flex items-center gap-3 mb-7">
          <div className="rounded-full flex items-center justify-center w-9 h-9 bg-white border border-black">
            <Wifi size={18} />
          </div>
          <div className="grow">
            <div className="font-semibold">Online and Studio class registrations are open</div>
            <div className="text-sm">Pick a mode below to explore upcoming sessions</div>
          </div>
        </div>
      </div>

      {/* Mode Toggle & Header */}
      <div className="max-w-7xl mx-auto px-4">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-7">
          <div className="text-center mb-3">
            <h1 className="font-bold text-2xl mb-2">Art Classes & Workshops</h1>
            <p>
              Live, guided sessions to master techniques across drawing, watercolor, and acrylics — learn from anywhere or join in studio.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="inline-flex gap-2" role="group" aria-label="Class delivery mode">
              <button
                type="button"
                className={`icon-toggle ${mode === "online" ? "active" : ""}`}
                onClick={() => setMode("online")}
                aria-pressed={mode === "online"}
              >
                Online
              </button>
              <button
                type="button"
                className={`icon-toggle ${mode === "offline" ? "active" : ""}`}
                onClick={() => setMode("offline")}
                aria-pressed={mode === "offline"}
              >
                Studio
              </button>
            </div>
          </div>
        </motion.section>
      </div>

      {/* What's included */}
      <div className="max-w-7xl mx-auto px-4">
        <motion.section initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-7">
          {[
            { icon: <Paintbrush size={18} />, title: "Guided Techniques", text: "Step‑by‑step demos and personalized feedback." },
            { icon: <Users size={18} />, title: "Small Cohorts", text: "Limited seats to maximize instructor attention." },
            { icon: <CheckCircle2 size={18} />, title: "Materials Guidance", text: "Get pre‑class materials list and alternatives." }
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={cardHover}
              className="bg-white rounded-2xl shadow p-7 h-full flex items-start gap-4 transition-all"
            >
              <div className="rounded-full flex items-center justify-center border border-black bg-white w-10 h-10">
                {f.icon}
              </div>
              <div>
                <h5 className="font-semibold mb-1">{f.title}</h5>
                <p className="mb-0">{f.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.section>
      </div>

      {/* Sessions */}
      <div className="max-w-7xl mx-auto px-4">
        <motion.section initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="mb-7">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h2 className="font-bold text-lg mb-0">{mode === "online" ? "Upcoming Online Sessions" : "Upcoming Studio Sessions"}</h2>
            <span className="text-sm">{sessions.length} scheduled</span>
          </div>
          {loading && <div>Loading classes…</div>}
          {!loading && err && <div>{err}</div>}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {!loading && !err && sessions.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={cardHover}
                className="bg-white rounded-2xl shadow h-full flex flex-col overflow-hidden transition-all"
              >
                <motion.img
                  src={s.image || "https://via.placeholder.com/800x500?text=Class+Cover"}
                  alt={s.title}
                  className="w-full h-[220px] object-cover"
                  loading="lazy"
                  whileHover={imgHover}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="mono-badge rounded-full">
                      {s.mode === "Online" ? "Online Live" : "Studio"}
                    </span>
                    <div className="font-semibold">{fmtUSD.format(Number(s.price || 0))}</div>
                  </div>
                  <h3 className="font-bold text-base mb-2">{s.title}</h3>
                  <ul className="list-none text-sm flex flex-col gap-2 mb-3">
                    <li className="flex items-center gap-2"><Calendar size={16} /> <span>{s.date || "-"}</span></li>
                    {s.time && <li className="flex items-center gap-2"><Clock size={16} /> <span>{s.time}</span></li>}
                    <li className="flex items-center gap-2"><Users size={16} /> <span>{s.seats} seats</span></li>
                    <li className="flex items-center gap-2"><MapPin size={16} /> <span>{s.location}</span></li>
                  </ul>
                  {s.highlights?.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm mb-1">You’ll practice:</div>
                      <div className="flex flex-wrap gap-1">
                        {s.highlights.map((h) => (
                          <span key={h} className="mono-badge rounded-full">{h}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    className="mono-btn w-full rounded-full"
                    onClick={() => window.open(ENQUIRY_URL, "_blank", "noopener,noreferrer")}
                    title={`Enquire / Reserve Seat for ${s.title} (${s.mode})`}
                  >
                    Enquire / Reserve Seat
                  </button>
                </div>
              </motion.div>
            ))}
            {!loading && !err && sessions.length === 0 && (
              <div className="col-span-full">
                <div>No sessions found for this mode.</div>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* Local monochrome + focus-visible styles */}
      <style>{`
        .mono-alert {
          border: 1px solid #000;
          background: #fff;
          color: #000;
          border-radius: 12px;
          padding: 12px 14px;
        }
        .mono-badge {
          display: inline-block;
          padding: 6px 10px;
          border: 1px solid #000;
          background: #fff;
          color: #000;
          font-weight: 700;
        }
        .icon-toggle {
          border: 1px solid #000; background: #fff; color: #000;
          border-radius: 999px; padding: 8px 14px; font-weight: 700;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
        }
        .icon-toggle:hover { background: #000; color: #fff; }
        .icon-toggle:active { transform: scale(0.98); }
        .icon-toggle.active { background: #000; color: #fff; }
        .icon-toggle:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .icon-toggle:focus { outline: 2px solid #000; outline-offset: 2px; }
        .mono-btn {
          border: 1px solid #000; background: #fff; color: #000; border-radius: 10px; padding: 10px 16px; font-weight: 700;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
          white-space: nowrap;
        }
        .mono-btn:hover { background: #000; color: #fff; }
        .mono-btn:active { transform: scale(0.98); }
        .mono-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .mono-btn:focus { outline: 2px solid #000; outline-offset: 2px; }
        a:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        a:focus { outline: 2px solid #000; outline-offset: 2px; }
      `}</style>
    </div>
  );
};

export default ArtClassesPage;
