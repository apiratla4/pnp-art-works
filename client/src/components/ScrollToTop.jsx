// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ behavior = "instant" }) => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If there is a hash (#section), try to scroll that element into view
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior });
        return;
      }
    }
    // Otherwise scroll to top-left on route/query change
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [pathname, search, hash, behavior]);

  return null;
};

export default ScrollToTop;
