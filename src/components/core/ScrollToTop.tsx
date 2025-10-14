// src/components/core/ScrollToTop.tsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // "document.documentElement.scrollTo" is the most cross-browser compatible way
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' as ScrollBehavior, // or 'smooth'
    });
  }, [pathname]); // This effect will run every time the route changes

  return null; // This component does not render anything
};

export default ScrollToTop;