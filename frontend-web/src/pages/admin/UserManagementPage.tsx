// src/pages/admin/UserManagementPage.tsx
/**
 * User Management Page (Admin)
 * 
 * This page displays all registered users in a table format with
 * pagination. Provides admins with a view of all user accounts
 * including username, email, phone, and class information.
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Skeleton,
  TablePagination
} from '@mui/material';
import apiClient from '../../api/axiosInstance';

/**
 * User Management Page Component
 * 
 * Displays user management interface with:
 * - Users table with pagination
 * - User information columns (username, email, phone, class)
 * - Loading skeleton states
 * - Error message display
 * - Pagination controls (5, 10, 25 rows per page)
 * - AbortController for request cancellation
 * - Responsive table layout
 * 
 * This page is only accessible to admin users. Fetches
 * all registered users from the admin API endpoint.
 * 
 * @returns {JSX.Element} User management page with user table
 */
function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /**
   * Fetch Users Effect
   * 
   * Fetches all users from the API:
   * - Creates AbortController for request cancellation
   * - Fetches user list from admin endpoint
   * - Handles errors (excluding cancellation)
   * - Cleans up on unmount to prevent memory leaks
   * 
   * Uses AbortController to properly cancel requests when
   * component unmounts, preventing state updates on unmounted components.
   */
  useEffect(() => {
    const controller = new AbortController();

    /**
     * Fetch Users
     * 
     * Fetches all registered users from the admin API endpoint.
     * Handles loading states and errors appropriately.
     */
    const fetchUsers = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/api/admin/users', {
            signal: controller.signal,
        });
        setUsers(response.data);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
            setError(err.response?.data?.message || 'Failed to fetch user data.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();

    return () => {
        controller.abort();
    };
  }, []);
  // --- END OF THE DEFINITIVE FIX ---

  /**
   * Handle Change Page
   * 
   * Updates the current page when user navigates pagination.
   * 
   * @param {any} event - Change event
   * @param {number} newPage - New page number (0-indexed)
   */
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  /**
   * Handle Change Rows Per Page
   * 
   * Updates the number of rows displayed per page and resets to first page.
   * 
   * @param {any} event - Change event with target.value
   */
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        User Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined">
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="user table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={4}>
                      <Skeleton variant="text" sx={{ width: '100%' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>{user.class || 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}

export default UserManagementPage;