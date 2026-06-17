import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Chip,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Skeleton,
  Paper,
  Button,
  Grid,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import ReadIcon from '@mui/icons-material/Drafts';
import UnreadIcon from '@mui/icons-material/MarkEmailUnread';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterIcon from '@mui/icons-material/FilterList';
import EventIcon from '@mui/icons-material/Campaign';
import ResultIcon from '@mui/icons-material/AssignmentTurnedIn';
import PlacementIcon from '@mui/icons-material/Work';
import WarnIcon from '@mui/icons-material/NotificationImportant';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { fetchNotifications, markAsReadInApi, markAsUnreadInApi, deleteNotificationInApi } from '../services/api';
import logger from '../middleware/logger';

const Notifications = ({ triggerRefresh, onRefreshComplete }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract values from query params with default values
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 5;
  const typeFilter = searchParams.get('notification_type') || 'All';
  const searchQuery = searchParams.get('search') || '';

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 5,
    totalCount: 0
  });

  // Keep local search input field text synchronized with URL search parameter changes
  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  // Fetch notifications based on current query parameters
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetchNotifications({
        page,
        limit,
        notification_type: typeFilter,
        search: searchQuery
      });
      if (response && response.success) {
        setNotifications(response.data);
        setPaginationInfo(response.pagination);
      }
    } catch (err) {
      logger.error('UI_ERROR', 'Failed to retrieve notifications in component', err);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount, search param changes, or when parent triggers refresh (e.g., simulated real-time event)
  useEffect(() => {
    loadNotifications();
  }, [page, limit, typeFilter, searchQuery, triggerRefresh]);

  // Handle tab filter change
  const handleTabChange = (event, newValue) => {
    logger.info('UI_ACTION', `Changed filter tab to: ${newValue}`);
    const params = {
      page: 1,
      limit,
      notification_type: newValue
    };
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    logger.info('UI_ACTION', `Navigated to page: ${newPage}`);
    const params = {
      page: newPage,
      limit,
      notification_type: typeFilter
    };
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
  };

  // Handle limit change
  const handleLimitChange = (event) => {
    const newLimit = event.target.value;
    logger.info('UI_ACTION', `Changed page size limit to: ${newLimit}`);
    const params = {
      page: 1,
      limit: newLimit,
      notification_type: typeFilter
    };
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
  };

  // Handle search text query change
  const handleSearchChange = (event) => {
    const val = event.target.value;
    setSearchTerm(val);
    const params = {
      page: 1,
      limit,
      notification_type: typeFilter
    };
    if (val) params.search = val;
    setSearchParams(params);
  };

  // Clear search filter
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchParams({
      page: 1,
      limit,
      notification_type: typeFilter
    });
  };

  // Mark single as read
  const handleMarkAsRead = async (id) => {
    await markAsReadInApi(id);
    loadNotifications();
    if (onRefreshComplete) onRefreshComplete();
  };

  // Mark single as unread
  const handleMarkAsUnread = async (id) => {
    await markAsUnreadInApi(id);
    loadNotifications();
    if (onRefreshComplete) onRefreshComplete();
  };

  // Delete single
  const handleMarkAsDelete = async (id) => {
    await deleteNotificationInApi(id);
    loadNotifications();
    if (onRefreshComplete) onRefreshComplete();
  };

  // Mark all on current page as read
  const handleMarkAllRead = async () => {
    logger.info('UI_ACTION', 'Marking all page notifications as read');
    const unreadOnPage = notifications.filter(n => !n.isRead);
    await Promise.all(unreadOnPage.map(n => markAsReadInApi(n.id)));
    loadNotifications();
    if (onRefreshComplete) onRefreshComplete();
  };

  // Helper colors and icons
  const getTypeConfig = (type) => {
    switch (type) {
      case 'Placement':
        return { color: '#a78bfa', label: 'Placement', icon: <PlacementIcon sx={{ color: '#a78bfa' }} />, border: 'rgba(167, 139, 250, 0.4)' };
      case 'Result':
        return { color: '#34d399', label: 'Result', icon: <ResultIcon sx={{ color: '#34d399' }} />, border: 'rgba(52, 211, 153, 0.4)' };
      default:
        return { color: '#fbbf24', label: 'Event', icon: <EventIcon sx={{ color: '#fbbf24' }} />, border: 'rgba(251, 191, 36, 0.4)' };
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            All Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage, filter, and review all updates from the university.
          </Typography>
        </Box>

        {notifications.some(n => !n.isRead) && (
          <Button
            variant="text"
            color="primary"
            size="small"
            startIcon={<ReadIcon />}
            onClick={handleMarkAllRead}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            Mark Page as Read
          </Button>
        )}
      </Box>

      {/* Search Input Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search notifications by keywords..."
        value={searchTerm}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClearSearch} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: 'divider',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          }
        }}
      />

      {/* Filter Tabs & Limit Selector */}
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 1, 
          mb: 3, 
          backgroundColor: 'background.paper', 
          borderColor: 'divider', 
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Tabs 
          value={typeFilter} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              minWidth: 90,
              fontSize: '0.9rem'
            }
          }}
        >
          <Tab value="All" label="All" />
          <Tab value="Placement" label="Placements" />
          <Tab value="Result" label="Results" />
          <Tab value="Event" label="Events" />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FilterIcon sx={{ fontSize: 16 }} /> Size:
          </Typography>
          <FormControl size="small" variant="standard">
            <Select
              value={limit}
              onChange={handleLimitChange}
              sx={{ 
                color: 'text.primary',
                fontWeight: 600,
                '&:before': { borderBottomColor: 'divider' },
                '&:after': { borderBottomColor: '#4f46e5' }
              }}
            >
              <MenuItem value={5}>5 items</MenuItem>
              <MenuItem value={10}>10 items</MenuItem>
              <MenuItem value={20}>20 items</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Notifications Grid */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        {loading ? (
          // Skeleton loaders during fetch
          Array.from(new Array(limit)).map((_, idx) => (
            <Card key={idx} sx={{ backgroundColor: 'background.paper', borderColor: 'divider' }}>
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(0,0,0,0.05)' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton width="40%" height={24} sx={{ bgcolor: 'rgba(0,0,0,0.05)' }} />
                  <Skeleton width="80%" height={20} sx={{ bgcolor: 'rgba(0,0,0,0.05)', mt: 1 }} />
                </Box>
              </CardContent>
            </Card>
          ))
        ) : notifications.length === 0 ? (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              backgroundColor: 'background.paper', 
              borderColor: 'divider', 
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.8
            }}
          >
            <WarnIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>No notifications found</Typography>
            <Typography variant="body2" color="text.secondary">
              There are no notifications matching the filters at this moment.
            </Typography>
          </Paper>
        ) : (
          notifications.map((notif) => {
            const config = getTypeConfig(notif.type);
            return (
              <Card 
                key={notif.id}
                variant="outlined"
                sx={{
                  position: 'relative',
                  backgroundColor: 'background.paper',
                  borderColor: notif.isRead ? 'divider' : config.color,
                  boxShadow: notif.isRead ? 'none' : `0 0 15px -3px ${config.border}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: config.color,
                    boxShadow: `0 4px 20px -3px ${config.border}`,
                  },
                  overflow: 'hidden'
                }}
              >
                {/* Left accent bar */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    bottom: 0, 
                    width: '4px', 
                    backgroundColor: config.color 
                  }} 
                />

                <CardContent sx={{ pl: 3.5, pr: 2, py: 2, '&:last-child': { pb: 2 } }}>
                  <Grid container spacing={2} alignItems="center">
                    
                    {/* Icon & Details */}
                    <Grid item xs={12} sm={8} md={9} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box sx={{ mt: 0.5, p: 1, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '50%' }}>
                        {config.icon}
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.8 }}>
                          <Chip 
                            label={config.label} 
                            size="small" 
                            sx={{ 
                              height: 18, 
                              fontSize: '10px', 
                              fontWeight: 800, 
                              backgroundColor: `rgba(${parseInt(config.color.slice(1,3), 16)}, ${parseInt(config.color.slice(3,5), 16)}, ${parseInt(config.color.slice(5,7), 16)}, 0.1)`, 
                              color: config.color 
                            }} 
                          />
                          {!notif.isRead && (
                            <Chip 
                              label="UNREAD" 
                              size="small" 
                              sx={{ 
                                height: 18, 
                                fontSize: '9px', 
                                fontWeight: 800, 
                                backgroundColor: 'rgba(244, 63, 94, 0.1)', 
                                color: '#f43f5e',
                                boxShadow: '0 0 8px rgba(244, 63, 94, 0.2)'
                              }} 
                            />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notif.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: notif.isRead ? 400 : 700,
                            color: notif.isRead ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {notif.message}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Actions Panel */}
                    <Grid item xs={12} sm={4} md={3} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      {notif.isRead ? (
                        <Tooltip title="Mark as Unread">
                          <IconButton 
                            size="small" 
                            onClick={() => handleMarkAsUnread(notif.id)}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.05)' } }}
                          >
                            <UnreadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Mark as Read">
                          <IconButton 
                            size="small" 
                            onClick={() => handleMarkAsRead(notif.id)}
                            sx={{ color: '#818cf8', '&:hover': { color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.05)' } }}
                          >
                            <ReadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Delete Notification">
                        <IconButton 
                          size="small" 
                          onClick={() => handleMarkAsDelete(notif.id)}
                          sx={{ color: '#64748b', '&:hover': { color: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.05)' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>

                  </Grid>
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>

      {/* Pagination Controls */}
      {!loading && paginationInfo.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={paginationInfo.totalPages}
            page={paginationInfo.currentPage}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 600
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Notifications;
