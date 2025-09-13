// src/pages/LoginPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { motion } from "framer-motion";
import axios from 'axios';

const EMAIL_KEY = 'rememberEmail';

// Ensure cookies (refresh token) are sent/stored automatically
axios.defaults.withCredentials = true;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [remember, setRemember] = useState(false);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);

      // Remember email preference
      if (remember) localStorage.setItem(EMAIL_KEY, email);
      else localStorage.removeItem(EMAIL_KEY);

      // Backend login: POST /api/auth/login
      const { data } = await axios.post(
        '/api/auth/login',
        { email: String(email).trim(), password },
        { withCredentials: true } // send/receive cookies (refresh token)
      );

      // Expect: { accessToken, user }
      if (data?.accessToken) {
        sessionStorage.setItem('accessToken', data.accessToken);
      }

      // Optional: preload current user profile (if needed later)
      // const me = await axios.get('/api/users/me', {
      //   headers: { Authorization: `Bearer ${data.accessToken}` }
      // });

      navigate(redirectTo, { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setFormError('Invalid email or password. Please try again.');
      else setFormError('Unable to sign in right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{ background: 'linear-gradient(135deg,#fff1f2,#fff7ed)' }}
    >
      <div className="container">
        <div className="row g-4 align-items-center justify-content-center">
          {/* Brand / Intro (optional image/marketing panel) */}
          <div className="col-12 col-lg-6 d-none d-lg-block">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="p-4 p-lg-5 rounded-4 shadow-sm bg-white"
            >
              <div className="d-flex align-items-center gap-2 mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg,#fb7185,#f59f0b)'
                  }}
                >
                  <span className="text-white fw-bold fs-4">A</span>
                </div>
                <div className="lh-1">
                  <div className="fw-bold fs-5">ArtistryStudio</div>
                  <small className="text-muted">Original Paintings & Art</small>
                </div>
              </div>

              <h2 className="fw-bold mb-2">Welcome Back</h2>
              <p className="text-muted mb-0">
                Sign in to manage orders, track commissions, and personalize the gallery experience.
              </p>

              <hr className="my-4" />

              <ul className="list-unstyled vstack gap-2 small text-muted mb-0">
                <li>• Secure account with email and password</li>
                <li>• Access saved wishlists and cart</li>
                <li>• View workshop enrollments and history</li>
              </ul>
            </motion.div>
          </div>

          {/* Login form */}
          <div className="col-12 col-lg-5">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="card border-0 shadow-sm rounded-4"
            >
              <div className="card-body p-4 p-lg-5">
                <h1 className="h3 fw-bold mb-3">Sign in</h1>
                <p className="text-muted mb-4">
                  Don’t have an account?{' '}
                  <Link to="/signup" className="text-decoration-none">Create one</Link>.
                </p>

                {formError && (
                  <div className="alert alert-danger py-2">{formError}</div>
                )}

                <form onSubmit={onSubmit} noValidate>
                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <Mail size={18} className="text-secondary" />
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <Lock size={18} className="text-secondary" />
                      </span>
                      <input
                        type={showPw ? 'text' : 'password'}
                        className="form-control"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPw((v) => !v)}
                        aria-label={showPw ? 'Hide password' : 'Show password'}
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
                      />
                      <label htmlFor="remember" className="form-check-label small">
                        Remember me
                      </label>
                    </div>

                    <Link to="/forgot-password" className="small text-decoration-none">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-danger rounded-4 d-inline-flex align-items-center justify-content-center gap-2 py-2"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
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

                <p className="small text-muted mt-4 mb-0">
                  By continuing, it is agreed to the{' '}
                  <Link to="/terms" className="text-decoration-none">Terms of Service</Link> and{' '}
                  <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
