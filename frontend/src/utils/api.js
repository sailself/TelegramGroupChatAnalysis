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

// Mock data for development fallbacks
const mockData = {
  chatInfo: {
    name: "Mock Telegram Chat",
    type: "group",
    id: 12345,
    total_messages: 5
  },
  users: [
    { id: "user1", name: "User One", message_count: 2 },
    { id: "user2", name: "User Two", message_count: 2 },
    { id: "user3", name: "User Three", message_count: 1 }
  ],
  analytics: {
    total_messages: 5,
    active_users: 3,
    peak_hours: { 9: 2, 10: 3 },
    peak_days: { "2023-01-01": 3, "2023-01-02": 2 },
    top_topics: [{ topic: "greetings", weight: 0.8 }],
    most_active_users: [
      { user_id: "user1", count: 2 },
      { user_id: "user2", count: 2 },
      { user_id: "user3", count: 1 }
    ],
    emoji_users: [],
    media_users: [],
    long_message_users: [],
    forwarding_users: []
  },
  searchResults: {
    messages: [],
    total: 0
  }
};

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    
    // Provide mock data for specific endpoints during development
    const url = error.config.url;
    
    if (process.env.NODE_ENV === 'development') {
      if (url.includes('/chat/info')) {
        console.warn('Using mock chat info data');
        return Promise.resolve({ data: mockData.chatInfo });
      } 
      else if (url.includes('/users') && !url.includes('/')) {
        console.warn('Using mock users data');
        return Promise.resolve({ data: mockData.users });
      } 
      else if (url.includes('/analytics/overview')) {
        console.warn('Using mock analytics data');
        return Promise.resolve({ data: mockData.analytics });
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