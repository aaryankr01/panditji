import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import useNotificationStore from '../../store/useNotificationStore';
import {
  unlockAudio,
  playBookingRing,
  stopBookingRing,
  playAcceptDing,
  playChatDing,
} from '../../utils/notificationSound';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://panditji-1tf8.onrender.com';

const GlobalNotificationListener = () => {
  const { user, token } = useAuthStore();
  const { addNotification, fetchNotifications } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const locationRef = useRef(location.pathname);

  // Keep locationRef in sync without triggering socket reconnects
  useEffect(() => {
    locationRef.current = location.pathname;
    if (location.pathname !== '/pandit-dashboard') {
      stopBookingRing();
    }
  }, [location.pathname]);

  // Unlock iOS audio on first user interaction
  useEffect(() => {
    const unlock = () => unlockAudio();
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!token || !user) return;

    // Fetch persisted notifications once so bell badge is correct on load
    fetchNotifications();

    // Disconnect any existing socket before creating a new one
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Connect socket — stays alive for the entire session
    const socket = io(SOCKET_URL, {
      // 'polling' first ensures iOS networks that block raw WebSocket upgrades still work.
      // Socket.IO will automatically upgrade to 'websocket' when the network allows it.
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      socket.emit('join', { userId: user._id, role: user.role, city: user.city });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    // ── NEW: Persistent notification event from backend ─────────────────────
    socket.on('notification', (data) => {
      addNotification(data); // bump bell count + prepend to list

      const allowedPaths = ['/pandit-dashboard', '/devotee-dashboard', '/chat'];
      const isAllowedPath = allowedPaths.includes(locationRef.current);

      if (data.type === 'booking_request') {
        if (isAllowedPath) {
          playBookingRing();
          toast(
            (t) => (
              <div
                className="flex flex-col gap-1 cursor-pointer"
                onClick={() => { toast.dismiss(t.id); navigate('/pandit-dashboard'); }}
              >
                <span className="font-bold text-orange-600 text-sm">🔔 New Puja Request!</span>
                <span className="text-gray-600 text-sm">{data.message}</span>
                <span className="text-xs text-gray-500 font-semibold mt-1">Click to view</span>
              </div>
            ),
            { duration: 7000, position: 'top-right', icon: null }
          );
        }

      } else if (data.type === 'booking_accepted') {
        stopBookingRing();
        if (isAllowedPath) {
          playAcceptDing();
          toast.success(data.message, { duration: 5000, position: 'top-right' });
        }

      } else if (data.type === 'booking_rejected' || data.type === 'booking_cancelled') {
        stopBookingRing();
        if (isAllowedPath) {
          toast(data.message, { duration: 5000, position: 'top-right', icon: '❌' });
        }

      } else if (data.type === 'chat') {
        const onChat = locationRef.current === '/chat' || locationRef.current === '/pandit-dashboard';
        if (!onChat && isAllowedPath) {
          playChatDing();
          toast(
            (t) => (
              <div
                className="flex flex-col gap-1 cursor-pointer"
                onClick={() => { toast.dismiss(t.id); navigate('/chat'); }}
              >
                <span className="font-bold text-gray-800 text-sm">💬 New Message</span>
                <span className="text-gray-600 text-sm truncate max-w-[200px]">{data.message}</span>
                <span className="text-xs text-orange-600 font-semibold mt-1">Click to view</span>
              </div>
            ),
            { duration: 4000, position: 'top-right', style: { borderLeft: '4px solid #ea580c' }, icon: null }
          );
        }
      }
    });

    // ── Legacy events (kept for backward compatibility) ──────────────────────

    // 1. Listen for new chat messages (legacy)
    socket.on('newMessage', (msg) => {
      const allowedPaths = ['/pandit-dashboard', '/devotee-dashboard', '/chat'];
      const isAllowedPath = allowedPaths.includes(locationRef.current);

      if (isAllowedPath && locationRef.current !== '/chat' && locationRef.current !== '/pandit-dashboard') {
        toast((t) => (
          <div className="flex flex-col gap-1 cursor-pointer" onClick={() => { toast.dismiss(t.id); navigate('/chat'); }}>
            <span className="font-bold text-gray-800 text-sm">New Message</span>
            <span className="text-gray-600 text-sm truncate max-w-[200px]">{msg.content}</span>
            <span className="text-xs text-orange-600 font-semibold mt-1">Click to view</span>
          </div>
        ), {
          duration: 4000,
          position: 'top-right',
          style: { borderLeft: '4px solid #ea580c' },
          icon: '💬',
        });
      }
    });

    // 2. Listen for Booking Accepted (for Devotee) — legacy
    socket.on('bookingAccepted', (booking) => {
      const allowedPaths = ['/pandit-dashboard', '/devotee-dashboard', '/chat'];
      const isAllowedPath = allowedPaths.includes(locationRef.current);

      if (isAllowedPath) {
        toast.success(
          `Your booking for ${booking.pujaType} was accepted by Pt. ${booking.pandit?.firstName}!`,
          { duration: 5000, position: 'top-right' }
        );
      }
    });

    // 3. Listen for Booking Status Updated (for Devotee) — legacy
    socket.on('bookingStatusUpdated', ({ bookingId, status }) => {
      const allowedPaths = ['/pandit-dashboard', '/devotee-dashboard', '/chat'];
      const isAllowedPath = allowedPaths.includes(locationRef.current);

      if (isAllowedPath) {
        let icon = '🔔';
        if (status === 'completed') icon = '✅';
        if (status === 'cancelled') icon = '❌';
        toast(`Your booking status was updated to: ${status}`, {
          duration: 5000,
          position: 'top-right',
          icon,
        });
      }
    });

    // 4. Listen for New Booking Request (for Pandit) — legacy
    socket.on('newBookingRequest', (booking) => {
      const allowedPaths = ['/pandit-dashboard', '/devotee-dashboard', '/chat'];
      const isAllowedPath = allowedPaths.includes(locationRef.current);

      if (isAllowedPath && locationRef.current !== '/pandit-dashboard') {
        toast((t) => (
          <div className="flex flex-col gap-1 cursor-pointer" onClick={() => { toast.dismiss(t.id); navigate('/pandit-dashboard'); }}>
            <span className="font-bold text-orange-600 text-sm">New Puja Request!</span>
            <span className="text-gray-600 text-sm">{booking.pujaType} in {booking.city}</span>
            <span className="text-xs text-gray-500 font-semibold mt-1">Click to accept</span>
          </div>
        ), {
          duration: 6000,
          position: 'top-right',
          icon: '🔔',
        });
      }
    });

    // 5. Listen for Admin Broadcast Notifications
    socket.on('adminBroadcast', (data) => {
      const allowedPaths = ['/pandit-dashboard', '/devotee-dashboard', '/chat'];
      const isAllowedPath = allowedPaths.includes(locationRef.current);

      if (isAllowedPath) {
        toast((t) => (
          <div className="flex flex-col gap-1.5 p-0.5 text-left">
            <span className="font-bold text-red-700 text-sm flex items-center gap-1.5">
              📢 Announcement
            </span>
            <span className="text-gray-800 text-sm font-semibold">{data.title}</span>
            <span className="text-gray-600 text-xs leading-relaxed">{data.message}</span>
          </div>
        ), {
          duration: 8000,
          position: 'top-right',
          style: {
            borderLeft: '5px solid #dc2626',
            backgroundColor: '#FFF5F5',
            color: '#7F1D1D',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          },
        });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token]); // ← Only reconnect on login/logout, NOT on every page navigation

  return null;
};

export default GlobalNotificationListener;
