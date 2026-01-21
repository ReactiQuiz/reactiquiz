// src/components/core/ScrollToTop.tsx
/**
 * Scroll To Top Component
 * 
 * This component automatically scrolls the page to the top whenever
 * the route changes. This ensures users always see the top of the page
 * when navigating between routes, improving user experience.
 */
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * A component that scrolls the window to the top on route changes.
 * Uses the most cross-browser compatible scroll method. Does not render
 * any visible content - it's purely functional.
 * 
 * @returns {null} This component doesn't render anything
 */
const ScrollToTop: React.FC = () => {
  // Get current pathname from router location
  const { pathname } = useLocation();

  /**
   * Scroll Effect
   * 
   * Scrolls the page to the top whenever the pathname changes.
   * This ensures users see the top of each page when navigating.
   */
  useEffect(() => {
    // "document.documentElement.scrollTo" is the most cross-browser compatible way
    // to scroll to the top of the page
    document.documentElement.scrollTo({
      top: 0, // Scroll to top of page
      left: 0, // Reset horizontal scroll position
      behavior: 'auto' as ScrollBehavior, // Instant scroll (can be changed to 'smooth' for animated scroll)
    });
  }, [pathname]); // This effect will run every time the route changes

  // Component doesn't render anything
  return null;
};

export default ScrollToTop;