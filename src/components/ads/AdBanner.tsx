import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import AdSenseAd from './AdSenseAd';

interface AdBannerProps {
  position?: 'top' | 'bottom' | 'sidebar' | 'inline';
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ position = 'inline', className }) => {
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
      sx={{ 
        p: 2, 
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        border: '1px dashed #ccc',
        ...(className && { className })
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
