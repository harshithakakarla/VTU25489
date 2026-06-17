import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Badge, 
  Avatar, 
  Divider, 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon as MenuIcon,
  Tooltip,
  Paper,
  Chip,
  IconButton
} from '@mui/material';
import AllIcon from '@mui/icons-material/Notifications';
import PriorityIcon from '@mui/icons-material/Star';
import GraduationIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Campaign';
import ResultIcon from '@mui/icons-material/AssignmentTurnedIn';
import SimIcon from '@mui/icons-material/FlashOn';
import UserIcon from '@mui/icons-material/AccountCircle';
import HelpIcon from '@mui/icons-material/Help';
import HamburgerIcon from '@mui/icons-material/Menu';
import logger from '../middleware/logger';
import { injectRealtimeNotification } from '../services/api';

const drawerWidth = 260;

// Premium light theme configuration
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5', // Indigo accent
      light: '#6366f1',
      dark: '#3730a3',
    },
    secondary: {
      main: '#e11d48', // Rose accent
    },
    background: {
      default: '#f8fafc', // Clean soft light background
      paper: '#ffffff', // Clean white backgrounds
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.5px',
    },
    subtitle1: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          color: '#0f172a',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          backgroundImage: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 12px',
          color: '#475569',
          '& .MuiListItemIcon-root': {
            color: '#64748b',
          },
          '&.active': {
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            color: '#4f46e5',
            '& .MuiListItemIcon-root': {
              color: '#4f46e5',
            },
          },
        },
      },
    },
  },
});

const Layout = ({ children, unreadCount, priorityCount, onNotificationInjected }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSimMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSimMenuClose = () => {
    setAnchorEl(null);
  };

  // Live simulation event handlers
  const simulateNotification = (type, message) => {
    logger.info('SIMULATION', `Triggering mock ${type} broadcast simulation.`);
    const injected = injectRealtimeNotification(type, message);
    handleSimMenuClose();
    if (onNotificationInjected) {
      onNotificationInjected(injected);
    }
  };

  const menuItems = [
    { text: 'All Notifications', path: '/', icon: <AllIcon />, badge: unreadCount },
    { text: 'Priority Inbox', path: '/priority', icon: <PriorityIcon />, badge: priorityCount }
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'background.paper' }}>
      <Toolbar />
      <Box sx={{ overflow: 'auto', mt: 2, flexGrow: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.path}
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={() => {
                  logger.info('UI_ACTION', `Navigated to ${item.text}`);
                  setMobileOpen(false); // Close drawer on mobile click
                }}
              >
                <ListItemIcon>
                  <Badge badgeContent={item.badge} color={item.path === '/priority' ? 'secondary' : 'primary'} max={99}>
                    {item.icon}
                  </Badge>
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Quick Priority Info Panel */}
        <Box sx={{ px: 3, py: 1 }}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              backgroundColor: 'rgba(79, 70, 229, 0.04)', 
              borderColor: '#e2e8f0',
              borderRadius: 2 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <HelpIcon sx={{ fontSize: 16, color: 'primary.light' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '0.5px' }}>
                PRIORITY WEIGHTS
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Placement</Typography>
                <Chip label="W3" size="small" sx={{ height: 16, fontSize: '9px', fontWeight: 800, bgcolor: '#c084fc', color: '#0f172a' }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Result</Typography>
                <Chip label="W2" size="small" sx={{ height: 16, fontSize: '9px', fontWeight: 800, bgcolor: '#34d399', color: '#0f172a' }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Event</Typography>
                <Chip label="W1" size="small" sx={{ height: 16, fontSize: '9px', fontWeight: 800, bgcolor: '#fbbf24', color: '#0f172a' }} />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
        
        {/* top AppBar */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1, display: { md: 'none' } }}
              >
                <HamburgerIcon />
              </IconButton>

              <Box 
                sx={{ 
                  backgroundColor: '#4f46e5', 
                  borderRadius: 2, 
                  p: 0.7, 
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)'
                }}
              >
                <GraduationIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Afford Notification Hub
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Simulate real-time push events">
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={handleSimMenuOpen}
                  sx={{
                    borderRadius: '8px',
                    borderColor: 'rgba(244, 63, 94, 0.4)',
                    backgroundColor: 'rgba(244, 63, 94, 0.05)',
                    '&:hover': {
                      borderColor: '#e11d48',
                      backgroundColor: 'rgba(244, 63, 94, 0.1)',
                      transform: 'scale(1.02)'
                    },
                    textTransform: 'none',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minWidth: { xs: 0, sm: 'auto' },
                    px: { xs: 1, sm: 1.5 }
                  }}
                >
                  <SimIcon sx={{ mr: { xs: 0, sm: 0.5 }, fontSize: '1.1rem' }} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Live Simulator
                  </Box>
                </Button>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleSimMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    backgroundColor: '#ffffff'
                  }
                }}
              >
                <MenuItem onClick={() => simulateNotification('Placement', 'Google is offering full-time roles starting at $150K! Application open.')}>
                  <MenuIcon><StarIconWrapper color="#a78bfa" /></MenuIcon>
                  <ListItemText primary="Simulate Placement Event" secondary="High priority (Weight 3)" />
                </MenuItem>
                <MenuItem onClick={() => simulateNotification('Result', 'Re-evaluation results for Cryptography & Network Security published.')}>
                  <MenuIcon><StarIconWrapper color="#34d399" /></MenuIcon>
                  <ListItemText primary="Simulate Result Announcement" secondary="Medium priority (Weight 2)" />
                </MenuItem>
                <MenuItem onClick={() => simulateNotification('Event', 'College cultural fest "AURA 2026" planning meeting at 4 PM.')}>
                  <MenuIcon><StarIconWrapper color="#fbbf24" /></MenuIcon>
                  <ListItemText primary="Simulate General Event" secondary="Normal priority (Weight 1)" />
                </MenuItem>
              </Menu>

              {/* Student Meta Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderLeft: '1px solid #e2e8f0', pl: 1.5 }}>
                <Avatar sx={{ bgcolor: '#4f46e5', width: 28, height: 28, fontSize: '12px', fontWeight: 'bold' }}>S</Avatar>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1 }}>Student ID: 1042</Typography>
                  <Typography variant="caption" color="text.secondary">CSE Semester 6</Typography>
                </Box>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Responsive Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>

        {/* Content Panel */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 2, md: 3 }, 
            pt: 11, 
            pb: 12,
            width: { md: `calc(100% - ${drawerWidth}px)` }
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

// Help Helper component to show bullet colors in simulation selector
const StarIconWrapper = ({ color }) => (
  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
);

export default Layout;
