// src/pages/SignupPage.jsx
import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, UserPlus, CheckCircle } from 'lucide-react';
import axios from 'axios';

// Ensure cookies (refresh token) are sent/stored automatically
axios.defaults.withCredentials = true;

const strengthScore = (pw) => {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 5);
};

const strengthLabel = (score) => {
  switch (score) {
    case 0: return 'Too short';
    case 1: return 'Very weak';
    case 2: return 'Weak';
    case 3: return 'Fair';
    case 4: return 'Strong';
    case 5: return 'Very strong';
    default: return '';
  }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  // form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [accept, setAccept]     = useState(false);

  // ui state
  const [showPw, setShowPw]     = useState(false);
  const [showPw2, setShowPw2]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const pwScore = useMemo(() => strengthScore(password), [password]);
  const pwLabel = useMemo(() => strengthLabel(pwScore), [pwScore]);
  const pwPercent = (pwScore / 5) * 100;
  const pwBarClass = pwScore <= 2 ? 'bg-danger' : pwScore === 3 ? 'bg-warning' : 'bg-success';

  const validate = () => {
    if (!fullName.trim()) return 'Please enter full name.';
    if (!EMAIL_RE.test(email)) return 'Please enter a valid email address.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirm) return 'Passwords do not match.';
    if (!accept) return 'Please accept the Terms and Privacy Policy.';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const msg = validate();
    if (msg) {
      setFormError(msg);
      return;
    }

    try {
      setSubmitting(true);
      // Call backend API: POST /api/auth/register
      const { data } = await axios.post(
        '/api/auth/register',
        { name: fullName.trim(), email: email.trim(), phone: phone.trim(), password },
        { withCredentials: true }
      );
      if (data?.accessToken) sessionStorage.setItem('accessToken', data.accessToken);

      setFormSuccess('Account created successfully. Redirecting...');
      setTimeout(() => navigate(redirectTo, { replace: true }), 800);
    } catch (err) {
      const msg = err?.response?.status === 409
        ? 'This email is already registered.'
        : 'Could not create account. Please try again.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg,#fff1f2,#fff7ed)' }}>
      <div className="container">
        <div className="row g-4 align-items-center justify-content-center">
          {/* Marketing / left column (optional) */}
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
                  style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#fb7185,#f59f0b)' }}
                >
                  <span className="text-white fw-bold fs-4">A</span>
                </div>
                <div className="lh-1">
                  <div className="fw-bold fs-5">ArtistryStudio</div>
                  <small className="text-muted">Original Paintings &amp; Art</small>
                </div>
              </div>

              <h2 className="fw-bold mb-2">Create your account</h2>
              <p className="text-muted mb-0">
                Join workshops, track orders and commissions, and personalize the collecting experience.
              </p>

              <hr className="my-4" />

              <ul className="list-unstyled vstack gap-2 small text-muted mb-0">
                <li>• Access member-only previews and limited editions</li>
                <li>• Save wishlists and manage your cart across devices</li>
                <li>• Receive studio news and exhibition invites</li>
              </ul>
            </motion.div>
          </div>

          {/* Signup form */}
          <div className="col-12 col-lg-5">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="card border-0 shadow-sm rounded-4"
            >
              <div className="card-body p-4 p-lg-5">
                <h1 className="h3 fw-bold mb-3">Sign up</h1>
                <p className="text-muted mb-4">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none">Sign in</Link>.
                </p>

                {formError && <div className="alert alert-danger py-2 mb-3">{formError}</div>}
                {formSuccess && (
                  <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3">
                    <CheckCircle size={18} /> <span>{formSuccess}</span>
                  </div>
                )}

                {/* Two-column form layout on md+ */}
                <form onSubmit={onSubmit} className="row g-3" noValidate>
                  {/* Full name */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small">Full name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <User size={18} className="text-secondary" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-12 col-md-6">
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

                  {/* Phone (optional) */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small">Phone (optional)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <Phone size={18} className="text-secondary" />
                      </span>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <Lock size={18} className="text-secondary" />
                      </span>
                      <input
                        type={showPw ? 'text' : 'password'}
                        className="form-control"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
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

                  {/* Strength meter (full width) */}
                  <div className="col-12">
                    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pwPercent}>
                      <div className={`progress-bar ${pwBarClass}`} style={{ width: `${pwPercent}%` }} />
                    </div>
                    <small className="text-muted">{pwLabel}</small>
                  </div>

                  {/* Confirm (full width keeps toggle aligned) */}
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Confirm password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <Lock size={18} className="text-secondary" />
                      </span>
                      <input
                        type={showPw2 ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Re-enter password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPw2((v) => !v)}
                        aria-label={showPw2 ? 'Hide password' : 'Show password'}
                      >
                        {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Terms (full width) */}
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        id="accept"
                        className="form-check-input"
                        type="checkbox"
                        checked={accept}
                        onChange={(e) => setAccept(e.target.checked)}
                        required
                      />
                      <label htmlFor="accept" className="form-check-label small">
                        I agree to the <Link to="/terms" className="text-decoration-none">Terms of Service</Link> and{' '}
                        <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>.
                      </label>
                    </div>
                  </div>

                  {/* Submit (full width) */}
                  <div className="col-12">
                    <div className="d-grid">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-danger rounded-4 d-inline-flex align-items-center justify-content-center gap-2 py-2"
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            <span>Creating account...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={18} />
                            <span>Create account</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
               
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
