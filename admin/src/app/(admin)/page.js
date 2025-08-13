// admin/src/app/(admin)/page.js
import { Box, Paper, Typography, TextField, Button, Divider } from '@mui/material';

// A reusable component for our settings sections
function SettingsCard({ title, description, children }) {
  return (
    <Paper variant="outlined" sx={{ mb: 3 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 3, backgroundColor: 'rgba(0,0,0,0.1)' }}>
        {children}
      </Box>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <Button variant="contained" disabled>Save</Button>
      </Box>
    </Paper>
  );
}

export default function GeneralSettingsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        General
      </Typography>

      <SettingsCard
        title="Project Name"
        description="Used to identify your Project on the Dashboard, Vercel CLI, and in the URL of your Deployments."
      >
        <TextField
          fullWidth
          defaultValue="reactiquiz"
          InputProps={{
            startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>vercel.com/reactiquizs-projects/</Typography>,
          }}
        />
      </SettingsCard>
      
      <SettingsCard
        title="Project ID"
        description="Used when interacting with the Vercel API."
      >
        <TextField
          fullWidth
          disabled
          defaultValue="prj_..."
        />
      </SettingsCard>
    </Box>
  );
}