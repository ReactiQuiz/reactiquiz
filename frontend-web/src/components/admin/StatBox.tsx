// src/components/admin/StatBox.tsx
/**
 * Stat Box Component
 * 
 * This component displays a statistics box for admin dashboard.
 * It shows a value with title and supports loading state.
 */
import { Grid, Paper, Typography, Skeleton } from '@mui/material';

/**
 * Stat Box Component
 * 
 * Displays a stat box with:
 * - Value display (with number formatting)
 * - Title text
 * - Loading skeleton state
 * - Responsive grid layout
 * 
 * This component is used on admin dashboard pages to display
 * statistics in a card format.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title text for the stat
 * @param {number} props.value - Numeric value to display
 * @param {boolean} props.isLoading - Whether data is loading
 * @returns {JSX.Element} Stat box card with value and title
 */
function StatBox({ title, value, isLoading }) {
  return (
    <Grid item xs={12} sm={4}>
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        {isLoading ? (
          <Skeleton variant="text" width={80} height={48} sx={{ mx: 'auto' }} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {typeof value === 'number' ? value.toLocaleString() : '...'}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Paper>
    </Grid>
  );
}

export default StatBox;
