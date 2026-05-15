import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../utils/socket';
import useAuthStore from '../store/useAuthStore';

const useSocket = (onMessage) => {
  const { user } = useAuthStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    socketRef.current = connectSocket(user._id);

    if (onMessage) {
      socketRef.current.on('newMessage', onMessage);
      socketRef.current.on('messageSent', onMessage);
    }

    return () => {
      if (onMessage) {
        socketRef.current?.off('newMessage', onMessage);
        socketRef.current?.off('messageSent', onMessage);
      }
    };
  }, [user?._id]);

  return socketRef.current;
};

export default useSocket;
