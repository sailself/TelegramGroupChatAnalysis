import axios from 'axios';

// Create a base axios instance for API calls
const api = axios.create({
  baseURL: '/api', // Uses proxy in development
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

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