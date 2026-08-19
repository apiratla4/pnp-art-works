import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Send, RefreshCw, Users, CalendarClock, Mail, Download, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const SUBS_URL = `${API_BASE}/api/newsletters/subscribers`;
const CAMP_URL = `${API_BASE}/api/newsletters/campaigns`;

axios.defaults.withCredentials = true;

const PAGE_SIZE = 10;

const NewslettersPage = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

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

  // Load
  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(SUBS_URL);
      setSubs(Array.isArray(data?.items) ? data.items : []);
      setPage(1);
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const buildPayload = (overrideSchedule) => {
    const payload = {
      subject,
      headerHtml,
      bodyHtml,
      footerHtml,
      imageUrl: imageUrl?.trim() || null,
      schedule: { type: mode }
    };
    if (overrideSchedule) payload.schedule = overrideSchedule;
    if (mode === "once" && onceAt) payload.schedule.when = new Date(onceAt).toISOString();
    if (mode === "weekly") payload.schedule.weekly = { dow: Number(weeklyDow), time: weeklyTime };
    if (mode === "monthly") payload.schedule.monthly = { dom: Number(monthlyDom), time: monthlyTime };
    if (mode === "cron" && cronExpr) payload.schedule.cron = cronExpr;
    return payload;
  };

  const sendNow = async () => {
    if (!subject.trim()) return toast.warning("Please enter a subject");
    try {
      toast.info("Sending newsletter, please wait...");
      const { data } = await axios.post(
        `${CAMP_URL}`,
        buildPayload({ type: "now" }),
        { withCredentials: true }
      );
      toast.success(`Newsletter sent to ${data?.sent || 0} subscribers!`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to send newsletter");
    }
  };

  const scheduleCampaign = async () => {
    if (!subject.trim()) return toast.warning("Please enter a subject");
    try {
      const { data } = await axios.post(
        `${CAMP_URL}`,
        buildPayload(),
        { withCredentials: true }
      );
      toast.success(`Campaign ${data?.status === "scheduled" ? "scheduled" : "saved"} successfully!`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to schedule campaign");
    }
  };

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(subs.length / PAGE_SIZE));
  const pageSubs = subs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto w-full p-2">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-7">
        <div className="flex items-center gap-3">
          <Send size={28} className="text-black" />
          <h1 className="text-2xl font-black text-black mb-0">Email Newsletters</h1>
        </div>
        <div className="flex gap-4 items-center">
          <button className="btn-mono-sm flex items-center gap-1" onClick={load} disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <span className="flex gap-2 items-center text-gray-700 text-sm">
            <Users size={16} />
            {subs.length} subscribers
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
        <div className="rounded-xl border border-black/10 shadow bg-white p-5 flex flex-col items-center">
          <Mail size={24} className="mb-2" />
          <span className="text-2xl font-extrabold">{subs.length}</span>
          <span className="text-xs text-gray-500 font-medium">Total Subscribers</span>
        </div>
        <div className="rounded-xl border border-black/10 shadow bg-white p-5 flex flex-col items-center">
          <Users size={24} className="mb-2" />
          <span className="text-2xl font-extrabold">{subs.filter(s => s.active !== false).length}</span>
          <span className="text-xs text-gray-500 font-medium">Active Subscribers</span>
        </div>
        <div className="rounded-xl border border-black/10 shadow bg-white p-5 flex flex-col items-center">
          <Send size={24} className="mb-2" />
          <span className="text-2xl font-extrabold">{subject ? "1" : "0"}</span>
          <span className="text-xs text-gray-500 font-medium">Ready to Send</span>
        </div>
        <div className="rounded-xl border border-black/10 shadow bg-white p-5 flex flex-col items-center">
          <CalendarClock size={24} className="mb-2" />
          <span className="text-2xl font-extrabold">{mode !== "now" ? "1" : "0"}</span>
          <span className="text-xs text-gray-500 font-medium">Scheduled</span>
        </div>
      </div>

      {/* Layout: Editor + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Composer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-w-0 bg-white border border-black/10 shadow rounded-2xl p-6 mb-6 lg:mb-0"
        >
          <div className="flex gap-2 items-center mb-6">
            <Edit2 size={20} />
            <h2 className="font-bold text-xl mb-0">Compose Newsletter</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-semibold text-sm mb-1">Email Subject</label>
              <input
                type="text"
                className="w-full rounded-lg border-black border px-3 py-2 focus:ring-2 focus:ring-black"
                placeholder="Your amazing newsletter subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">Header HTML</label>
              <textarea
                className="w-full rounded-lg border-black border px-3 py-2 font-mono focus:ring-2 focus:ring-black"
                rows={3}
                placeholder="<h1>Welcome!</h1>"
                value={headerHtml}
                onChange={(e) => setHeaderHtml(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">Body HTML</label>
              <textarea
                className="w-full rounded-lg border-black border px-3 py-2 font-mono focus:ring-2 focus:ring-black"
                rows={8}
                placeholder="<p>Your newsletter content here...</p>"
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">Footer HTML</label>
              <textarea
                className="w-full rounded-lg border-black border px-3 py-2 font-mono focus:ring-2 focus:ring-black"
                rows={3}
                placeholder="<p>© 2025 Your Company</p>"
                value={footerHtml}
                onChange={(e) => setFooterHtml(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1">Hero Image URL (Optional)</label>
              <input
                type="url"
                className="w-full rounded-lg border-black border px-3 py-2 focus:ring-2 focus:ring-black"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <button className="btn-mono-sm flex-1" type="button" onClick={sendNow} disabled={!subject.trim()}>
              <Send size={18} />
              Send Now to All
            </button>
            <button className="btn-mono-sm flex-1" type="button" onClick={scheduleCampaign} disabled={!subject.trim()}>
              <CalendarClock size={18} />
              Save & Schedule
            </button>
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="flex flex-col gap-7 w-full lg:w-[320px] shrink-0">
          {/* Schedule Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-black/10 shadow rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock size={20} />
              <h3 className="font-bold text-lg">Schedule Campaign</h3>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Delivery Mode</label>
              <select className="w-full rounded-lg border border-black px-3 py-2 bg-white"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="now">Send Immediately</option>
                <option value="once">Schedule Once</option>
                <option value="weekly">Weekly Recurring</option>
                <option value="monthly">Monthly Recurring</option>
                <option value="cron">Advanced (Cron)</option>
              </select>
            </div>
            {mode === "once" && (
              <div>
                <div className="font-medium text-xs mb-2">One-Time Send</div>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border-black border px-3 py-2 focus:ring-2 focus:ring-black"
                  value={onceAt}
                  onChange={(e) => setOnceAt(e.target.value)}
                />
              </div>
            )}
            {mode === "weekly" && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">Day</label>
                  <select className="w-full rounded-lg border-black border px-3 py-2"
                    value={weeklyDow}
                    onChange={(e) => setWeeklyDow(e.target.value)}
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full rounded-lg border-black border px-3 py-2"
                    value={weeklyTime}
                    onChange={(e) => setWeeklyTime(e.target.value)}
                  />
                </div>
              </div>
            )}
            {mode === "monthly" && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">Day</label>
                  <input
                    type="number" min={1} max={31}
                    className="w-full rounded-lg border-black border px-3 py-2"
                    value={monthlyDom}
                    onChange={(e) => setMonthlyDom(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full rounded-lg border-black border px-3 py-2"
                    value={monthlyTime}
                    onChange={(e) => setMonthlyTime(e.target.value)}
                  />
                </div>
              </div>
            )}
            {mode === "cron" && (
              <div>
                <span className="block text-xs mb-1 text-gray-500">Cron Syntax</span>
                <input
                  type="text"
                  className="w-full rounded-lg border-black border px-3 py-2 font-mono"
                  placeholder="0 9 * * 1"
                  value={cronExpr}
                  onChange={(e) => setCronExpr(e.target.value)}
                />
                <span className="block text-xs mt-1 text-gray-400">Format: min hour dom mon dow</span>
              </div>
            )}
          </motion.div>
          {/* Subscribers Card with Pagination */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-black/10 shadow rounded-2xl p-5 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users size={20} />
              <h3 className="font-bold text-lg">Subscribers</h3>
              <span className="ml-auto rounded-full px-2 bg-black text-white text-xs font-bold">{subs.length}</span>
            </div>
            <div className="flex flex-col gap-1 max-h-56 overflow-y-auto mb-3">
              {subs.length === 0 ? (
                <div className="flex flex-col items-center text-gray-400 py-7">
                  <Users size={40} className="mb-1" />
                  <span className="text-sm">No subscribers yet</span>
                </div>
              ) : (
                pageSubs.map((s) => (
                  <div key={s._id} className="flex items-center gap-2 border-b last:border-0 border-black/10 py-1">
                    <Mail size={14} className="opacity-70" />
                    <span className="font-mono text-xs break-all">{s.email}</span>
                    <span className="ml-auto text-xs text-gray-400">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                ))
              )}
            </div>
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 my-2 select-none text-base font-bold">
                <button
                  className="px-2 py-1 rounded hover:bg-black hover:text-white transition"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  aria-label="Previous Page"
                  type="button"
                >
                  <ChevronLeft size={20} />
                </button>
                <span>
                  Page {page} / {totalPages}
                </span>
                <button
                  className="px-2 py-1 rounded hover:bg-black hover:text-white transition"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Next Page"
                  type="button"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
            <a
              className="btn-mono-sm mt-1 flex items-center gap-2 justify-center"
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
      <style>{`
        .btn-mono-sm {
          border: 1.5px solid #000;
          background: #fff;
          color: #000;
          border-radius: 9999px;
          padding: 7px 16px;
          font-weight: 700;
          font-size: 1.09em;
          transition: all .16s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-mono-sm:hover, .btn-mono-sm:focus {
          background: #000;
          color: #fff;
        }
        .btn-mono-sm:active { transform: scale(0.97); }
        .btn-mono-sm:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
      `}</style>
    </div>
  );
};

export default NewslettersPage;
