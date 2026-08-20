// src/config/ads.ts
/**
 * Ad Configuration
 * 
 * This file contains all configuration settings for advertising integration,
 * including Google AdSense settings, ad slot IDs, placement rules, and
 * optimization settings.
 */

/**
 * AD_CONFIG
 * 
 * Main configuration object for advertising features.
 * Controls whether ads are enabled and defines ad slot identifiers.
 */
export const AD_CONFIG = {
  // Set to true after getting AdSense approval
  ENABLED: false,
  
  // Your AdSense Publisher ID (unique identifier for your AdSense account)
  AD_SENSE_CLIENT_ID: 'ca-pub-7334752393266414',
  
  /**
   * Ad Slot IDs
   * 
   * Defines unique slot identifiers for different ad placements throughout the application.
   * These slots need to be created in Google AdSense and the IDs should be replaced
   * with actual slot IDs from your AdSense dashboard.
   * 
   * Available placements:
   * - TOP_BANNER: Header banner ad
   * - BOTTOM_BANNER: Footer banner ad
   * - SIDEBAR: Sidebar ad (if applicable)
   * - INLINE: Inline ad between content sections
   * - QUIZ_INTERSTITIAL: Ad shown between quiz questions
   * - RESULTS_PAGE: Ad on quiz results page
   */
  AD_SLOTS: {
    TOP_BANNER: 'YOUR-TOP-BANNER-SLOT',
    BOTTOM_BANNER: 'YOUR-BOTTOM-BANNER-SLOT',
    SIDEBAR: 'YOUR-SIDEBAR-SLOT',
    INLINE: 'YOUR-INLINE-SLOT',
    QUIZ_INTERSTITIAL: 'YOUR-QUIZ-INTERSTITIAL-SLOT',
    RESULTS_PAGE: 'YOUR-RESULTS-PAGE-SLOT'
  },
  
  /**
   * Ad Placement Rules
   * 
   * Defines rules that control when and where ads are displayed to optimize
   * user experience while maximizing revenue potential.
   */
  PLACEMENT_RULES: {
    // Show ads after every N questions during quiz (e.g., every 3rd question)
    QUIZ_AD_FREQUENCY: 3,
    
    // Minimum time between ads (seconds) to prevent ad overload
    MIN_AD_INTERVAL: 30,
    
    // Don't show ads on first visit to improve first impression
    SKIP_FIRST_VISIT: true,
    
    // Show ads only for non-premium users (premium users get ad-free experience)
    PREMIUM_USERS_EXEMPT: true
  },
  
  /**
   * Alternative Ad Networks
   * 
   * Fallback ad network configurations to use if Google AdSense is not approved
   * or as alternative revenue sources. These networks can be enabled independently
   * and configured with their respective credentials.
   */
  FALLBACK_ADS: {
    // Media.net ad network configuration
    MEDIA_NET: {
      enabled: false, // Set to true to enable Media.net ads
      clientId: 'YOUR-MEDIA-NET-CLIENT-ID' // Replace with your Media.net client ID
    },
    // PropellerAds network configuration
    PROPELLER_ADS: {
      enabled: false, // Set to true to enable PropellerAds
      siteId: 'YOUR-PROPELLER-SITE-ID' // Replace with your PropellerAds site ID
    }
  }
};

/**
 * AD_OPTIMIZATION
 * 
 * Configuration settings for optimizing ad revenue and user experience.
 * These settings control how ads are loaded, displayed, and tested.
 */
export const AD_OPTIMIZATION = {
  // A/B testing for ad placements to find optimal positions
  ENABLE_AB_TESTING: true,
  
  // Lazy load ads for better performance (loads ads as user scrolls)
  LAZY_LOAD: true,
  
  // Respect user's Do Not Track preference (privacy compliance)
  RESPECT_DO_NOT_TRACK: true,
  
  // Show ads only on high-traffic pages to maximize revenue
  HIGH_TRAFFIC_ONLY: false, // Set to true to enable traffic-based ad display
  MIN_PAGE_VIEWS: 1000 // Minimum page views before showing ads (if HIGH_TRAFFIC_ONLY is true)
};
