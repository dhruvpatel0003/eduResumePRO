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

const feedbackService = {
  create: async (feedbackData) => {
    try {
      const response = await api.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create feedback';
    }
  },

  getByResumeId: async (resumeId) => {
    try {
      const response = await api.get(`/feedback/resume/${resumeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch feedback';
    }
  },

  getMyFeedback: async () => {
    try {
      const response = await api.get('/feedback');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch feedback';
    }
  },

  update: async (id, feedbackData) => {
    try {
      const response = await api.put(`/feedback/${id}`, feedbackData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update feedback';
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete feedback';
    }
  }
};

export default feedbackService;
