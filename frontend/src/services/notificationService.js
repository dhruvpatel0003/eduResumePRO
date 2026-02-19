import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const notificationService = {
  getAll: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch notifications';
    }
  },

  markAsRead: async (ids) => {
    try {
      const response = await api.put('/notifications/read', { ids });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to mark notifications as read';
    }
  },

  delete: async (ids) => {
    try {
      const response = await api.post('/notifications/delete', { ids });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete notifications';
    }
  }
};

export default notificationService;
