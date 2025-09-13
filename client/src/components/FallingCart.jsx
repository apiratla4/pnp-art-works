// src/components/FallingCart.jsx
import React, { useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./FallingCart.css";

/**
 * Auto-falling cart:
 * - Starts falling on mount and on every route change
 * - Slows while scrolling (modulates playbackRate)
 * - Pauses with ripple on hover/focus
 * - Navigates to /cart on click
 * - Respects prefers-reduced-motion
 */
const FallingCart = ({
  right = 16,
  bottomOffset = 88,
  durationMs = 14000,
  delayMs = 200,
  minRate = 0.15,
  easeBackMs = 400,
  scrollSensitivity = 0.004,
  size = 22,
  navigateTo = "/cart",
  ariaLabel = "Go to cart",
  className = ""
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hostRef = useRef(null);
  const animRef = useRef(null);

  // Scroll velocity tracking
  const lastY = useRef(0);
  const lastT = useRef(0);
  const rafScroll = useRef(0);
  const rafEase = useRef(0);
  const stopTimer = useRef(0);

  const startFall = () => {
    const el = hostRef.current;
    if (!el) return;

    // Respect reduced motion: no falling animation, keep button visible at final position
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduce) {
      el.style.transform = "translateY(0px)";
      if (animRef.current) {
        try { animRef.current.cancel(); } catch {}
        animRef.current = null;
      }
      return;
    }

    // Cancel any previous animation
    if (animRef.current) {
      try { animRef.current.cancel(); } catch {}
      animRef.current = null;
    }

    // Reset transform to start above view for each page
    const startY = -1.01 * Math.max(window.innerHeight, 1);
    el.style.transform = `translateY(${startY}px)`;

    // Create WAAPI animation (translateY: start -> 0)
    const fall = el.animate(
      [{ transform: `translateY(${startY}px)` }, { transform: "translateY(0px)" }],
      {
        duration: durationMs,
        delay: delayMs,
        easing: "cubic-bezier(.22,.61,.36,1)",
        fill: "forwards",
        iterations: 1,
      }
    );

    fall.playbackRate = 1;
    animRef.current = fall;

    // Initialize velocity baseline for this page
    lastY.current = window.scrollY || 0;
    lastT.current = performance.now();
  };

  // Start on mount and on every route change
  useEffect(() => {
    startFall();
    return () => {
      if (animRef.current) {
        try { animRef.current.cancel(); } catch {}
        animRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Scroll-based slowdown: modulate playbackRate via rAF
  useEffect(() => {
    const easeBack = (startRate, startTime) => {
      if (!animRef.current) return;
      const now = performance.now();
      const t = Math.min(1, (now - startTime) / easeBackMs);
      const eased = startRate + (1 - startRate) * t;
      if (animRef.current.updatePlaybackRate) {
        animRef.current.updatePlaybackRate(eased);
      } else {
        animRef.current.playbackRate = eased;
      }
      if (t < 1) {
        rafEase.current = requestAnimationFrame(() => easeBack(startRate, startTime));
      } else {
        rafEase.current = 0;
      }
    };

    const applyRate = (rate) => {
      if (!animRef.current) return;
      animRef.current.playbackRate = rate;
      if (rate === 1) return;
      if (rafEase.current) cancelAnimationFrame(rafEase.current);
      rafEase.current = requestAnimationFrame(() => easeBack(rate, performance.now()));
    };

    const onScroll = () => {
      if (rafScroll.current) return;
      rafScroll.current = requestAnimationFrame(() => {
        rafScroll.current = 0;
        if (!animRef.current) return;

        const y = window.scrollY || 0;
        const t = performance.now();
        if (!lastT.current) {
          lastY.current = y;
          lastT.current = t;
          return;
        }
        const dy = y - lastY.current;
        const dt = Math.max(1, t - lastT.current);
        lastY.current = y;
        lastT.current = t;

        const vel = Math.abs(dy) / dt; // px/ms
        const slowdown = Math.min(0.9, vel / Math.max(0.00001, scrollSensitivity));
        const rate = Math.max(minRate, 1 - slowdown);
        applyRate(rate);

        if (stopTimer.current) clearTimeout(stopTimer.current);
        stopTimer.current = window.setTimeout(() => applyRate(1), 180);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafScroll.current) cancelAnimationFrame(rafScroll.current);
      if (rafEase.current) cancelAnimationFrame(rafEase.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (stopTimer.current) clearTimeout(stopTimer.current);
    };
  }, [easeBackMs, minRate, scrollSensitivity]);

  // Hover/focus to pause visually
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const btn = el.querySelector(".fc-btn");
    if (!btn) return;

    const onEnter = () => { if (animRef.current) animRef.current.playbackRate = 0; };
    const onLeave = () => {
      if (!animRef.current) return;
      if (animRef.current.updatePlaybackRate) animRef.current.updatePlaybackRate(1);
      else animRef.current.playbackRate = 1;
    };

    btn.addEventListener("mouseenter", onEnter);
    btn.addEventListener("focus", onEnter);
    btn.addEventListener("mouseleave", onLeave);
    btn.addEventListener("blur", onLeave);

    return () => {
      btn.removeEventListener("mouseenter", onEnter);
      btn.removeEventListener("focus", onEnter);
      btn.removeEventListener("mouseleave", onLeave);
      btn.removeEventListener("blur", onLeave);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`falling-cart-auto ${className}`}
      style={{ right: `${right}px`, bottom: `${bottomOffset}px` }}
    >
      <button
        type="button"
        className="fc-btn"
        aria-label={ariaLabel}
        onClick={() => navigate(navigateTo)}
      >
        <ShoppingCart size={size} />
        <span className="ripples" aria-hidden="true" />
      </button>
    </div>
  );
};

export default FallingCart;
