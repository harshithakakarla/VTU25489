import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Notifications from './pages/Notifications';
import PriorityNotifications from './pages/PriorityNotifications';
import { PriorityInbox } from './utils/priorityQueue';
import logger from './middleware/logger';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [priorityCount, setPriorityCount] = useState(0);

  // Method to recalculate sidebar badge counts based on active localStorage state
  const updateBadgeCounts = () => {
    try {
      const localData = JSON.parse(localStorage.getItem('afford_notifications') || '[]');
      
      // Total unread notifications count
      const unread = localData.filter(n => !n.isRead);
      setUnreadCount(unread.length);

      // Priority unread notifications count
      const inbox = new PriorityInbox(10);
      const top10 = inbox.process(localData);
      setPriorityCount(top10.length);
      
      logger.info('STATE_UPDATE', `Badge counts re-calculated. Total unread: ${unread.length}, Top 10 Priority: ${top10.length}`);
    } catch (err) {
      logger.error('STATE_ERROR', 'Failed to calculate badge counts', err);
    }
  };

  useEffect(() => {
    updateBadgeCounts();
  }, [refreshTrigger]);

  const handleNotificationInjected = () => {
    logger.info('REALTIME_EVENT', 'Real-time notification injected! Triggering state refresh.');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleStateChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Router>
      <Layout 
        unreadCount={unreadCount} 
        priorityCount={priorityCount} 
        onNotificationInjected={handleNotificationInjected}
      >
        <Routes>
          <Route 
            path="/" 
            element={
              <Notifications 
                triggerRefresh={refreshTrigger} 
                onRefreshComplete={handleStateChange} 
              />
            } 
          />
          <Route 
            path="/priority" 
            element={
              <PriorityNotifications 
                triggerRefresh={refreshTrigger} 
                onRefreshComplete={handleStateChange} 
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
