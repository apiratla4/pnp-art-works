// src/pages/ArtClassesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, MapPin, Paintbrush, CheckCircle2, GraduationCap, Wifi } from "lucide-react";
import axios from "axios";
import artvideo from "../assets/art_classes_video.mp4";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Card hover
const cardHover = { y: -4, scale: 1.01, boxShadow: "0 12px 28px rgba(17, 24, 39, 0.12)" };
// Image hover
const imgHover = { scale: 1.04 };

// USD formatter
const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const ArtClassesPage = () => {
  const [mode, setMode] = useState("online"); // 'online' | 'offline'
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

  // Map API -> UI
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
    <div className="min-vh-100" style={{ backgroundColor: "#f1efef" }}>
      {/* Hero */}
      <div className="container pt-4 mb-4 mb-lg-5">
        <div className="row g-3 mb-3">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ background: "#fff", color: "#000" }}>
              {/* Stretch columns; make video fill column */}
              <div className="row g-0 align-items-stretch">
                <div className="col-12 col-lg-6 d-flex h-100">
                  <video
                    src={artvideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-100 h-100"
                    style={{ objectFit: "cover", display: "block" }}
                  />
                </div>
                <div className="col-12 col-lg-6">
                  <div className="p-4 p-lg-5">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                      style={{ width: 64, height: 64, background: "#fff", color: "#000", border: "2px solid #000" }}
                    >
                      <GraduationCap size={28} />
                    </div>
                    <h2 className="fw-bold mb-2" style={{ color: "#000" }}>Learn, Create, Thrive</h2>
                    <p className="mb-0" style={{ color: "#000" }}>
                      Join live online sessions or enroll in immersive studio workshops guided by experienced instructors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container pt-3 pb-5">
        {/* Availability */}
        <div className="mono-alert d-flex align-items-center gap-2 mb-4">
          <div className="rounded-circle d-flex align-items-center justify-content-center"
               style={{ width: 36, height: 36, background: "#fff", color: "#000", border: "1px solid #000" }}>
            <Wifi size={18} />
          </div>
          <div className="flex-grow-1">
            <div className="fw-semibold" style={{ color: "#000" }}>Online and Studio class registrations are open</div>
            <div className="small" style={{ color: "#000" }}>Pick a mode below to explore upcoming sessions</div>
          </div>
        </div>

        {/* Toggle */}
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                        className="mb-4 mb-lg-5">
          <div className="text-center mb-3">
            <h1 className="fw-bold display-6 mb-2" style={{ color: "#000" }}>Art Classes & Workshops</h1>
            <p className="mb-0" style={{ color: "#000" }}>
              Live, guided sessions to master techniques across drawing, watercolor, and acrylics — learn from anywhere or join in studio.
            </p>
          </div>

          <div className="d-flex justify-content-center">
            <div className="d-inline-flex gap-2" role="group" aria-label="Class delivery mode">
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

        {/* What's included */}
        <motion.section initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        transition={{ duration: 0.45 }} className="row g-3 g-lg-4 mb-4 mb-lg-5">
          {[
            { icon: <Paintbrush size={18} />, title: "Guided Techniques", text: "Step‑by‑step demos and personalized feedback." },
            { icon: <Users size={18} />, title: "Small Cohorts", text: "Limited seats to maximize instructor attention." },
            { icon: <CheckCircle2 size={18} />, title: "Materials Guidance", text: "Get pre‑class materials list and alternatives." },
          ].map((f, i) => (
            <div key={i} className="col-12 col-lg-4">
              <motion.div whileHover={cardHover} className="card border-0 shadow-sm rounded-4 h-100" style={{ background: "#fff", color: "#000" }}>
                <div className="card-body d-flex gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center"
                       style={{ width: 40, height: 40, background: "#fff", color: "#000", border: "1px solid #000" }}>
                    {f.icon}
                  </div>
                  <div>
                    <h5 className="fw-semibold mb-1" style={{ color: "#000" }}>{f.title}</h5>
                    <p className="mb-0" style={{ color: "#000" }}>{f.text}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.section>

        {/* Sessions */}
        <motion.section initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        transition={{ duration: 0.45 }} className="mb-4 mb-lg-5">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <h2 className="fw-bold h4 mb-0" style={{ color: "#000" }}>
              {mode === "online" ? "Upcoming Online Sessions" : "Upcoming Studio Sessions"}
            </h2>
            <span className="small" style={{ color: "#000" }}>{sessions.length} scheduled</span>
          </div>

          {loading && <div style={{ color: "#000" }}>Loading classes…</div>}
          {!loading && err && <div style={{ color: "#000" }}>{err}</div>}

          <div className="row g-3 g-lg-4">
            {!loading && !err && sessions.map((s, idx) => (
              <div key={s.id} className="col-12 col-lg-4">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={cardHover}
                  className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
                  style={{ background: "#fff", color: "#000" }}
                >
                  <motion.img
                    src={s.image || "https://via.placeholder.com/800x500?text=Class+Cover"}
                    alt={s.title}
                    className="card-img-top"
                    loading="lazy"
                    style={{ height: 220, objectFit: "cover" }}
                    whileHover={imgHover}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  />

                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="mono-badge rounded-pill">
                        {s.mode === "Online" ? "Online Live" : "Studio"}
                      </span>
                      <div className="fw-semibold" style={{ color: "#000" }}>
                        {fmtUSD.format(Number(s.price || 0))}
                      </div>
                    </div>

                    <h3 className="h5 fw-bold mb-2" style={{ color: "#000" }}>{s.title}</h3>

                    <ul className="list-unstyled small vstack gap-2 mb-3" style={{ color: "#000" }}>
                      <li className="d-flex align-items-center gap-2">
                        <Calendar size={16} /> <span>{s.date || "-"}</span>
                      </li>
                      {s.time ? (
                        <li className="d-flex align-items-center gap-2">
                          <Clock size={16} /> <span>{s.time}</span>
                        </li>
                      ) : null}
                      <li className="d-flex align-items-center gap-2">
                        <Users size={16} /> <span>{s.seats} seats</span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <MapPin size={16} /> <span>{s.location}</span>
                      </li>
                    </ul>

                    {s.highlights?.length > 0 && (
                      <div className="mb-3">
                        <div className="small mb-1" style={{ color: "#000" }}>You’ll practice:</div>
                        <div className="d-flex flex-wrap gap-1">
                          {s.highlights.map((h) => (
                            <span key={h} className="mono-badge rounded-pill">{h}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      className="mono-btn w-100 rounded-pill"
                      onClick={() => alert(`Enquire / Reserve Seat for ${s.title} (${s.mode})`)}
                    >
                      Enquire / Reserve Seat
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}
            {!loading && !err && sessions.length === 0 && (
              <div className="col-12">
                <div style={{ color: "#000" }}>No sessions found for this mode.</div>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* Local monochrome + focus-visible styles */}
      <style>{`
        /* Monochrome alert */
        .mono-alert {
          border: 1px solid #000;
          background: #fff;
          color: #000;
          border-radius: 12px;
          padding: 12px 14px;
        }

        /* Mono badge */
        .mono-badge {
          display: inline-block;
          padding: 6px 10px;
          border: 1px solid #000;
          background: #fff;
          color: #000;
          font-weight: 700;
        }

        /* Icon toggle buttons */
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

        /* Mono buttons */
        .mono-btn {
          border: 1px solid #000; background: #fff; color: #000; border-radius: 10px; padding: 10px 16px; font-weight: 700;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
          white-space: nowrap;
        }
        .mono-btn:hover { background: #000; color: #fff; }
        .mono-btn:active { transform: scale(0.98); }
        .mono-btn:focus-visible { outline: none; box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff; }
        .mono-btn:focus { outline: 2px solid #000; outline-offset: 2px; }

        /* Links (if any) */
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
