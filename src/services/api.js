import axios from 'axios';
import logger from '../middleware/logger';

const API_BASE_URL = 'http://4.224.186.213/evaluation-service/notifications';

// Seeding high-quality initial notifications to simulate production database state
const MOCK_NOTIFICATIONS = [
  {
    id: "uuid-placement-google",
    studentId: 1042,
    type: "Placement",
    message: "Google is hiring Associate Product Managers and Software Engineers! Deadline is next week.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString() // 1 hour ago
  },
  {
    id: "uuid-result-sem5",
    studentId: 1042,
    type: "Result",
    message: "The Semester 5 final academic transcript has been published. Check your Student Portal.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString() // 3 hours ago
  },
  {
    id: "uuid-event-hackathon",
    studentId: 1042,
    type: "Event",
    message: "Registrations for 'Afford Smart Campus Hackathon 2026' close today at 11:59 PM. Register your team now.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString() // 8 hours ago
  },
  {
    id: "uuid-placement-microsoft",
    studentId: 1042,
    type: "Placement",
    message: "Microsoft IDC pre-placement talk scheduled in Seminar Hall 1 at 2:00 PM on Friday.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString() // 18 hours ago
  },
  {
    id: "uuid-result-dsa",
    studentId: 1042,
    type: "Result",
    message: "Mid-Term grades for Advanced Data Structures & Algorithms (CS-302) are updated.",
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 25).toISOString() // 25 hours ago
  },
  {
    id: "uuid-event-workshop",
    studentId: 1042,
    type: "Event",
    message: "Hands-on Workshop: 'Building LLM Agents with React' organized by GDG on June 20.",
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString() // 42 hours ago
  },
  {
    id: "uuid-placement-nvidia",
    studentId: 1042,
    type: "Placement",
    message: "Nvidia is opening applications for Hardware Compiler Engineers. Apply on Afford Placement Hub.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString() // 2.5 days ago
  },
  {
    id: "uuid-result-aptitude",
    studentId: 1042,
    type: "Result",
    message: "Results of Placement Mock Aptitude Test - Round 3 are out. Cut-off score is 75%.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 88).toISOString() // ~3.5 days ago
  },
  {
    id: "uuid-event-lecture",
    studentId: 1042,
    type: "Event",
    message: "Distinguished Lecture: 'Modern Browser Engines and V8 Internals' by V8 core contributors.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 115).toISOString() // ~5 days ago
  },
  {
    id: "uuid-placement-adobe",
    studentId: 1042,
    type: "Placement",
    message: "Adobe India Off-Campus hiring for UX Researchers. Referral portal open in student dashboard.",
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 150).toISOString() // ~6 days ago
  },
  {
    id: "uuid-result-lab",
    studentId: 1042,
    type: "Result",
    message: "Lab Assessment evaluations for Operating Systems (CS-304) have been finalized.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 180).toISOString() // ~7.5 days ago
  },
  {
    id: "uuid-event-alumni",
    studentId: 1042,
    type: "Event",
    message: "Afford Alumni Meet 'Reunite 2026' to be held in Bangalore. Invitation link sent to registered emails.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 220).toISOString() // ~9 days ago
  }
];

// Initialize localStorage if empty
if (!localStorage.getItem('afford_notifications')) {
  localStorage.setItem('afford_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
}

export const fetchNotifications = async (params = {}) => {
  const { page = 1, limit = 10, notification_type = 'All' } = params;
  
  logger.info('API_REQUEST', `GET /notifications - page=${page}, limit=${limit}, type=${notification_type}`, params);
  
  try {
    const queryParams = {};
    if (page) queryParams.page = page;
    if (limit) queryParams.limit = limit;
    if (notification_type && notification_type !== 'All') {
      queryParams.notification_type = notification_type;
    }

    const response = await axios.get(API_BASE_URL, { 
      params: queryParams,
      timeout: 3000 // fail fast if network unavailable
    });
    
    logger.info('API_RESPONSE', 'Fetched successfully from server', response.data);
    return response.data;

  } catch (error) {
    logger.warn('API_FALLBACK', `Connection to ${API_BASE_URL} failed (${error.message}). Loading from persistent localStorage.`, error);
    
    // Simulate database queries locally
    let localData = JSON.parse(localStorage.getItem('afford_notifications') || '[]');
    
    // Filter
    if (notification_type && notification_type !== 'All') {
      localData = localData.filter(item => item.type.toLowerCase() === notification_type.toLowerCase());
    }
    
    const totalCount = localData.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = localData.slice(startIndex, startIndex + parseInt(limit));
    
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const mockResponse = {
      success: true,
      data: paginatedItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        pageSize: parseInt(limit),
        totalCount
      },
      isMock: true
    };
    
    logger.info('STATE_UPDATE', 'Loaded local data', mockResponse);
    return mockResponse;
  }
};

