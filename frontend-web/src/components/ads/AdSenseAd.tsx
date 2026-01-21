// src/components/ads/AdSenseAd.tsx
/**
 * AdSense Ad Component
 * 
 * This component displays a Google AdSense advertisement.
 * It handles AdSense script loading and ad initialization.
 */
import React, { useEffect } from 'react';

/**
 * AdSenseAdProps Interface
 * 
 * Props for the AdSenseAd component.
 */
interface AdSenseAdProps {
  adSlot: string; // AdSense ad slot ID
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'; // Ad format type
  adStyle?: React.CSSProperties; // Custom CSS styles
  className?: string; // Optional CSS class name
}

/**
 * AdSense Ad Component
 * 
 * Displays a Google AdSense advertisement with:
 * - AdSense script loading
 * - Ad initialization
 * - Customizable ad format
 * - Customizable styling
 * - Error handling
 * - Full-width responsive support
 * 
 * This component is used in AdBanner to render AdSense ads.
 * 
 * @param {AdSenseAdProps} props - Component props
 * @returns {JSX.Element} AdSense ad element
 */
const AdSenseAd: React.FC<AdSenseAdProps> = ({ 
  adSlot, 
  adFormat = 'auto', 
  adStyle = { display: 'block' },
  className 
}) => {
  /**
   * Load AdSense Script Effect
   * 
   * Loads the AdSense script if not already loaded.
   * This effect runs once on mount.
   */
  useEffect(() => {
    // Load AdSense script if not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  /**
   * Initialize Ad Effect
   * 
   * Initializes the AdSense ad after the script is loaded.
   * This effect runs once on mount.
   */
  useEffect(() => {
    try {
      // Initialize the ad
      if (window.adsbygoogle) {
        (window.adsbygoogle as any).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className || ''}`}
      style={adStyle}
      data-ad-client="ca-pub-7334752393266414"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
};

export default AdSenseAd;
