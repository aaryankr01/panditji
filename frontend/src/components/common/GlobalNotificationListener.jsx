import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';

const SOCKET_URL = 'http://panditji-1tf8.onrender.com';

const GlobalNotificationListener = () => {
  const { user, token } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const locationRef = useRef(location.pathname);

  // Keep locationRef in sync without triggering socket reconnects
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!token || !user) return;

    // Disconnect any existing socket before creating a new one
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Connect socket — stays alive for the entire session
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
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

    // 1. Listen for new chat messages
    socket.on('newMessage', (msg) => {
      if (locationRef.current !== '/chat' && locationRef.current !== '/pandit-dashboard') {
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

    // 2. Listen for Booking Accepted (for Devotee)
    socket.on('bookingAccepted', (booking) => {
      toast.success(
        `Your booking for ${booking.pujaType} was accepted by Pt. ${booking.pandit?.firstName}!`,
        { duration: 5000, position: 'top-right' }
      );
    });

    // 3. Listen for Booking Status Updated (for Devotee)
    socket.on('bookingStatusUpdated', ({ bookingId, status }) => {
      let icon = '🔔';
      if (status === 'completed') icon = '✅';
      if (status === 'cancelled') icon = '❌';
      toast(`Your booking status was updated to: ${status}`, {
        duration: 5000,
        position: 'top-right',
        icon,
      });
    });

    // 4. Listen for New Booking Request (for Pandit)
    socket.on('newBookingRequest', (booking) => {
      if (locationRef.current !== '/pandit-dashboard') {
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

    // 5. Listen for Admin Broadcast Notifications — shown to ALL users regardless of page
    socket.on('adminBroadcast', (data) => {
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
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token]); // ← Only reconnect on login/logout, NOT on every page navigation

  return null;
};

export default GlobalNotificationListener;
