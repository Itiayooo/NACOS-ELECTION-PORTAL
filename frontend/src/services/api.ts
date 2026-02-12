import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authService = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  getDepartments: () => api.get('/auth/departments')  
};

// Voting endpoints
export const voteService = {
  getVotingData: () => api.get('/vote/data'),
  castVote: (votes: any[]) => api.post('/vote/cast', { votes }),
  getReceipt: () => api.get('/vote/receipt')
};

// Admin endpoints
export const adminService = {
  // Departments
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data: any) => api.post('/admin/departments', data),
  updateDepartment: (id: string, data: any) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id: string) => api.delete(`/admin/departments/${id}`),

  // Offices
  getOffices: () => api.get('/admin/offices'),
  createOffice: (data: any) => api.post('/admin/offices', data),
  updateOffice: (id: string, data: any) => api.put(`/admin/offices/${id}`, data),
  deleteOffice: (id: string) => api.delete(`/admin/offices/${id}`),

  // Candidates
  getCandidates: () => api.get('/admin/candidates'),
  createCandidate: (formData: FormData) => api.post('/admin/candidates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCandidate: (id: string, formData: FormData) => api.put(`/admin/candidates/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCandidate: (id: string) => api.delete(`/admin/candidates/${id}`),

  // Results and stats
  getResults: (params?: any) => api.get('/admin/results', { params }),
  getStatistics: () => api.get('/admin/statistics'),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data)
};

export default api;
