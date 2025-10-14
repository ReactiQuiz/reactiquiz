import { useState, useEffect } from 'react';

interface AdConfig {
  enabled: boolean;
  adSenseClientId: string;
  adSlots: {
    topBanner: string;
    bottomBanner: string;
    sidebar: string;
    inline: string;
  };
}

const useAds = () => {
  const [adConfig, setAdConfig] = useState<AdConfig>({
    enabled: false, // Set to true after AdSense approval
    adSenseClientId: 'ca-pub-7334752393266414',
    adSlots: {
      topBanner: 'YOUR-TOP-BANNER-SLOT',
      bottomBanner: 'YOUR-BOTTOM-BANNER-SLOT',
      sidebar: 'YOUR-SIDEBAR-SLOT',
      inline: 'YOUR-INLINE-SLOT'
    }
  });

  const [isAdBlocked, setIsAdBlocked] = useState(false);

  useEffect(() => {
    // Check if ad blocker is active
    const checkAdBlock = () => {
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.position = 'absolute';
      testAd.style.left = '-999px';
      document.body.appendChild(testAd);

      setTimeout(() => {
        if (testAd.offsetHeight === 0) {
          setIsAdBlocked(true);
        }
        document.body.removeChild(testAd);
      }, 100);
    };

    checkAdBlock();
  }, []);

  const loadAdSense = () => {
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.adSenseClientId}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  };

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
