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

const githubService = {
  previewRepos: async (username) => {
    try {
      const response = await api.post('/github/preview', { username });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch GitHub repositories';
    }
  },

  importProjects: async (resumeId, selectedProjects) => {
    try {
      const response = await api.post(`/github/resume/${resumeId}/import`, { selectedProjects });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to import GitHub projects';
    }
  },

  deleteProject: async (resumeId, projectId) => {
    try {
      const response = await api.delete(`/github/resume/${resumeId}/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete project';
    }
  }
};

export default githubService;
