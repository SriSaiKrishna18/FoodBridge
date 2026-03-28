import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodbridge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};

// ── Donations ─────────────────────────────────────────
export const donationAPI = {
  create: (data) => api.post('/api/donations/', data),
  list: (params) => api.get('/api/donations/', { params }),
  listAvailable: () => api.get('/api/donations/available'),
  get: (id) => api.get(`/api/donations/${id}`),
  updateStatus: (id, status) => api.put(`/api/donations/${id}/status?status=${status}`),
  myDonations: () => api.get('/api/donations/my/donations'),
};

// ── AI Matching ───────────────────────────────────────
export const matchAPI = {
  getMatches: (donationId) => api.get(`/api/match/${donationId}`),
  accept: (matchId) => api.post('/api/match/accept', { match_id: matchId }),
};

// ── AI Endpoints ──────────────────────────────────────
export const aiAPI = {
  spoilage: (data) => api.post('/api/spoilage', data),
  categorize: (data) => api.post('/api/categorize', typeof data === 'string' ? { text: data } : data),
  route: (locations) => api.post('/api/route', { locations }),
  models: () => api.get('/api/models'),
};

// ── Impact ────────────────────────────────────────────
export const impactAPI = {
  get: () => api.get('/api/impact/'),
};

export default api;
