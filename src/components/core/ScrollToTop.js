// src/components/core/ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // "document.documentElement.scrollTo" is the most cross-browser compatible way
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // or 'smooth'
    });
  }, [pathname]); // This effect will run every time the route changes

  return null; // This component does not render anything
}

export default ScrollToTop;