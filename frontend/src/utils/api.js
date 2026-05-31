import axios from 'axios';

// Set VITE_API_URL in your Vercel environment variables:
// VITE_API_URL = https://panditji-1tf8.onrender.com/api
const BASE_URL = import.meta.env.VITE_API_URL || 'https://panditji-1tf8.onrender.com/api';

// iOS Safari Private Browsing blocks localStorage — use a safe accessor
const getToken = () => {
  try { return localStorage.getItem('token'); } catch { return null; }
};
const removeToken = () => {
  try { localStorage.removeItem('token'); } catch { /* ignore */ }
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
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

