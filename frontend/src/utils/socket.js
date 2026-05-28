import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://panditji-1tf8.onrender.com';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false });
  }
  return socket;
};

export const connectSocket = (userId) => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit('join', userId);
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};

export default getSocket;
