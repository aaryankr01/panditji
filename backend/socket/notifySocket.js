const Notification = require('../models/Notification');

module.exports = (io, socket, activeUsers) => {
  // Client emits this when user opens the bell dropdown — mark all as read
  socket.on('markNotificationsRead', async ({ userId }) => {
    try {
      if (!userId) return;
      await Notification.updateMany({ receiverId: userId, isRead: false }, { isRead: true });
      socket.emit('notificationsMarkedRead', { unreadCount: 0 });
    } catch (err) {
      console.error('❌ markNotificationsRead error:', err.message);
    }
  });
};
