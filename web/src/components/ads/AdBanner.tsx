// src/components/ads/AdBanner.tsx
/**
 * Ad Banner Component
 * 
 * This component displays an ad banner wrapper that positions
 * and styles AdSense ads based on position. It includes styling
 * for different ad positions (top, bottom, sidebar, inline).
 */
import React from 'react';
import { Paper, Typography } from '@mui/material';
import AdSenseAd from './AdSenseAd';

/**
 * AdBannerProps Interface
 * 
 * Props for the AdBanner component.
 */
interface AdBannerProps {
  position?: 'top' | 'bottom' | 'sidebar' | 'inline'; // Position of the ad banner
  className?: string; // Optional CSS class name
}

/**
 * Ad Banner Component
 * 
 * Displays an ad banner wrapper with:
 * - Position-based ad slot selection
 * - Position-based styling (dimensions and layout)
 * - AdSense ad integration
 * - Advertisement label
 * - Responsive styling
 * 
 * This component is used throughout the application to display
 * ads in different positions.
 * 
 * @param {AdBannerProps} props - Component props
 * @returns {JSX.Element} Ad banner wrapper with AdSense ad
 */
const AdBanner: React.FC<AdBannerProps> = ({ position = 'inline', className }) => {
  /**
   * Get Ad Slot
   * 
   * Returns the ad slot ID based on position.
   * 
   * @returns {string} Ad slot ID
   */
  // TODO: these are placeholder slot IDs, not real AdSense ad units — ads can
  // never actually serve until they're replaced with real slot IDs from the
  // AdSense dashboard for publisher ca-pub-7334752393266414 (see AdSenseAd.tsx).
  const getAdSlot = () => {
    switch (position) {
      case 'top':
        return 'YOUR-TOP-BANNER-SLOT';
      case 'bottom':
        return 'YOUR-BOTTOM-BANNER-SLOT';
      case 'sidebar':
        return 'YOUR-SIDEBAR-SLOT';
      default:
        return 'YOUR-INLINE-SLOT';
    }
  };

  /**
   * Get Ad Style
   * 
   * Returns styling object based on ad position.
   * Different positions have different dimensions and layouts.
   * 
   * @returns {React.CSSProperties} Style object for the ad
   */
  const getAdStyle = () => {
    switch (position) {
      case 'top':
      case 'bottom':
        return { 
          display: 'block',
          width: '100%',
          maxWidth: '728px',
          height: '90px',
          margin: '0 auto'
        };
      case 'sidebar':
        return {
          display: 'block',
          width: '300px',
          height: '250px'
        };
      default:
        return {
          display: 'block',
          width: '100%',
          maxWidth: '728px',
          height: '90px',
          margin: '20px auto'
        };
    }
  };

  return (
    <Paper
      elevation={1}
      className={className}
      sx={{
        p: 2,
        textAlign: 'center',
        backgroundColor: 'action.hover',
        border: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Advertisement
      </Typography>
      <AdSenseAd 
        adSlot={getAdSlot()}
        adStyle={getAdStyle()}
      />
    </Paper>
  );
};

export default AdBanner;
