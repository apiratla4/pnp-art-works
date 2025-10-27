import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Send, RefreshCw, Users, CalendarClock, Mail, Download, Edit2 } from "lucide-react";
import { motion } from "framer-motion";
import "./NewslettersPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const SUBS_URL = `${API_BASE}/api/newsletters/subscribers`;
const CAMP_URL = `${API_BASE}/api/newsletters/campaigns`;

axios.defaults.withCredentials = true;

export default function NewslettersPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Composer
  const [subject, setSubject] = useState("");
  const [headerHtml, setHeaderHtml] = useState("<h1>Our Latest Offers</h1>");
  const [bodyHtml, setBodyHtml] = useState("<p>Hi there! Check our new products.</p>");
  const [footerHtml, setFooterHtml] = useState("<p>Thanks for subscribing.</p>");
  const [imageUrl, setImageUrl] = useState("");

  // Schedule
  const [mode, setMode] = useState("now");
  const [onceAt, setOnceAt] = useState("");
  const [weeklyDow, setWeeklyDow] = useState("1");
  const [weeklyTime, setWeeklyTime] = useState("09:00");
  const [monthlyDom, setMonthlyDom] = useState("1");
  const [monthlyTime, setMonthlyTime] = useState("09:00");
  const [cronExpr, setCronExpr] = useState("");

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
    if (!subject.trim()) return toast.warning("Please enter a subject");
    try {
      const { data } = await axios.post(`${CAMP_URL}`, { ...buildPayload(), schedule: { type: "now" } }, { withCredentials: true });
      toast.success(`Newsletter sent to ${data?.sent || 0} subscribers!`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to send newsletter");
    }
  };

  const schedule = async () => {
    if (!subject.trim()) return toast.warning("Please enter a subject");
    try {
      const { data } = await axios.post(`${CAMP_URL}`, buildPayload(), { withCredentials: true });
      toast.success(`Campaign ${data?.status === "scheduled" ? "scheduled" : "saved"} successfully!`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to schedule campaign");
    }
  };

  return (
    <div className="newsletters-page">
      <header>
        <h1><Send size={24} /> Email Newsletters</h1>
        <div className="header-actions">
          <button className="refresh-btn" onClick={load} disabled={loading}>
            <RefreshCw size={18} className={loading ? "spinning" : ""} />
            Refresh
          </button>
          <div className="subscriber-count">
            <Users size={16} />
            <span>{subs.length} subscribers</span>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <Mail size={24} className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{subs.length}</span>
            <span className="stat-label">Total Subscribers</span>
          </div>
        </div>
        <div className="stat-card">
          <Users size={24} className="stat-icon active" />
          <div className="stat-content">
            <span className="stat-value">{subs.filter(s => s.active !== false).length}</span>
            <span className="stat-label">Active Subscribers</span>
          </div>
        </div>
        <div className="stat-card">
          <Send size={24} className="stat-icon ready" />
          <div className="stat-content">
            <span className="stat-value">{subject ? "1" : "0"}</span>
            <span className="stat-label">Ready to Send</span>
          </div>
        </div>
        <div className="stat-card">
          <CalendarClock size={24} className="stat-icon scheduled" />
          <div className="stat-content">
            <span className="stat-value">{mode !== "now" ? "1" : "0"}</span>
            <span className="stat-label">Scheduled</span>
          </div>
        </div>
      </div>

      <div className="newsletter-layout">
        {/* Composer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="composer-section"
        >
          <div className="section-header">
            <Edit2 size={20} />
            <h2>Compose Newsletter</h2>
          </div>
          
          <div className="form-group">
            <label>Email Subject</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Your amazing newsletter subject..."
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Header HTML</label>
            <textarea 
              className="form-textarea code-editor" 
              rows={3}
              placeholder="<h1>Welcome!</h1>"
              value={headerHtml} 
              onChange={(e) => setHeaderHtml(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Body HTML</label>
            <textarea 
              className="form-textarea code-editor" 
              rows={8}
              placeholder="<p>Your newsletter content here...</p>"
              value={bodyHtml} 
              onChange={(e) => setBodyHtml(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Footer HTML</label>
            <textarea 
              className="form-textarea code-editor" 
              rows={3}
              placeholder="<p>© 2025 Your Company</p>"
              value={footerHtml} 
              onChange={(e) => setFooterHtml(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Hero Image URL (Optional)</label>
            <input 
              type="url" 
              className="form-input"
              placeholder="https://example.com/image.jpg"
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)} 
            />
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={sendNow} disabled={!subject.trim()}>
              <Send size={18} />
              Send Now to All
            </button>
            <button className="btn-secondary" onClick={schedule} disabled={!subject.trim()}>
              <CalendarClock size={18} />
              Save & Schedule
            </button>
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Schedule Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="schedule-card"
          >
            <div className="section-header">
              <CalendarClock size={20} />
              <h3>Schedule Campaign</h3>
            </div>

            <div className="form-group">
              <label>Delivery Mode</label>
              <select className="form-select" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="now">Send Immediately</option>
                <option value="once">Schedule Once</option>
                <option value="weekly">Weekly Recurring</option>
                <option value="monthly">Monthly Recurring</option>
                <option value="cron">Advanced (Cron)</option>
              </select>
            </div>

            {mode === "once" && (
              <div className="schedule-option">
                <div className="option-info">
                  <strong>One-Time Send:</strong> Schedule your newsletter for a specific date and time.
                </div>
                <div className="form-group">
                  <label>Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="form-input"
                    value={onceAt} 
                    onChange={(e) => setOnceAt(e.target.value)} 
                  />
                </div>
              </div>
            )}

            {mode === "weekly" && (
              <div className="schedule-option">
                <div className="option-info">
                  <strong>Weekly Send:</strong> Your newsletter will be sent automatically every week.
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Day</label>
                    <select className="form-select" value={weeklyDow} onChange={(e) => setWeeklyDow(e.target.value)}>
                      <option value="0">Sunday</option>
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input 
                      type="time" 
                      className="form-input"
                      value={weeklyTime} 
                      onChange={(e) => setWeeklyTime(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            )}

            {mode === "monthly" && (
              <div className="schedule-option">
                <div className="option-info">
                  <strong>Monthly Send:</strong> Your newsletter will be sent automatically every month.
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Day</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={31} 
                      className="form-input"
                      value={monthlyDom} 
                      onChange={(e) => setMonthlyDom(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input 
                      type="time" 
                      className="form-input"
                      value={monthlyTime} 
                      onChange={(e) => setMonthlyTime(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            )}

            {mode === "cron" && (
              <div className="schedule-option">
                <div className="option-info warning">
                  <strong>Advanced Mode:</strong> Use cron syntax for custom schedules.
                </div>
                <div className="form-group">
                  <label>Cron Expression</label>
                  <input 
                    type="text" 
                    className="form-input code-input"
                    placeholder="0 9 * * 1"
                    value={cronExpr} 
                    onChange={(e) => setCronExpr(e.target.value)} 
                  />
                  <span className="form-hint">Format: minute hour day-of-month month day-of-week</span>
                </div>
              </div>
            )}

            {mode === "now" && (
              <div className="schedule-option">
                <div className="option-info success">
                  <strong>Instant Send:</strong> Newsletter will be sent immediately to all subscribers.
                </div>
              </div>
            )}
          </motion.div>

          {/* Subscribers Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="subscribers-card"
          >
            <div className="section-header">
              <Users size={20} />
              <h3>Subscribers</h3>
              <span className="subscriber-badge">{subs.length}</span>
            </div>

            <div className="subscribers-list">
              {subs.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <p>No subscribers yet</p>
                </div>
              ) : (
                subs.map((s) => (
                  <div key={s._id} className="subscriber-item">
                    <div className="subscriber-info">
                      <div className="subscriber-email">{s.email}</div>
                      <div className="subscriber-date">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                      </div>
                    </div>
                    <span className="status-badge active">Active</span>
                  </div>
                ))
              )}
            </div>

            <a 
              className="download-btn" 
              href={`${SUBS_URL}/export`} 
              target="_blank" 
              rel="noreferrer"
            >
              <Download size={16} />
              Export to CSV
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
