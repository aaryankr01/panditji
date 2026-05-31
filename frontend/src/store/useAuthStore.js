import { create } from 'zustand';
import api from '../utils/api';

// iOS Safari in Private Browsing mode throws a SecurityError on localStorage access.
// This safe wrapper silently falls back to an in-memory map so the app always loads.
const safeStorage = (() => {
  try {
    localStorage.setItem('__test__', '1');
    localStorage.removeItem('__test__');
    return {
      get: (k) => localStorage.getItem(k),
      set: (k, v) => localStorage.setItem(k, v),
      remove: (k) => localStorage.removeItem(k),
    };
  } catch {
    const mem = {};
    return {
      get: (k) => mem[k] ?? null,
      set: (k, v) => { mem[k] = v; },
      remove: (k) => { delete mem[k]; },
    };
  }
})();

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
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = safeStorage.get('token');
    if (!token) {
      set({ isAuthenticated: false, isInitialized: true });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data, isAuthenticated: true, isInitialized: true });
    } catch (err) {
      safeStorage.remove('token');
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
    }
  },

  updateUser: (userData) => {
    set((state) => ({ user: { ...state.user, ...userData } }));
  }
}));

export default useAuthStore;

