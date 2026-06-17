import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Drawer, 
  Typography, 
  IconButton, 
  Chip, 
  Paper, 
  Tooltip, 
  Divider, 
  Collapse, 
  Button 
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import CollapseIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandIcon from '@mui/icons-material/KeyboardArrowUp';
import ClearIcon from '@mui/icons-material/DeleteSweep';
import BugIcon from '@mui/icons-material/BugReport';
import logger from '../middleware/logger';

const ConsoleDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    // Sync initial logs
    setLogs([...logger.getLogs()]);

    // Subscribe to logger events
    const unsubscribe = logger.subscribe((newLog, allLogs) => {
      if (allLogs) {
        setLogs([...allLogs]);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Auto scroll to bottom of logs
    if (logsEndRef.current && isOpen) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const handleClear = (e) => {
    e.stopPropagation();
    logger.clear();
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    logger.info('UI_ACTION', `Console drawer ${!isOpen ? 'opened' : 'closed'}`);
  };

  // Helper colors for logger levels
  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return '#f43f5e';
      case 'WARN': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'API_REQUEST': return '#6366f1';
      case 'API_RESPONSE': return '#8b5cf6';
      case 'API_FALLBACK': return '#ec4899';
      case 'REALTIME_EVENT': return '#f43f5e';
      case 'STATE_UPDATE': return '#06b6d4';
      default: return '#64748b';
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1200 }}>
        <Tooltip title="Toggle Middleware Logs Console">
          <Button
            variant="contained"
            color="primary"
            startIcon={<TerminalIcon />}
            onClick={toggleDrawer}
            sx={{
              borderRadius: 20,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
              textTransform: 'none',
              fontWeight: 600,
              letterSpacing: '0.5px',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 24px rgba(124, 58, 237, 0.6)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Middleware Console ({logs.length})
          </Button>
        </Tooltip>
      </Box>

      {/* Slide-Up Console Drawer */}
      <Drawer
        anchor="bottom"
        open={isOpen}
        onClose={toggleDrawer}
        variant="persistent"
        sx={{
          '& .MuiDrawer-paper': {
            height: '35vh',
            maxHeight: '400px',
            minHeight: '200px',
            backgroundColor: '#090d16',
            borderTop: '2px solid #312e81',
            color: '#cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.5)',
            zIndex: 1100
          }
        }}
      >
        {/* Header bar */}
        <Box 
          sx={{ 
            px: 2, 
            py: 1, 
            backgroundColor: '#0e1424', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
            cursor: 'pointer'
          }}
          onClick={toggleDrawer}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugIcon sx={{ color: '#818cf8', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.5px', color: '#f8fafc', fontFamily: 'monospace' }}>
              LOGGING MIDDLEWARE STREAM
            </Typography>
            <Chip 
              label={`${logs.length} Buffered`} 
              size="small" 
              sx={{ 
                height: 18, 
                fontSize: '10px', 
                backgroundColor: '#1e1b4b', 
                color: '#c7d2fe', 
                fontWeight: 600,
                fontFamily: 'monospace'
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={handleClear} sx={{ color: '#94a3b8', '&:hover': { color: '#f43f5e' } }} title="Clear Logs">
              <ClearIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={toggleDrawer} sx={{ color: '#94a3b8' }}>
              <CollapseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Logs Terminal Area */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            p: 2, 
            overflowY: 'auto', 
            fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            backgroundColor: '#05070c'
          }}
        >
          {logs.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4 }}>
              <TerminalIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>No logs streamed yet. Interact with the app to trigger middleware events.</Typography>
            </Box>
          ) : (
            logs.map((log) => (
              <Box 
                key={log.id} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 1.5,
                  p: 0.5,
                  borderRadius: 1,
                  '&:hover': { backgroundColor: '#0f172a' }
                }}
              >
                {/* Timestamp */}
                <Typography component="span" sx={{ color: '#64748b', fontSize: '11px', flexShrink: 0, fontFamily: 'monospace' }}>
                  [{log.timestamp}]
                </Typography>

                {/* Level Badge */}
                <Typography 
                  component="span" 
                  sx={{ 
                    color: getLevelColor(log.level), 
                    fontWeight: 700, 
                    fontSize: '11px', 
                    minWidth: '45px',
                    display: 'inline-block',
                    flexShrink: 0,
                    fontFamily: 'monospace'
                  }}
                >
                  [{log.level}]
                </Typography>

                {/* Category Badge */}
                <Chip 
                  label={log.category} 
                  size="small" 
                  sx={{ 
                    height: 18, 
                    fontSize: '9px', 
                    borderRadius: '4px',
                    fontWeight: 700, 
                    backgroundColor: 'transparent',
                    border: `1px solid ${getCategoryColor(log.category)}`,
                    color: getCategoryColor(log.category),
                    px: 0.5,
                    fontFamily: 'monospace',
                    flexShrink: 0
                  }}
                />

                {/* Message */}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography component="span" sx={{ color: log.level === 'ERROR' ? '#f43f5e' : log.level === 'WARN' ? '#fbbf24' : '#cbd5e1', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                    {log.message}
                  </Typography>
                  {log.data && (
                    <Box 
                      component="pre" 
                      sx={{ 
                        m: 0.5, 
                        p: 1, 
                        backgroundColor: '#0e131f', 
                        borderRadius: 1, 
                        color: '#38bdf8', 
                        overflowX: 'auto',
                        fontSize: '10px',
                        border: '1px solid #1e293b'
                      }}
                    >
                      {JSON.stringify(log.data, null, 2)}
                    </Box>
                  )}
                </Box>
              </Box>
            ))
          )}
          <div ref={logsEndRef} />
        </Box>
      </Drawer>
    </>
  );
};

export default ConsoleDrawer;
