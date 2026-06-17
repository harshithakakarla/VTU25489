import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Paper,
  Tooltip,
  Divider,
  Stack,
  Skeleton,
  Grid
} from '@mui/material';
import ReadIcon from '@mui/icons-material/Drafts';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Campaign';
import ResultIcon from '@mui/icons-material/AssignmentTurnedIn';
import PlacementIcon from '@mui/icons-material/Work';
import InfoIcon from '@mui/icons-material/Info';
import IdeaIcon from '@mui/icons-material/EmojiObjects';
import { fetchNotifications, markAsReadInApi, deleteNotificationInApi } from '../services/api';
import { PriorityInbox } from '../utils/priorityQueue';
import logger from '../middleware/logger';

const PriorityNotifications = ({ triggerRefresh, onRefreshComplete }) => {
  const [loading, setLoading] = useState(true);
  const [priorityList, setPriorityList] = useState([]);

  const loadPriorityInbox = async () => {
    setLoading(true);
    try {
      // Fetch a large buffer of notifications to sort client-side (to extract top 10 unread)
      const response = await fetchNotifications({
        page: 1,
        limit: 100, // Fetch large enough batch to evaluate priorities
        notification_type: 'All'
      });

      if (response && response.success) {
        // Instantiate our PriorityInbox helper
        const inbox = new PriorityInbox(10);
        const top10 = inbox.process(response.data);
        
        logger.info('STATE_UPDATE', 'Re-evaluated Priority Inbox Top 10', top10);
        setPriorityList(top10);
      }
    } catch (err) {
      logger.error('UI_ERROR', 'Failed to load priority inbox', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriorityInbox();
  }, [triggerRefresh]);

  const handleMarkAsRead = async (id) => {
    await markAsReadInApi(id);
    loadPriorityInbox();
    if (onRefreshComplete) onRefreshComplete();
  };

  const handleDelete = async (id) => {
    await deleteNotificationInApi(id);
    loadPriorityInbox();
    if (onRefreshComplete) onRefreshComplete();
  };

  // Helper properties for categories
  const getTypeConfig = (type) => {
    switch (type) {
      case 'Placement':
        return { color: '#a78bfa', label: 'Placement (W3)', icon: <PlacementIcon sx={{ color: '#a78bfa' }} />, border: 'rgba(167, 139, 250, 0.4)' };
      case 'Result':
        return { color: '#34d399', label: 'Result (W2)', icon: <ResultIcon sx={{ color: '#34d399' }} />, border: 'rgba(52, 211, 153, 0.4)' };
      default:
        return { color: '#fbbf24', label: 'Event (W1)', icon: <EventIcon sx={{ color: '#fbbf24' }} />, border: 'rgba(251, 191, 36, 0.4)' };
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Priority Inbox
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Displaying the top 10 most critical unread announcements sorted dynamically.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        
        {/* Full Width: Priority List */}
        <Grid item xs={12}>
          <Stack spacing={2}>
            {loading ? (
              Array.from(new Array(3)).map((_, idx) => (
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
            ) : priorityList.length === 0 ? (
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
                <IdeaIcon sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Priority Inbox Empty!</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '400px', mx: 'auto' }}>
                  You have read all critical announcements. You can simulate new notifications from the top control panel.
                </Typography>
              </Paper>
            ) : (
              priorityList.map((notif, index) => {
                const config = getTypeConfig(notif.type);
                return (
                  <Card
                    key={notif.id}
                    variant="outlined"
                    sx={{
                      position: 'relative',
                      backgroundColor: 'background.paper',
                      borderColor: config.color,
                      boxShadow: `0 0 15px -5px ${config.border}`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 20px -3px ${config.border}`,
                      },
                      overflow: 'hidden'
                    }}
                  >
                    {/* Left accent bar with rank index */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        bottom: 0, 
                        width: '32px', 
                        backgroundColor: config.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#070a13',
                        fontWeight: 900,
                        fontSize: '14px'
                      }} 
                    >
                      #{index + 1}
                    </Box>

                    <CardContent sx={{ pl: 6.5, pr: 2, py: 2, '&:last-child': { pb: 2 } }}>
                      <Grid container spacing={2} alignItems="center">
                        
                        <Grid item xs={12} sm={9} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <Box sx={{ mt: 0.5, p: 0.8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '50%' }}>
                            {config.icon}
                          </Box>
                          <Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.8, flexWrap: 'wrap' }}>
                              <Chip 
                                label={config.label} 
                                size="small" 
                                sx={{ 
                                  height: 18, 
                                  fontSize: '10px', 
                                  fontWeight: 800, 
                                  backgroundColor: `rgba(${parseInt(config.color.slice(1,3), 16)}, ${parseInt(config.color.slice(3,5), 16)}, ${parseInt(config.color.slice(5,7), 16)}, 0.15)`, 
                                  color: config.color 
                                }} 
                              />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(notif.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              {notif.message}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="Mark as Read">
                            <IconButton 
                              size="small" 
                              onClick={() => handleMarkAsRead(notif.id)}
                              sx={{ color: '#818cf8', '&:hover': { color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.05)' } }}
                            >
                              <ReadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(notif.id)}
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
        </Grid>

      </Grid>
    </Box>
  );
};

export default PriorityNotifications;
