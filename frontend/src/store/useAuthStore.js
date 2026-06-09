import { create } from 'zustand';
import api from '../utils/api';

import { storage as safeStorage } from '../utils/storage';

const useAuthStore = create((set) => ({
  user: null,
  token: safeStorage.get('token') || null,
  isAuthenticated: false, // Start false; checkAuth() will hydrate this
  isInitialized: false,   // True once checkAuth() has run (success or failure)
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      safeStorage.set('token', res.data.token);
      safeStorage.set('loginTime', Date.now().toString());
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
      safeStorage.set('token', res.data.token);
      safeStorage.set('loginTime', Date.now().toString());
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
      safeStorage.set('token', res.data.token);
      safeStorage.set('loginTime', Date.now().toString());
      set({ user: { ...res.data.admin, role: 'admin' }, token: res.data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Admin login failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: () => {
    safeStorage.remove('token');
    safeStorage.remove('loginTime');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = safeStorage.get('token');
    if (!token) {
      set({ isAuthenticated: false, isInitialized: true });
      return;
    }

    const loginTimeStr = safeStorage.get('loginTime');
    let loginTime = loginTimeStr ? parseInt(loginTimeStr, 10) : null;
    
    // Smooth transition for already logged in users who don't have a loginTime yet
    if (!loginTime) {
      loginTime = Date.now();
      safeStorage.set('loginTime', loginTime.toString());
    }

    const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
    if (Date.now() - loginTime > FIVE_DAYS) {
      safeStorage.remove('token');
      safeStorage.remove('loginTime');
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data, isAuthenticated: true, isInitialized: true });
    } catch (err) {
      safeStorage.remove('token');
      safeStorage.remove('loginTime');
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
    }
  },

  updateUser: (userData) => {
    set((state) => ({ user: { ...state.user, ...userData } }));
  }
}));

export default useAuthStore;

