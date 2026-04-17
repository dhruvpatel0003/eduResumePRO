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

const eraService = {
  generate: async (type, brief, points, context) => {
    try {
      const response = await api.post('/era/generate', {
        type,
        brief,
        points,
        context,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to generate with ERA';
    }
  },
};

export default eraService;