export const markAsReadInApi = async (id) => {
  logger.info('API_REQUEST', `PATCH /notifications/${id}/read`);
  try {
    const response = await axios.patch(`${API_BASE_URL}/${id}/read`, {}, { timeout: 2000 });
    logger.info('API_RESPONSE', `Marked ${id} as read on server`, response.data);
    return response.data;
  } catch (error) {
    logger.warn('API_FALLBACK', `Mark read request failed. Updating locally.`, error);
    
    const localData = JSON.parse(localStorage.getItem('afford_notifications') || '[]');
    const updated = localData.map(item => {
      if (item.id === id) {
        return { ...item, isRead: true };
      }
      return item;
    });
    localStorage.setItem('afford_notifications', JSON.stringify(updated));
    logger.info('STATE_UPDATE', `Marked notification ${id} as READ in local state.`);
    return { success: true, message: "Marked read locally", data: { id, isRead: true } };
  }
};

export const markAsUnreadInApi = async (id) => {
  logger.info('API_REQUEST', `PATCH /notifications/${id}/unread`);
  try {
    const response = await axios.patch(`${API_BASE_URL}/${id}/unread`, {}, { timeout: 2000 });
    logger.info('API_RESPONSE', `Marked ${id} as unread on server`, response.data);
    return response.data;
  } catch (error) {
    logger.warn('API_FALLBACK', `Mark unread request failed. Updating locally.`, error);
    
    const localData = JSON.parse(localStorage.getItem('afford_notifications') || '[]');
    const updated = localData.map(item => {
      if (item.id === id) {
        return { ...item, isRead: false };
      }
      return item;
    });
    localStorage.setItem('afford_notifications', JSON.stringify(updated));
    logger.info('STATE_UPDATE', `Marked notification ${id} as UNREAD in local state.`);
    return { success: true, message: "Marked unread locally", data: { id, isRead: false } };
  }
};

export const deleteNotificationInApi = async (id) => {
  logger.info('API_REQUEST', `DELETE /notifications/${id}`);
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`, { timeout: 2000 });
    logger.info('API_RESPONSE', `Deleted ${id} on server`, response.data);
    return response.data;
  } catch (error) {
    logger.warn('API_FALLBACK', `Delete request failed. Removing locally.`, error);
    
    const localData = JSON.parse(localStorage.getItem('afford_notifications') || '[]');
    const updated = localData.filter(item => item.id !== id);
    localStorage.setItem('afford_notifications', JSON.stringify(updated));
    logger.info('STATE_UPDATE', `Deleted notification ${id} from local state.`);
    return { success: true, message: "Deleted locally" };
  }
};

// Seed/Insert a notification locally (Simulates receiving a real-time SSE/WebSocket notification)
export const injectRealtimeNotification = (type, message) => {
  const newNotif = {
    id: 'realtime-' + Math.random().toString(36).substring(2, 9),
    studentId: 1042,
    type,
    message,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  
  const localData = JSON.parse(localStorage.getItem('afford_notifications') || '[]');
  localData.unshift(newNotif);
  localStorage.setItem('afford_notifications', JSON.stringify(localData));
  logger.info('REALTIME_EVENT', `Received SSE broadcast for type [${type}]: "${message}"`, newNotif);
  return newNotif;
};
