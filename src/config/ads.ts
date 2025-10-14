// Ad configuration for ReactiQuiz
export const AD_CONFIG = {
  // Set to true after getting AdSense approval
  ENABLED: false,
  
  // Your AdSense Publisher ID
  AD_SENSE_CLIENT_ID: 'ca-pub-7334752393266414',
  
  // Ad slot IDs (replace with actual slot IDs from AdSense)
  AD_SLOTS: {
    TOP_BANNER: 'YOUR-TOP-BANNER-SLOT',
    BOTTOM_BANNER: 'YOUR-BOTTOM-BANNER-SLOT',
    SIDEBAR: 'YOUR-SIDEBAR-SLOT',
    INLINE: 'YOUR-INLINE-SLOT',
    QUIZ_INTERSTITIAL: 'YOUR-QUIZ-INTERSTITIAL-SLOT',
    RESULTS_PAGE: 'YOUR-RESULTS-PAGE-SLOT'
  },
  
  // Ad placement rules
  PLACEMENT_RULES: {
    // Show ads after every N questions
    QUIZ_AD_FREQUENCY: 3,
    
    // Minimum time between ads (seconds)
    MIN_AD_INTERVAL: 30,
    
    // Don't show ads on first visit
    SKIP_FIRST_VISIT: true,
    
    // Show ads only for non-premium users
    PREMIUM_USERS_EXEMPT: true
  },
  
  // Alternative ad networks (if AdSense is not approved)
  FALLBACK_ADS: {
    MEDIA_NET: {
      enabled: false,
      clientId: 'YOUR-MEDIA-NET-CLIENT-ID'
    },
    PROPELLER_ADS: {
      enabled: false,
      siteId: 'YOUR-PROPELLER-SITE-ID'
    }
  }
};

// Ad revenue optimization settings
export const AD_OPTIMIZATION = {
  // A/B testing for ad placements
  ENABLE_AB_TESTING: true,
  
  // Lazy load ads for better performance
  LAZY_LOAD: true,
  
  // Respect user's ad preferences
  RESPECT_DO_NOT_TRACK: true,
  
  // Show ads only on high-traffic pages
  HIGH_TRAFFIC_ONLY: false,
  MIN_PAGE_VIEWS: 1000
};
