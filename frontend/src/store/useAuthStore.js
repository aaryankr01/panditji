import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false, // Start false; checkAuth() will hydrate this
  isInitialized: false,   // True once checkAuth() has run (success or failure)
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, token: res.data.token, isAuthenticated: true, isLoading: false });
      return { success: true, user: res.data.user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, token: res.data.token, isAuthenticated: true, isLoading: false });
      return { success: true, user: res.data.user };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  adminLogin: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/admin/login', { email, password });
      localStorage.setItem('token', res.data.token);
      set({ user: { ...res.data.admin, role: 'admin' }, token: res.data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Admin login failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, isInitialized: true });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data, isAuthenticated: true, isInitialized: true });
    } catch (err) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
    }
  },

  updateUser: (userData) => {
    set((state) => ({ user: { ...state.user, ...userData } }));
  }
}));

export default useAuthStore;
