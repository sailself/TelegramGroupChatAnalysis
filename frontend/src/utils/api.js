import axios from 'axios';

// Create a base axios instance for API calls
const api = axios.create({
  // In development, the proxy in package.json will forward requests to the backend
  // In production, the baseURL should be set to the actual API URL
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced mock data for development fallbacks
const mockData = {
  chatInfo: {
    name: "Mock Telegram Chat",
    type: "group",
    id: 12345,
    total_messages: 5000
  },
  users: [
    { id: "user1", name: "John Doe", message_count: 1250 },
    { id: "user2", name: "Jane Smith", message_count: 985 },
    { id: "user3", name: "Alice Johnson", message_count: 765 },
    { id: "user4", name: "Bob Williams", message_count: 543 },
    { id: "user5", name: "Charlie Brown", message_count: 457 }
  ],
  analytics: {
    total_messages: 5000,
    active_users: 25,
    peak_hours: { 9: 450, 10: 620, 11: 580, 12: 380, 13: 420, 14: 650, 15: 700, 16: 550, 17: 480, 18: 320 },
    peak_days: { 
      "2023-06-01": 720, 
      "2023-06-02": 850, 
      "2023-06-03": 920, 
      "2023-06-04": 780, 
      "2023-06-05": 680, 
      "2023-06-06": 850, 
      "2023-06-07": 950 
    },
    top_topics: [
      { topic: "technology", weight: 0.35 },
      { topic: "politics", weight: 0.25 },
      { topic: "sports", weight: 0.15 },
      { topic: "entertainment", weight: 0.15 },
      { topic: "science", weight: 0.10 }
    ],
    most_active_users: [
      { user_id: "user1", count: 1250 },
      { user_id: "user2", count: 985 },
      { user_id: "user3", count: 765 },
      { user_id: "user4", count: 543 },
      { user_id: "user5", count: 457 }
    ],
    emoji_users: [],
    media_users: [],
    long_message_users: [],
    forwarding_users: []
  },
  searchResults: {
    messages: [
      {
        id: "msg1",
        message_id: "msg1",
        user_id: "user1",
        user_name: "John Doe",
        date: "2023-06-07T14:35:00Z",
        content: "Has anyone tried the new React 18 features? They look promising!",
        media_type: "text",
        views: 45,
        forwards: 5,
        replies: 12,
        chat_id: "chat123"
      },
      {
        id: "msg2",
        message_id: "msg2",
        user_id: "user2",
        user_name: "Jane Smith",
        date: "2023-06-07T14:40:00Z",
        content: "Yes, the concurrent mode and suspense feature are game changers. I've been using them in my project.",
        media_type: "text",
        views: 42,
        forwards: 2,
        replies: 8,
        chat_id: "chat123"
      },
      {
        id: "msg3",
        message_id: "msg3",
        user_id: "user3",
        user_name: "Alice Johnson",
        date: "2023-06-07T14:42:00Z",
        content: "I'm still struggling with the new useTransition hook. Can anyone share a good tutorial?",
        media_type: "text",
        views: 38,
        forwards: 0,
        replies: 5,
        chat_id: "chat123"
      }
    ],
    total: 3
  },
  topics: {
    topics: [
      { topic: "technology", weight: 0.35 },
      { topic: "politics", weight: 0.25 },
      { topic: "sports", weight: 0.15 },
      { topic: "entertainment", weight: 0.15 },
      { topic: "science", weight: 0.10 }
    ]
  },
  activity: {
    peak_hours: { 9: 450, 10: 620, 11: 580, 12: 380, 13: 420, 14: 650, 15: 700, 16: 550, 17: 480, 18: 320 },
    peak_days: { 
      "2023-06-01": 720, 
      "2023-06-02": 850, 
      "2023-06-03": 920, 
      "2023-06-04": 780, 
      "2023-06-05": 680, 
      "2023-06-06": 850, 
      "2023-06-07": 950 
    }
  },
  userRankings: {
    most_active: [
      { user_id: "user1", count: 1250 },
      { user_id: "user2", count: 985 },
      { user_id: "user3", count: 765 },
      { user_id: "user4", count: 543 },
      { user_id: "user5", count: 457 }
    ]
  }
};

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    
    // Always use mock data in development if API fails
    if (process.env.NODE_ENV === 'development') {
      const url = error.config.url;
      
      if (url.includes('/chat/info')) {
        console.warn('Using mock chat info data');
        return Promise.resolve({ data: mockData.chatInfo });
      } 
      else if (url.includes('/users') && !url.includes('/messages')) {
        console.warn('Using mock users data');
        return Promise.resolve({ data: mockData.users });
      } 
      else if (url.includes('/analytics/overview')) {
        console.warn('Using mock analytics data');
        return Promise.resolve({ data: mockData.analytics });
      }
      else if (url.includes('/analytics/topics')) {
        console.warn('Using mock topics data');
        return Promise.resolve({ data: mockData.topics });
      }
      else if (url.includes('/analytics/activity')) {
        console.warn('Using mock activity data');
        return Promise.resolve({ data: mockData.activity });
      }
      else if (url.includes('/analytics/user-rankings')) {
        console.warn('Using mock user rankings data');
        return Promise.resolve({ data: mockData.userRankings });
      }
      else if (url.includes('/search')) {
        console.warn('Using mock search results');
        return Promise.resolve({ data: mockData.searchResults });
      }
    }
    
    return Promise.reject(error);
  }
);

// Chat data endpoints
export const getChatInfo = async () => {
  const response = await api.get('/chat/info');
  return response.data;
};

export const getMessages = async (params = {}) => {
  const response = await api.get('/chat/messages', { params });
  return response.data;
};

// User endpoints
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const getUserMessages = async (userId, params = {}) => {
  const response = await api.get(`/users/${userId}/messages`, { params });
  return response.data;
};

// Analytics endpoints
export const getChatAnalytics = async (params = {}) => {
  const response = await api.get('/analytics/overview', { params });
  return response.data;
};

export const getActivityPatterns = async () => {
  const response = await api.get('/analytics/activity');
  return response.data;
};

export const getChatTopics = async () => {
  const response = await api.get('/analytics/topics');
  return response.data;
};

export const getUserRankings = async () => {
  const response = await api.get('/analytics/user-rankings');
  return response.data;
};

// Search endpoints
export const searchMessages = async (params = {}) => {
  const response = await api.get('/search', { params });
  return response.data;
};

export const advancedSearch = async (data) => {
  const response = await api.post('/search', data);
  return response.data;
};

export default api; 