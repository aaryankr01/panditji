import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://panditji-1tf8.onrender.com';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      // polling first ensures iOS carrier networks that block raw WebSocket still work
      transports: ['polling', 'websocket'],
    });
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
