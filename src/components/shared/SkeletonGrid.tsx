// src/components/shared/SkeletonGrid.js
import React from 'react';
import { Grid, Skeleton } from '@mui/material';

/**
 * A reusable component to display a grid of skeleton loaders.
 * @param {object} props
 * @param {number} [props.count=8] - The number of skeletons to display.
 * @param {number} [props.height=220] - The height of each skeleton.
 */
function SkeletonGrid({ count = 8, height = 220 }) {
  return (
    <Grid container spacing={2}>
      {Array.from(new Array(count)).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
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