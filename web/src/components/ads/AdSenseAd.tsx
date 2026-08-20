// src/components/ads/AdSenseAd.tsx
/**
 * AdSense Ad Component
 *
 * Displays a Google AdSense advertisement. The adsbygoogle script itself is
 * loaded once, globally, in public/index.html — this component only pushes
 * an ad request for its own <ins> element, and does so at most once per
 * mount (guarded with a ref) since React StrictMode's double-invoked effects
 * would otherwise call push() twice for the same element, which AdSense
 * rejects with "already have ads in them".
 */
import React, { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  adStyle?: React.CSSProperties;
  className?: string;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({
  adSlot,
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className
}) => {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle as any).push({});
        pushedRef.current = true;
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
