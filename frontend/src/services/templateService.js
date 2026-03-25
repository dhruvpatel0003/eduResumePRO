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

const templateService = {
  getAll: async () => {
    try {
      const response = await api.get('/templates');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch templates';
    }
  },

  getTemplatePdf: async (templateId) => {
    try {
      const response = await api.get(`/templates/${templateId}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch template PDF';
    }
  },

  create: async (formData) => {
    try {
      const response = await api.post('/templates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create template';
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/templates/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete template';
    }
  },
};

export default templateService;
