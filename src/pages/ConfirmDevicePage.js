// src/pages/ConfirmDevicePage.js
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button, Paper } from '@mui/material';
import apiClient from '../api/axiosInstance';
import { getOrSetDeviceID } from '../utils/deviceId';

function ConfirmDevicePage({ setCurrentUser }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying...');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const newDeviceId = getOrSetDeviceID();

    if (!token) {
      setError('Device confirmation token is missing.');
      setIsLoading(false);
      return;
    }
    if (!newDeviceId) {
      setError('Could not establish a device ID for this browser.');
      setIsLoading(false);
      return;
    }

    apiClient.post('/api/users/confirm-device-change', { token, newDeviceId })
      .then(response => {
        setStatus(response.data.message || 'Device confirmed and logged in!');
        const userData = {
           id: response.data.user.id,
           name: response.data.user.name, 
           recoveryEmail: response.data.user.recoveryEmail 
        };
        setCurrentUser({ ...userData, token: response.data.token });
        localStorage.setItem('reactiquizUser', JSON.stringify(userData));
        localStorage.setItem('reactiquizToken', response.data.token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setIsLoading(false);
        setTimeout(() => navigate('/account'), 3000); // Redirect after a delay
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to confirm device. The link may be invalid or expired.');
        setIsLoading(false);
      });
  }, [searchParams, navigate, setCurrentUser]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', p:2 }}>
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: '500px' }}>
        <Typography variant="h5" gutterBottom>
          Confirming Device Change
        </Typography>
        {isLoading ? (
          <CircularProgress sx={{ my: 2 }} />
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : (
          <Alert severity="success" sx={{ my: 2 }}>{status}</Alert>
        )}
        <Button variant="contained" onClick={() => navigate('/')} sx={{mt: 2}}>
            Go to Home
        </Button>
      </Paper>
    </Box>
  );
}

export default ConfirmDevicePage;