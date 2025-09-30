// src/components/topics/TopicSkeletonGrid.js
import { Grid, Skeleton } from '@mui/material';

const TopicSkeletonGrid = () => (
  <Grid container justifyContent="flex-start">
    {Array.from(new Array(8)).map((_, index) => (
      <Grid item key={index} sx={{
        display: 'flex',
        width: { xs: '100%', sm: '49.5%', md: '24.5%', lg: '24.5%', xl: '24.5%' },
        mb: { xs: '0.5%', sm: '0.5%', md: '0.5%', lg: '0.5%', xl: '0.5%' }
      }}>
        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2, width: '100%', m: '0 1%' }} />
        <Grid sx={{ width: { xs: '0%', sm: '1%', md: '2%', lg: '2%', xl: '2%' } }}></Grid>
      </Grid>
    ))}
  </Grid>
);

export default TopicSkeletonGrid;
