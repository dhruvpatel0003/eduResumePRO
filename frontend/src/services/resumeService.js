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
  createFromTemplate: async (templateId, title) => {
    try {
      const response = await api.post('/resumes/from-template', { templateId, title });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create resume';
    }
  },

  getMyResumes: async () => {
    try {
      const response = await api.get('/resumes/my-resumes');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch resumes';
    }
  },

  getDetails: async (resumeId) => {
    try {
      const response = await api.get(`/resumes/${resumeId}/details`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch resume';
    }
  },

  updateDetails: async (resumeId, templateInfo) => {
    try {
      const response = await api.put(`/resumes/${resumeId}/details`, { templateInfo });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update resume';
    }
  },

  generatePdf: async (resumeId) => {
    try {
      const response = await api.post(`/resumes/${resumeId}/generate`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Could not generate resume. Try again.';
    }
  },

  downloadPdf: async (resumeId) => {
    try {
      const response = await api.get(`/resumes/${resumeId}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to download resume PDF';
    }
  },

  share: async (resumeId, facultyId) => {
    try {
      const response = await api.post(`/resumes/${resumeId}/share`, { facultyId });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to share resume';
    }
  },

  getFacultyResumes: async () => {
    try {
      const response = await api.get('/resumes/faculty/resumes');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch faculty resumes';
    }
  },

  addFacultyFeedback: async (resumeId, comments) => {
    try {
      const response = await api.post(`/resumes/${resumeId}/feedback`, { comments });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to add feedback';
    }
  },

  getFeedback: async (resumeId) => {
    try {
      const response = await api.get(`/resumes/${resumeId}/feedback`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch feedback';
    }
  },

  acceptAllFeedback: async (resumeId) => {
    try {
      const response = await api.post(`/resumes/${resumeId}/feedback/accept-all`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to accept feedback';
    }
  },
};

export default resumeService;
