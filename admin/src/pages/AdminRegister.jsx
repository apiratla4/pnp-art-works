
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, User, Phone, UserPlus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const REGISTER_URL = `${API_BASE}/api/auth/admin/register`;

axios.defaults.withCredentials = true;

const AdminRegister = () => {
  const navigate = useNavigate();
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [password, setPass]   = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPw, setShowPw]   = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!name.trim()) { const m = "Please enter full name."; setFormError(m); toast.warning(m); return; }
    if (!email.trim()) { const m = "Please enter a valid email."; setFormError(m); toast.warning(m); return; }
    if (password.length < 8) { const m = "Password must be at least 8 characters."; setFormError(m); toast.warning(m); return; }
    if (password !== confirm) { const m = "Passwords do not match."; setFormError(m); toast.warning(m); return; }

    try {
      setSubmitting(true);
      const { data } = await axios.post(
        REGISTER_URL,
        { name: name.trim(), email: email.trim(), phone: phone.trim(), password },
        { withCredentials: true }
      );
      if (data?.accessToken) sessionStorage.setItem("accessToken", data.accessToken);
      setFormSuccess("Admin account created. Redirecting...");
      toast.success("Admin created");
      setTimeout(() => navigate("/admin", { replace: true }), 800);
    } catch (err) {
      const status = err?.response?.status;
      const m = status === 409 ? "Email already registered." : "Could not create admin. Try again.";
      setFormError(m);
      toast.error(m);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "#f1efef" }}
    >
      <ToastContainer position="top-right" autoClose={2000} newestOnTop />

      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card border-0 shadow rounded-4" style={{ background: "#fff", color: "#000" }}>
          <div className="card-body p-4 p-md-5">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48, background: "#fff", color: "#000", border: "2px solid #000" }}
                aria-hidden="true"
              >
                <span className="fw-bold">A</span>
              </div>
              <div className="lh-1">
                <div className="fw-bold" style={{ color: "#000" }}>Admin</div>
                <small style={{ color: "#000" }}>Create Admin Account</small>
              </div>
            </div>

            <h1 className="h4 fw-bold mb-2" style={{ color: "#000" }}>Admin registration</h1>
            <p className="mb-4" style={{ color: "#000" }}>
              Already have admin access? <Link to="/admin/login" className="text-decoration-none">Sign in</Link>
            </p>

            {formError && <div className="mono-alert py-2">{formError}</div>}
            {formSuccess && <div className="mono-alert py-2">{formSuccess}</div>}

            <form onSubmit={onSubmit} noValidate>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small" style={{ color: "#000" }}>Full name</label>
                  <div className="input-group">
                    <span className="input-group-text" style={{ background: "#fff", color: "#000", borderColor: "#000" }}>
                      <User size={18} />
                    </span>
                    <input
                      className="form-control"
                      placeholder="Admin User"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{ color: "#000", borderColor: "#000" }}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small" style={{ color: "#000" }}>Email</label>
                  <div className="input-group">
                    <span className="input-group-text" style={{ background: "#fff", color: "#000", borderColor: "#000" }}>
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      style={{ color: "#000", borderColor: "#000" }}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small" style={{ color: "#000" }}>Phone (optional)</label>
                  <div className="input-group">
                    <span className="input-group-text" style={{ background: "#fff", color: "#000", borderColor: "#000" }}>
                      <Phone size={18} />
                    </span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      style={{ color: "#000", borderColor: "#000" }}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small" style={{ color: "#000" }}>Password</label>
                  <div className="input-group">
                    <span className="input-group-text" style={{ background: "#fff", color: "#000", borderColor: "#000" }}>
                      <Lock size={18} />
                    </span>
                    <input
                      type={showPw ? "text" : "password"}
                      className="form-control"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPass(e.target.value)}
                      autoComplete="new-password"
                      required
                      style={{ color: "#000", borderColor: "#000" }}
                    />
                    <button
                      type="button"
                      className="mono-btn mono-btn-sm"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small" style={{ color: "#000" }}>Confirm password</label>
                  <div className="input-group">
                    <span className="input-group-text" style={{ background: "#fff", color: "#000", borderColor: "#000" }}>
                      <Lock size={18} />
                    </span>
                    <input
                      type={showPw2 ? "text" : "password"}
                      className="form-control"
                      placeholder="Re-enter password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      required
                      style={{ color: "#000", borderColor: "#000" }}
                    />
                    <button
                      type="button"
                      className="mono-btn mono-btn-sm"
                      onClick={() => setShowPw2((v) => !v)}
                      aria-label={showPw2 ? "Hide password" : "Show password"}
                    >
                      {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="col-12 d-grid">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mono-btn rounded-4 d-inline-flex align-items-center justify-content-center gap-2 py-2"
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        <span>Creating admin...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        <span>Create admin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>

      {/* Local monochrome + focus-visible */}
      <style>{`
        /* Inputs/selects focus in black */
        .form-control:focus {
          border-color: #000 !important;
          box-shadow: none !important;
        }

        /* Monochrome alert (used for both error/success here) */
        .mono-alert {
          border: 1px solid #000;
          background: #fff;
          color: #000;
          border-radius: 10px;
          padding: 8px 12px;
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
        .form-control:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
        }
        .mono-btn:focus, a:focus, .form-control:focus { outline: 2px solid #000; outline-offset: 2px; }
        .mono-btn:focus:not(:focus-visible),
        a:focus:not(:focus-visible),
        .form-control:focus:not(:focus-visible) { outline: none; box-shadow: none; }
      `}</style>
    </div>
  );
};

export default AdminRegister;
