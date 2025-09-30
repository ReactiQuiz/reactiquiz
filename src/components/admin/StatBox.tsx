// src/components/admin/StatBox.js
import { Grid, Paper, Typography, Skeleton } from '@mui/material';

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
