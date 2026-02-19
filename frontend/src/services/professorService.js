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

const professorService = {
  // Requests list
  getRequests: async (params) => {
    try {
      const response = await api.get('/professor/requests', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch requests';
    }
  },

  // Single request detail
  getRequestById: async (requestId) => {
    try {
      const response = await api.get(`/professor/requests/${requestId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch request details';
    }
  },

  // Create feedback
  createFeedback: async (requestId, feedbackData) => {
    try {
      const response = await api.post(`/professor/requests/${requestId}/feedback`, feedbackData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create feedback';
    }
  },

  // Update feedback
  updateFeedback: async (requestId, feedbackId, feedbackData) => {
    try {
      const response = await api.patch(`/professor/requests/${requestId}/feedback/${feedbackId}`, feedbackData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update feedback';
    }
  },

  // Delete feedback (bulk)
  deleteFeedback: async (requestId, feedbackIds) => {
    try {
      const response = await api.post(`/professor/requests/${requestId}/feedback/delete`, { ids: feedbackIds });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete feedback';
    }
  },

  // Submit feedback to student
  submitFeedback: async (requestId) => {
    try {
      const response = await api.post(`/professor/requests/${requestId}/submit`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to submit feedback';
    }
  },

  // Template management
  getTemplates: async (scope) => {
    try {
      const response = await api.get('/templates', { params: { scope } });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch templates';
    }
  },

  uploadTemplate: async (formData) => {
    try {
      const response = await api.post('/templates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to upload template';
    }
  },

  deleteTemplates: async (ids) => {
    try {
      const response = await api.post('/templates/delete', { ids });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete templates';
    }
  },
};

export default professorService;
