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
  // Get resumes shared with this faculty member
  getRequests: async () => {
    try {
      const response = await api.get('/resumes/faculty/resumes');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch requests';
    }
  },

  // Get resume details + feedback for a single resume
  getRequestById: async (resumeId) => {
    try {
      const [detailsRes, feedbackRes] = await Promise.all([
        api.get(`/resumes/${resumeId}/details`),
        api.get(`/resumes/${resumeId}/feedback`),
      ]);
      return {
        details: detailsRes.data,
        feedback: feedbackRes.data,
      };
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch request details';
    }
  },

  // Create feedback on a resume
  createFeedback: async (resumeId, comments) => {
    try {
      const response = await api.post(`/resumes/${resumeId}/feedback`, { comments });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create feedback';
    }
  },

  // Update a single feedback item
  updateFeedback: async (feedbackId, feedbackData) => {
    try {
      const response = await api.put(`/feedback/${feedbackId}`, feedbackData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update feedback';
    }
  },

  // Submit the professor's review (mark as completed)
  submitReview: async (resumeId) => {
    try {
      const response = await api.post(`/resumes/${resumeId}/submit-review`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to submit review';
    }
  },

  // Delete a single feedback comment from a resume
  deleteFeedback: async (resumeId, commentId) => {
    try {
      const response = await api.delete(`/resumes/${resumeId}/feedback/${commentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete feedback';
    }
  },

  // Template management
  getTemplates: async () => {
    try {
      const response = await api.get('/templates');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch templates';
    }
  },

  uploadTemplate: async (formData) => {
    try {
      const response = await api.post('/templates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to upload template';
    }
  },

  deleteTemplate: async (id) => {
    try {
      const response = await api.delete(`/templates/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete template';
    }
  },
};

export default professorService;
