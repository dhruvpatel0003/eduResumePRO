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

const resumeService = {
  create: async (resumeData) => {
    try {
      const response = await api.post('/resumes', resumeData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create resume';
    }
  },

  getAll: async () => {
    try {
      const response = await api.get('/resumes');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch resumes';
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/resumes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch resume';
    }
  },

  update: async (id, resumeData) => {
    try {
      const response = await api.put(`/resumes/${id}`, resumeData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update resume';
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/resumes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete resume';
    }
  },

  publish: async (id) => {
    try {
      const response = await api.post(`/resumes/${id}/publish`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to publish resume';
    }
  },

  generate: async (templateId) => {
    try {
      const response = await api.post('/resumes/generate', { templateId });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Could not generate resume. Try again.';
    }
  }
};

export default resumeService;
