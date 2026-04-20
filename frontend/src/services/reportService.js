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

const reportService = {
  analyzeResume: async (resumeId) => {
    try {
      const response = await api.post('/report/analyze-resume', { resumeId });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to analyze resume';
    }
  },

  acceptFeedback: async (resumeId, comments, autoRegenerate = true) => {
    try {
      const response = await api.post('/report/accept-feedback', {
        resumeId,
        comments,
        autoRegenerate,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to accept feedback';
    }
  },
};

export default reportService;
