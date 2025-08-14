// src/hooks/useAdminDashboard.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useNotifications } from '../contexts/NotificationsContext';

export function useAdminDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { addNotification } = useNotifications();

    const fetchData = useCallback(() => {
        setIsLoading(true);
        apiClient.get('/admin/dashboard')
            .then(response => {
                setDashboardData(response.data);
            })
            .catch(err => {
                const message = err.response?.data?.message || 'Failed to load dashboard data.';
                setError(message);
                addNotification(message, 'error');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [addNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleMaintenanceMode = async () => {
        if (!dashboardData) return;
        try {
            const response = await apiClient.post('/api/admin/maintenance', {
                enable: !dashboardData.isMaintenanceMode
            });
            addNotification(response.data.message, 'success');
            // Re-fetch all data to ensure UI is in sync with the server state
            fetchData(); 
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update maintenance status.";
            addNotification(message, 'error');
        }
    };

    return { dashboardData, isLoading, error, toggleMaintenanceMode };
}