// admin/src/app/(admin)/users/page.js
import { Box, Paper, Typography } from '@mui/material';

export default function UserManagementPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        User Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          User management features, such as viewing, editing, and deleting users, will be available here in a future update.
        </Typography>
      </Paper>
    </Box>
  );
}