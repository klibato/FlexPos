import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.flexpos.app/api/admin';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important pour les cookies httpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token depuis localStorage (fallback)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Déconnexion automatique si 401 (sauf si déjà sur /login)
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');

      // Ne rediriger que si on n'est pas déjà sur /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH
// ============================================

export const login = async (identifier, password) => {
  const response = await api.post('/auth/login', { identifier, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ============================================
// ANALYTICS
// ============================================

export const getDashboard = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

// ============================================
// ORGANIZATIONS
// ============================================

export const getOrganizations = async (params = {}) => {
  const response = await api.get('/organizations', { params });
  return response.data;
};

export const getOrganizationById = async (id) => {
  const response = await api.get(`/organizations/${id}`);
  return response.data;
};

export const suspendOrganization = async (id, reason) => {
  const response = await api.put(`/organizations/${id}/suspend`, { reason });
  return response.data;
};

export const activateOrganization = async (id) => {
  const response = await api.put(`/organizations/${id}/activate`);
  return response.data;
};

export default api;
