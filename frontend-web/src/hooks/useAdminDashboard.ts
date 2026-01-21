// src/hooks/useAdminDashboard.ts
/**
 * Admin Dashboard Hook
 * 
 * This hook manages data fetching and state for the admin dashboard,
 * including maintenance mode toggle functionality.
 */
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';
import { useNotifications } from '../contexts/NotificationsContext';

/**
 * AdminDashboardData Interface
 * 
 * Data structure returned from the admin dashboard API.
 * Includes maintenance mode status and other admin-specific data.
 */
interface AdminDashboardData {
    isMaintenanceMode?: boolean; // Whether maintenance mode is currently enabled
    [key: string]: any; // Additional admin dashboard data
}

/**
 * UseAdminDashboardReturn Interface
 * 
 * Return type for the useAdminDashboard hook.
 */
interface UseAdminDashboardReturn {
    dashboardData: AdminDashboardData | null; // Dashboard data from API
    isLoading: boolean; // Loading state for dashboard data
    error: string; // Error message if data fetch fails
    toggleMaintenanceMode: () => Promise<void>; // Function to toggle maintenance mode
}

/**
 * useAdminDashboard Hook
 * 
 * Custom hook that fetches and manages admin dashboard data, including
 * maintenance mode status. Provides functionality to toggle maintenance mode
 * and fetch dashboard statistics.
 * 
 * @returns {UseAdminDashboardReturn} Dashboard data, loading state, error, and toggle function
 */
export function useAdminDashboard(): UseAdminDashboardReturn {
    // State for dashboard data from API
    const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
    // State for loading indicator
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // State for error messages
    const [error, setError] = useState<string>('');
    // Notification context for displaying success/error messages
    const { addNotification } = useNotifications();

    /**
     * Fetch Dashboard Data
     * 
     * Fetches admin dashboard data from the API endpoint.
     * Updates loading state and handles errors appropriately.
     * 
     * This function is memoized with useCallback to prevent unnecessary re-renders.
     */
    const fetchData = useCallback(() => {
        setIsLoading(true);
        apiClient.get('/admin/dashboard')
            .then(response => {
                // Update dashboard data with API response
                setDashboardData(response.data);
            })
            .catch((err: any) => {
                // Extract error message from response or use default
                const message = err.response?.data?.message || 'Failed to load dashboard data.';
                setError(message);
                // Show error notification to admin
                addNotification(message, 'error');
            })
            .finally(() => {
                // Always set loading to false after request completes
                setIsLoading(false);
            });
    }, [addNotification]);

    // Fetch dashboard data when component mounts
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * Toggle Maintenance Mode
     * 
     * Toggles the application's maintenance mode on/off.
     * When maintenance mode is enabled, the application may be inaccessible to regular users.
     * 
     * @returns {Promise<void>} Promise that resolves when maintenance mode is toggled
     */
    const toggleMaintenanceMode = async () => {
        // Don't proceed if dashboard data is not loaded
        if (!dashboardData) return;
        try {
            // Send POST request to toggle maintenance mode
            const response = await apiClient.post('/api/admin/maintenance', {
                enable: !dashboardData.isMaintenanceMode // Toggle to opposite of current state
            });
            // Show success notification
            addNotification(response.data.message, 'success');
            // Re-fetch all data to ensure UI is in sync with the server state
            fetchData(); 
        } catch (err: any) {
            // Extract error message or use default
            const message = err.response?.data?.message || "Failed to update maintenance status.";
            // Show error notification
            addNotification(message, 'error');
        }
    };

    return { dashboardData, isLoading, error, toggleMaintenanceMode };
}