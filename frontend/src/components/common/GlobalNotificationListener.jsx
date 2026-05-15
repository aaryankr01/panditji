import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';

const SOCKET_URL = 'http://localhost:5000';

const GlobalNotificationListener = () => {
  const { user, token } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!token || !user) return;

    // Connect socket
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', { userId: user._id, role: user.role, city: user.city });
    });

    // 1. Listen for new chat messages
    socket.on('newMessage', (msg) => {
      // Don't show toast if they are already actively on the chat page viewing messages
      if (location.pathname !== '/chat' && location.pathname !== '/pandit-dashboard') {
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

    // 4. Listen for New Booking Request (for Pandit) - Fallback or additional toast
    socket.on('newBookingRequest', (booking) => {
      if (location.pathname !== '/pandit-dashboard') {
        toast((t) => (
          <div className="flex flex-col gap-1 cursor-pointer" onClick={() => { toast.dismiss(t.id); navigate('/pandit-dashboard'); }}>
            <span className="font-bold text-orange-600 text-sm">New Puja Request!</span>
            <span className="text-gray-600 text-sm">{booking.pujaType} in {booking.city}</span>
            <span className="text-xs text-gray-500 font-semibold mt-1">Click to accept</span>
          </div>
        ), {
          duration: 6000,
          position: 'top-right',
          style: { borderLeft: '4px solid #22c55e' },
          icon: '🔔',
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, token, location.pathname, navigate]);

  // This component doesn't render anything visually by itself
  return null;
};

export default GlobalNotificationListener;
