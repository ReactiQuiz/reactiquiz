// src/hooks/useAds.ts
/**
 * Ads Hook
 * 
 * This hook manages ad configuration, ad blocker detection, and AdSense script loading.
 * It provides functionality to check if ads should be displayed based on configuration
 * and ad blocker presence.
 */
import { useState, useEffect } from 'react';

/**
 * AdConfig Interface
 * 
 * Configuration structure for ad settings, including AdSense client ID
 * and ad slot identifiers for different positions.
 */
interface AdConfig {
  enabled: boolean; // Whether ads are enabled (set to true after AdSense approval)
  adSenseClientId: string; // Google AdSense publisher ID
  adSlots: {
    topBanner: string; // Ad slot ID for top banner position
    bottomBanner: string; // Ad slot ID for bottom banner position
    sidebar: string; // Ad slot ID for sidebar position
    inline: string; // Ad slot ID for inline content position
  };
}

/**
 * useAds Hook
 * 
 * Custom hook that manages ad configuration, detects ad blockers, and provides
 * functionality to load AdSense scripts and determine if ads should be shown.
 * 
 * @returns {object} An object containing:
 *   - adConfig: Current ad configuration object
 *   - isAdBlocked: Boolean indicating if an ad blocker is detected
 *   - showAd: Function to check if ads should be shown for a position
 *   - loadAdSense: Function to dynamically load AdSense script
 *   - setAdConfig: Function to update ad configuration
 */
const useAds = () => {
  // State for ad configuration (enabled/disabled, client ID, slot IDs)
  const [adConfig, setAdConfig] = useState<AdConfig>({
    enabled: false, // Set to true after AdSense approval
    adSenseClientId: 'ca-pub-7334752393266414', // Google AdSense publisher ID
    adSlots: {
      topBanner: 'YOUR-TOP-BANNER-SLOT', // Top banner ad slot ID
      bottomBanner: 'YOUR-BOTTOM-BANNER-SLOT', // Bottom banner ad slot ID
      sidebar: 'YOUR-SIDEBAR-SLOT', // Sidebar ad slot ID
      inline: 'YOUR-INLINE-SLOT' // Inline ad slot ID
    }
  });

  // State for ad blocker detection
  const [isAdBlocked, setIsAdBlocked] = useState(false);

  /**
   * Ad Blocker Detection Effect
   * 
   * Detects if an ad blocker is active by creating a test element with
   * common ad-blocker-detected class names and checking if it gets hidden.
   * This runs once when the component mounts.
   */
  useEffect(() => {
    /**
     * Check Ad Block
     * 
     * Creates a test div element with ad-like properties and checks
     * if it gets hidden by an ad blocker. Ad blockers typically hide
     * elements with classes like 'ads', 'adsbox', etc.
     */
    const checkAdBlock = () => {
      // Create a test element that ad blockers typically hide
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;'; // Non-empty content
      testAd.className = 'adsbox'; // Common class name that ad blockers target
      testAd.style.position = 'absolute'; // Position off-screen
      testAd.style.left = '-999px'; // Move far to the left (off-screen)
      document.body.appendChild(testAd);

      // Check after a short delay if the element was hidden
      setTimeout(() => {
        // If offsetHeight is 0, the element was likely hidden by an ad blocker
        if (testAd.offsetHeight === 0) {
          setIsAdBlocked(true);
        }
        // Clean up the test element
        document.body.removeChild(testAd);
      }, 100);
    };

    checkAdBlock();
  }, []);

  /**
   * Load AdSense Script
   * 
   * Dynamically loads the Google AdSense script if it hasn't been loaded already.
   * This allows ads to be loaded only when needed (lazy loading).
   * 
   * The script is added to the document head with async loading and
   * cross-origin attributes for security.
   */
  const loadAdSense = () => {
    // Only load if AdSense script is not already present
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.async = true; // Load script asynchronously
      // AdSense script URL with client ID parameter
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.adSenseClientId}`;
      script.crossOrigin = 'anonymous'; // CORS setting for security
      document.head.appendChild(script);
    }
  };

  /**
   * Show Ad
   * 
   * Determines if an ad should be shown at a specific position.
   * Ads are only shown if:
   * - Ads are enabled in configuration
   * - No ad blocker is detected
   * 
   * @param {keyof AdConfig['adSlots']} position - The ad position to check
   * @returns {boolean} True if ad should be shown, false otherwise
   */
  const showAd = (position: keyof AdConfig['adSlots']) => {
    return adConfig.enabled && !isAdBlocked;
  };

  return {
    adConfig,
    isAdBlocked,
    showAd,
    loadAdSense,
    setAdConfig
  };
};

export default useAds;
