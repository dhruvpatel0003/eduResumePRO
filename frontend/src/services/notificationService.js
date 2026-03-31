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
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch notifications';
    }
  },

  markAsRead: async (notificationIds) => {
    try {
      const response = await api.patch('/notifications/read', { notificationIds });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to mark notifications as read';
    }
  },

  deleteNotifications: async (notificationIds) => {
    try {
      const response = await api.delete('/notifications', { data: { notificationIds } });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete notifications';
    }
  }
};

export default notificationService;
