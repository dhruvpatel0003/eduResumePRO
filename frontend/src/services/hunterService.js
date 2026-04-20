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
  searchCompanies: async (location, companyType, keywords) => {
    try {
      const response = await api.post('/hunter/companies/dynamic', {
        location,
        companyType,
        keywords,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to search companies';
    }
  },

  searchJobs: async (company, location, keywords) => {
    try {
      const response = await api.post('/hunter/jobs', {
        company,
        location,
        keywords,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch jobs';
    }
  },

  analyze: async (resumeId, jobs) => {
    try {
      const response = await api.post('/hunter/analyze', { resumeId, jobs });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to analyze resume';
    }
  },
};

export default hunterService;
