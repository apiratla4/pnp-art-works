
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const LOGIN_URL = `${API_BASE}/api/auth/login`;
const EMAIL_KEY = "adminRememberEmail";

axios.defaults.withCredentials = true;

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/admin";

  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      const msg = "Please enter both email and password.";
      setFormError(msg);
      toast.warning(msg);
      return;
    }

    try {
      setSubmitting(true);

      if (remember) localStorage.setItem(EMAIL_KEY, email);
      else localStorage.removeItem(EMAIL_KEY);

      const { data } = await axios.post(
        LOGIN_URL,
        { email: String(email).trim(), password },
        { withCredentials: true }
      );

      if (data?.accessToken) {
        sessionStorage.setItem("accessToken", data.accessToken);
      }

      toast.success("Signed in successfully");
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 600);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setFormError("Invalid email or password.");
        toast.error("Invalid email or password.");
      } else {
        setFormError("Unable to sign in right now.");
        toast.error("Unable to sign in right now.");
      }
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
      <div className="container" style={{ maxWidth: 480 }}>
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
                <small style={{ color: "#000" }}>Dashboard Access</small>
              </div>
            </div>

            <h1 className="h4 fw-bold mb-2" style={{ color: "#000" }}>Sign in</h1>
            <p className="mb-2" style={{ color: "#000" }}>
              Enter admin credentials to continue to dashboard.{" "}
              <Link to="/" className="text-decoration-none">Back to site</Link>
            </p>
            <p className="mb-4" style={{ color: "#000" }}>
              New admin?{" "}
              <Link to="/admin/register" className="text-decoration-none">Create admin</Link>
            </p>

            {formError && (
              <div className="mono-alert py-2">{formError}</div>
            )}

            <form onSubmit={onSubmit} noValidate>
              {/* Email */}
              <div className="mb-3">
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

              {/* Password */}
              <div className="mb-3">
                <label className="form-label fw-semibold small" style={{ color: "#000" }}>Password</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: "#fff", color: "#000", borderColor: "#000" }}>
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPw ? "text" : "password"}
                    className="form-control"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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

              {/* Row: remember + forgot */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="form-check">
                  <input
                    id="remember"
                    className="form-check-input"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{ accentColor: "#000" }}
                  />
                  <label htmlFor="remember" className="form-check-label small" style={{ color: "#000" }}>
                    Remember me
                  </label>
                </div>

                <span className="small" style={{ color: "#000" }}>Forgot password?</span>
              </div>

              {/* Submit */}
              <div className="d-grid">
                <button
                  type="submit"
                  disabled={submitting}
                  className="mono-btn rounded-4 d-inline-flex align-items-center justify-content-center gap-2 py-2"
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      <span>Sign in</span>
                    </>
                  )}
                </button>
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

        /* Monochrome alert for errors */
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

export default AdminLogin;
