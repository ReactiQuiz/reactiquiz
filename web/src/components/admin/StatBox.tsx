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
      <Paper
        sx={{
          p: 2.5,
          textAlign: 'center',
          borderRadius: 2,
          border: (t) => `1px solid ${t.palette.divider}`,
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          '&:hover': {
            borderColor: (t) => t.palette.mode === 'light' ? '#CBD5E1' : '#475569',
            boxShadow: (t) => t.palette.mode === 'light' ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          }
        }}
      >
        {isLoading ? (
          <Skeleton variant="text" width={80} height={48} sx={{ mx: 'auto' }} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {typeof value === 'number' ? value.toLocaleString() : '...'}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {title}
        </Typography>
      </Paper>
    </Grid>
  );
}

export default StatBox;
