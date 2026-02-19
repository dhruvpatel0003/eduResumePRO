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

const hunterService = {
  analyze: async (resumeId, companyId, jobId) => {
    try {
      const response = await api.post('/hunter/analyze', { resumeId, companyId, jobId });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to analyze resume';
    }
  },

  getAtsScore: async (resumeId, jobId) => {
    try {
      const response = await api.post('/hunter/ats-score', { resumeId, jobId });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to get ATS score';
    }
  },

  getCompanies: async () => {
    try {
      const response = await api.get('/hunter/companies');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch companies';
    }
  },

  getJobsByCompany: async (companyId) => {
    try {
      const response = await api.get(`/hunter/companies/${companyId}/jobs`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch jobs';
    }
  }
};

export default hunterService;
