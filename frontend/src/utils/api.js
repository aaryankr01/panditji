import axios from 'axios';

// Set VITE_API_URL in your Vercel environment variables:
// VITE_API_URL = https://panditji-1tf8.onrender.com/api
const BASE_URL = import.meta.env.VITE_API_URL || 'https://panditji-1tf8.onrender.com/api';

import { storage as safeStorage } from './storage';

// iOS Safari Private Browsing fallback cookie support
const getToken = () => {
  return safeStorage.get('token');
};
const removeToken = () => {
  safeStorage.remove('token');
  safeStorage.remove('loginTime');
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s — Render free tier can take time to wake up from sleep
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/admin/login');
      if (!isLoginRequest) {
        removeToken();
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        window.location.href = isAdminRoute ? '/admin/login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

