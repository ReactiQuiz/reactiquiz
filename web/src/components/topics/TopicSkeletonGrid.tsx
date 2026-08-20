// src/components/topics/TopicSkeletonGrid.tsx
/**
 * Topic Skeleton Grid Component
 * 
 * This component displays a responsive grid of skeleton loaders
 * for topic cards. It shows placeholder content while topics are
 * being loaded, with responsive layout adjustments.
 */
import { Grid, Skeleton } from '@mui/material';

/**
 * Topic Skeleton Grid Component
 * 
 * Displays a responsive grid of skeleton loaders for topic cards.
 * The grid adapts to different screen sizes:
 * - xs (mobile): 1 column (100% width)
 * - sm (tablet): 2 columns (49.5% width each)
 * - md (desktop): 4 columns (24.5% width each)
 * - lg (large desktop): 4 columns (24.5% width each)
 * - xl (extra large): 4 columns (24.5% width each)
 * 
 * This component is used on the SubjectTopicsPage to show loading
 * states while topics are being fetched from the API.
 * 
 * @returns {JSX.Element} Grid of topic skeleton loaders
 */
const TopicSkeletonGrid = () => (
  <Grid container justifyContent="flex-start">
    {/* Generate 8 skeleton loaders */}
    {Array.from(new Array(8)).map((_, index) => (
      <Grid 
        item 
        key={index} 
        sx={{
          display: 'flex',
          // Responsive width based on screen size
          width: { 
            xs: '100%',        // 1 column on mobile
            sm: '49.5%',       // 2 columns on tablet
            md: '24.5%',      // 4 columns on desktop
            lg: '24.5%',      // 4 columns on large desktop
            xl: '24.5%'       // 4 columns on extra large
          },
          // Responsive margin bottom
          mb: { 
            xs: '0.5%', 
            sm: '0.5%', 
            md: '0.5%', 
            lg: '0.5%', 
            xl: '0.5%' 
          }
        }}
      >
        {/* Skeleton Loader - Rectangular shape matching topic card */}
        <Skeleton 
          variant="rectangular" 
          height={250} 
          sx={{ 
            borderRadius: 2, // Rounded corners
            width: '100%', 
            m: '0 1%' // Margin
          }} 
        />
        
        {/* Spacer Grid - Provides spacing between cards on larger screens */}
        <Grid sx={{ 
          width: { 
            xs: '0%',    // No spacer on mobile
            sm: '1%',    // Small spacer on tablet
            md: '2%',    // Larger spacer on desktop
            lg: '2%', 
            xl: '2%' 
          } 
        }}>
        </Grid>
      </Grid>
    ))}
  </Grid>
);

export default TopicSkeletonGrid;
