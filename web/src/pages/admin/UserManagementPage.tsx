// src/pages/admin/UserManagementPage.tsx
/**
 * User Management Page (Admin Command Center)
 *
 * Modern user management interface with:
 * - Search & Role Filter controls
 * - Styled avatar initials and role indicator chips
 * - Responsive data grid with pagination
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Skeleton,
  TablePagination, TextField, FormControl, InputLabel, Select,
  MenuItem, Chip, Stack, InputAdornment, useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import apiClient from '../../api/axiosInstance';

function UserManagementPage() {
  const theme = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const controller = new AbortController();
    const fetchUsers = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/api/admin/users', { signal: controller.signal });
        setUsers(response.data || []);
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          setError(err.response?.data?.message || 'Failed to fetch user data.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
    return () => controller.abort();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const isAdmin = Boolean(u.isAdmin);
      if (roleFilter === 'admin' && !isAdmin) return false;
      if (roleFilter === 'student' && isAdmin) return false;
      if (!q) return true;
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem' }, fontWeight: 800, mb: 0.5 }}>
          User Directory
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse student accounts, assigned grades, and administrative privileges.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filter Toolbar */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          borderRadius: 2.5,
        }}
      >
        <TextField
          size="small"
          placeholder="Search by name, username or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: '1 1 280px' }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Role Filter</InputLabel>
          <Select
            label="Role Filter"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
          >
            <MenuItem value="all">All Roles ({users.length})</MenuItem>
            <MenuItem value="student">Students ({users.filter(u => !u.isAdmin).length})</MenuItem>
            <MenuItem value="admin">Admins ({users.filter(u => u.isAdmin).length})</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Data Table */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2.5,
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="users data table">
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>User Profile</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Access Role</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Contact Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={4}><Skeleton variant="text" sx={{ width: '100%' }} height={36} /></TableCell>
                  </TableRow>
                ))
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No users found matching your search query.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const initial = (user.name || user.username || '?').charAt(0).toUpperCase();
                  const isAdmin = Boolean(user.isAdmin);

                  return (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              bgcolor: isAdmin ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.text.secondary, 0.1),
                              color: isAdmin ? theme.palette.primary.main : 'text.primary',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 700,
                              fontSize: 14,
                              flexShrink: 0,
                            }}
                          >
                            {initial}
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                              {user.name || user.username}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {user.class ? (
                          <Chip label={`Class ${user.class}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={isAdmin ? <AdminPanelSettingsIcon sx={{ fontSize: '0.9rem !important' }} /> : <PersonOutlineIcon sx={{ fontSize: '0.9rem !important' }} />}
                          label={isAdmin ? 'Admin' : 'Student'}
                          size="small"
                          color={isAdmin ? 'primary' : 'default'}
                          variant={isAdmin ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {user.phone || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>
    </Box>
  );
}

export default UserManagementPage;
