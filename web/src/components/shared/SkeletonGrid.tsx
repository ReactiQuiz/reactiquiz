// src/components/shared/SkeletonGrid.tsx
/**
 * Skeleton Grid Component
 * 
 * This component displays a grid of skeleton loaders for displaying
 * loading states. It's a reusable component that shows placeholder
 * content while data is being fetched.
 */
import React from 'react';
import { Grid, Skeleton } from '@mui/material';

/**
 * Skeleton Grid Component
 * 
 * Displays a responsive grid of skeleton loaders. The grid adapts
 * to different screen sizes:
 * - xs (mobile): 1 column
 * - sm (tablet): 2 columns
 * - md (desktop): 3 columns
 * - lg (large desktop): 4 columns
 * 
 * This component is used throughout the application to show loading
 * states for lists, cards, and other grid-based content.
 * 
 * @param {Object} props - Component props
 * @param {number} [props.count=8] - The number of skeleton loaders to display
 * @param {number} [props.height=220] - The height of each skeleton in pixels
 * @returns {JSX.Element} Grid of skeleton loaders
 */
function SkeletonGrid({ count = 8, height = 220 }) {
  return (
    <Grid container spacing={2}>
      {/* Generate skeleton loaders based on count */}
      {Array.from(new Array(count)).map((_, index) => (
        <Grid 
          item 
          xs={12}   // 1 column on mobile
          sm={6}    // 2 columns on tablet
          md={4}    // 3 columns on desktop
          lg={3}    // 4 columns on large desktop
          key={index}
        >
          <Skeleton 
            variant="rectangular" // Rectangular skeleton shape
            sx={{ borderRadius: 2 }} // Rounded corners
            height={height} // Set height
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default SkeletonGrid;