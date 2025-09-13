
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Send, RefreshCw, Users, CalendarClock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const SUBS_URL = `${API_BASE}/api/newsletters/subscribers`;
const CAMP_URL = `${API_BASE}/api/newsletters/campaigns`;

axios.defaults.withCredentials = true;

export default function NewslettersPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);

  // composer
  const [subject, setSubject] = useState("");
  const [headerHtml, setHeaderHtml] = useState("<h1>Our Latest Offers</h1>");
  const [bodyHtml, setBodyHtml] = useState("<p>Hi there! Check our new products.</p>");
  const [footerHtml, setFooterHtml] = useState("<p>Thanks for subscribing.</p>");
  const [imageUrl, setImageUrl] = useState("");

  // schedule
  const [mode, setMode] = useState("now"); // now | once | weekly | monthly | cron
  const [onceAt, setOnceAt] = useState(""); // datetime-local
  const [weeklyDow, setWeeklyDow] = useState("1"); // 0-6
  const [weeklyTime, setWeeklyTime] = useState("09:00");
  const [monthlyDom, setMonthlyDom] = useState("1"); // 1-31
  const [monthlyTime, setMonthlyTime] = useState("09:00");
  const [cronExpr, setCronExpr] = useState(""); // advanced

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(SUBS_URL, { withCredentials: true });
      setSubs(Array.isArray(data?.items) ? data.items : []);
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const buildPayload = () => {
    const payload = {
      subject,
      headerHtml,
      bodyHtml,
      footerHtml,
      imageUrl: imageUrl?.trim() || null,
      schedule: { type: mode }
    };
    if (mode === "once" && onceAt) payload.schedule.when = new Date(onceAt).toISOString();
    if (mode === "weekly") payload.schedule.weekly = { dow: Number(weeklyDow), time: weeklyTime };
    if (mode === "monthly") payload.schedule.monthly = { dom: Number(monthlyDom), time: monthlyTime };
    if (mode === "cron" && cronExpr) payload.schedule.cron = cronExpr;
    return payload;
  };

  const sendNow = async () => {
    try {
      const { data } = await axios.post(`${CAMP_URL}`, { ...buildPayload(), schedule: { type: "now" } }, { withCredentials: true });
      toast.success(`Sent to ${data?.sent || 0} subscribers`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to send");
    }
  };

  const schedule = async () => {
    try {
      const { data } = await axios.post(`${CAMP_URL}`, buildPayload(), { withCredentials: true });
      toast.success(`Campaign ${data?.status === "scheduled" ? "scheduled" : "saved"}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to schedule");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="h4 d-flex align-items-center gap-2 mb-0" style={{ color: "#000" }}>
          <Send size={20} /> Newsletters
        </h2>
        <div className="d-flex align-items-center gap-2">
          <button
            className="mono-btn mono-btn-sm d-inline-flex align-items-center gap-2"
            onClick={load}
            disabled={loading}
            type="button"
            aria-label="Refresh subscribers"
            title="Refresh subscribers"
          >
            <RefreshCw size={16} /> Refresh subs
          </button>
          <span className="small d-inline-flex align-items-center gap-1" style={{ color: "#000" }}>
            <Users size={14} /> {subs.length} subscribers
          </span>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4" style={{ background: "#fff", color: "#000" }}>
            <div className="card-body">
              <h6 className="fw-semibold mb-3" style={{ color: "#000" }}>Compose</h6>
              <div className="vstack gap-3">
                <div>
                  <label className="form-label" style={{ color: "#000" }}>Subject</label>
                  <input className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div>
                  <label className="form-label" style={{ color: "#000" }}>Header HTML</label>
                  <textarea className="form-control" rows={2} value={headerHtml} onChange={(e) => setHeaderHtml(e.target.value)} />
                </div>
                <div>
                  <label className="form-label" style={{ color: "#000" }}>Body HTML</label>
                  <textarea className="form-control" rows={6} value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} />
                </div>
                <div>
                  <label className="form-label" style={{ color: "#000" }}>Footer HTML</label>
                  <textarea className="form-control" rows={2} value={footerHtml} onChange={(e) => setFooterHtml(e.target.value)} />
                </div>
                <div>
                  <label className="form-label" style={{ color: "#000" }}>Hero image URL (optional)</label>
                  <input className="form-control" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button className="mono-btn d-inline-flex align-items-center gap-2" onClick={sendNow} type="button">
              <Send size={16} /> Send now to all
            </button>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4" style={{ background: "#fff", color: "#000" }}>
            <div className="card-body">
              <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ color: "#000" }}>
                <CalendarClock size={16} /> Schedule
              </h6>
              <div className="vstack gap-3">
                <div>
                  <label className="form-label" style={{ color: "#000" }}>Mode</label>
                  <select className="form-select" value={mode} onChange={(e) => setMode(e.target.value)}>
                    <option value="now">Send immediately</option>
                    <option value="once">Once at exact time</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="cron">Advanced (cron)</option>
                  </select>
                </div>

                {mode === "once" && (
                  <div>
                    <label className="form-label" style={{ color: "#000" }}>Date & time</label>
                    <input type="datetime-local" className="form-control" value={onceAt} onChange={(e) => setOnceAt(e.target.value)} />
                  </div>
                )}
                {mode === "weekly" && (
                  <>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label" style={{ color: "#000" }}>Day of week</label>
                        <select className="form-select" value={weeklyDow} onChange={(e) => setWeeklyDow(e.target.value)}>
                          <option value="0">Sunday</option><option value="1">Monday</option><option value="2">Tuesday</option>
                          <option value="3">Wednesday</option><option value="4">Thursday</option><option value="5">Friday</option><option value="6">Saturday</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ color: "#000" }}>Time</label>
                        <input type="time" className="form-control" value={weeklyTime} onChange={(e) => setWeeklyTime(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}
                {mode === "monthly" && (
                  <>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label" style={{ color: "#000" }}>Day of month</label>
                        <input type="number" min={1} max={31} className="form-control" value={monthlyDom} onChange={(e) => setMonthlyDom(e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ color: "#000" }}>Time</label>
                        <input type="time" className="form-control" value={monthlyTime} onChange={(e) => setMonthlyTime(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}
                {mode === "cron" && (
                  <div>
                    <label className="form-label" style={{ color: "#000" }}>Cron expression</label>
                    <input
                      className="form-control"
                      placeholder="m h dom mon dow (e.g., 0 9 * * 1 for Mondays 09:00)"
                      value={cronExpr}
                      onChange={(e) => setCronExpr(e.target.value)}
                    />
                    <div className="form-text">Use a standard 5-field cron (minute hour day-of-month month day-of-week).</div>
                  </div>
                )}

                <button className="mono-btn" onClick={schedule} type="button">Save & schedule</button>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 mt-3" style={{ background: "#fff", color: "#000" }}>
            <div className="card-body">
              <h6 className="fw-semibold mb-2" style={{ color: "#000" }}>Subscribers</h6>
              <div className="table-responsive" style={{ maxHeight: 260, overflowY: "auto" }}>
                <table className="table table-sm align-middle">
                  <thead><tr><th style={{ color: "#000" }}>Email</th><th style={{ color: "#000" }}>Joined</th></tr></thead>
                  <tbody>
                    {subs.map(s => (
                      <tr key={s._id}>
                        <td style={{ color: "#000" }}>{s.email}</td>
                        <td style={{ color: "#000" }}>{s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <a className="mono-btn mono-btn-sm" href={`${SUBS_URL}/export`} target="_blank" rel="noreferrer">Download CSV</a>
            </div>
          </div>
        </div>
      </div>

      {/* Local monochrome + focus-visible */}
      <style>{`
        /* Inputs/selects focus in black */
        .form-control:focus, .form-select:focus {
          border-color: #000 !important;
          box-shadow: none !important;
        }

        /* Mono buttons */
        .mono-btn {
          border: 1px solid #000; background: #fff; color: #000;
          border-radius: 10px; padding: 8px 12px; font-weight: 700;
          transition: background-color .16s ease, color .16s ease, transform .12s ease, box-shadow .12s ease;
          white-space: nowrap;
        }
        .mono-btn-sm { padding: 6px 10px; border-radius: 999px; }
        .mono-btn:hover { background: #000; color: #fff; }
        .mono-btn:active { transform: scale(0.98); }

        /* Keyboard-only focus indicator */
        .mono-btn:focus-visible,
        a:focus-visible,
        .form-control:focus-visible,
        .form-select:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        .mono-btn:focus, a:focus, .form-control:focus, .form-select:focus {
          outline: 2px solid #000; outline-offset: 2px;
        }
        .mono-btn:focus:not(:focus-visible),
        a:focus:not(:focus-visible),
        .form-control:focus:not(:focus-visible),
        .form-select:focus:not(:focus-visible) {
          outline: none; box-shadow: none;
        }
      `}</style>
    </div>
  );
}
