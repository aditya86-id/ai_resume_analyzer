import { apiClient } from './client';

// Authentication
export const authAPI = {
  register: (data) => apiClient.post('/auth/register/', data),
  login: (data) => apiClient.post('/auth/login/', data),
  logout: () => apiClient.post('/auth/logout/', {}),
  getCurrentUser: () => apiClient.get('/auth/user/'),
};

// Resumes
export const resumeAPI = {
  list: () => apiClient.get('/resumes/'),
  upload: (formData) => apiClient.upload('/resumes/upload/', formData),
  getById: (id) => apiClient.get(`/resumes/${id}/`),
  delete: (id) => apiClient.delete(`/resumes/${id}/`),
  getAnalysis: (resumeId) => apiClient.get(`/resumes/${resumeId}/analysis/`),
  getSkills: (resumeId) => apiClient.get(`/resumes/${resumeId}/skills/`),
  getMatching: (resumeId) => apiClient.get(`/resumes/${resumeId}/matching/`),
};

// Analysis
export const analysisAPI = {
  analyze: (resumeId) => apiClient.post('/analyze/', { resume_id: resumeId }),
};

// Jobs
export const jobsAPI = {
  list: (params) => apiClient.get('/jobs/', { params }),
  getById: (id) => apiClient.get(`/jobs/${id}/`),
  create: (data) => apiClient.post('/jobs/', data),
  update: (id, data) => apiClient.put(`/jobs/${id}/`, data),
  delete: (id) => apiClient.delete(`/jobs/${id}/`),
};

// Templates
export const templatesAPI = {
  list: (params) => apiClient.get('/templates/', { params }),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard/stats/'),
};

// Audit Logs
export const auditAPI = {
  list: () => apiClient.get('/audit-logs/'),
};
