const chatSocket = require('./chatSocket');
const adminSocket = require('./adminSocket');
const notifySocket = require('./notifySocket');

const initSocket = (io) => {
  const activeUsers = new Map();
  global.activeUsers = activeUsers; // make accessible in bookingController
  global.io = io; // make accessible in any controller

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins with userId and role
    socket.on('join', ({ userId, role, city }) => {
      const uId = userId?.toString();
      if (uId) {
        activeUsers.set(uId, socket.id);
        console.log(`📡 Socket: User ${uId} (${role}) joined on socket ${socket.id}`);
      }
      
      // All pandits join a shared room for broadcast
      if (role === 'pandit') {
        socket.join('all_pandits');
        console.log(`📡 Socket: Pandit ${uId} joined all_pandits room`);
        // Also join their city room
        if (city) {
          const cityRoom = `city_${city.toLowerCase().replace(/\s/g, '_')}`;
          socket.join(cityRoom);
          console.log(`📡 Socket: Pandit ${uId} joined city room: ${cityRoom}`);
        }
      }

      io.emit('activeUsers', Array.from(activeUsers.keys()));
    });

    // Register modular socket handlers
    chatSocket(io, socket, activeUsers);
    adminSocket(io, socket);
    notifySocket(io, socket, activeUsers);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      for (let [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          break;
        }
      }
      io.emit('activeUsers', Array.from(activeUsers.keys()));
    });
  });
};

module.exports = initSocket;
