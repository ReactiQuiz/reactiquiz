// src/components/shared/SkeletonGrid.js
import React from 'react';
import { Grid, Skeleton } from '@mui/material';

/**
 * A reusable component to display a grid of skeleton loaders.
 * Perfect for pages that load content into cards.
 * @param {object} props
 * @param {number} [props.count=8] - The number of skeleton cards to display.
 * @param {object} [props.gridItemProps] - Props to pass to each Grid item for custom layout (e.g., { xs: 12, sm: 4 }).
 * @param {number} [props.height=200] - The height of each skeleton card.
 */
function SkeletonGrid({ count = 8, gridItemProps, height = 200 }) {
  // Define the default layout for a grid item
  const defaultGridProps = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3
  };

  // Merge default props with any custom props passed in
  const finalGridProps = { ...defaultGridProps, ...gridItemProps };

  return (
    <Grid container spacing={2}>
      {Array.from(new Array(count)).map((_, index) => (
        <Grid item {...finalGridProps} key={index}>
          <Skeleton 
            variant="rectangular" 
            sx={{ borderRadius: 2 }} 
            height={height} 
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default SkeletonGrid;