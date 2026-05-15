import React, { createContext, useContext, useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../utils/socket';
import useAuthStore from '../store/useAuthStore';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      connectSocket(user._id);
    }
    return () => disconnectSocket();
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={getSocket()}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);

export default SocketContext;
