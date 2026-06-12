import { create } from 'zustand';
import api from '../utils/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  hasFetched: false,

  /**
   * Fetch all notifications from the API (newest first, max 50).
   * Called once when the user logs in / bell is first rendered.
   */
  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      set({
        notifications: res.data.data || [],
        unreadCount: res.data.unreadCount || 0,
        hasFetched: true,
      });
    } catch (err) {
      console.error('fetchNotifications error:', err.message);
    }
  },

  /**
   * Called by GlobalNotificationListener when a real-time 'notification'
   * socket event arrives. Prepends to list and bumps badge.
   */
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }));
  },

  /**
   * Mark every unread notification as read — calls the REST API and resets the badge.
   */
  markAllRead: async () => {
    try {
      await api.patch('/notifications/mark-read');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('markAllRead error:', err.message);
    }
  },

  /**
   * Mark a single notification as read by id.
   */
  markOneRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
        const unread = updated.filter((n) => !n.isRead).length;
        return { notifications: updated, unreadCount: unread };
      });
    } catch (err) {
      console.error('markOneRead error:', err.message);
    }
  },
}));

export default useNotificationStore;
