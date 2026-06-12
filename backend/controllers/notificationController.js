const Notification = require('../models/Notification');

/**
 * Shared helper — saves a notification to MongoDB and emits it via Socket.IO.
 * Called from bookingController, chatSocket, and anywhere else.
 */
const createAndEmitNotification = async (receiverId, { senderId = null, type, title, message, bookingId = null }) => {
  try {
    const notification = await Notification.create({
      receiverId,
      senderId,
      type,
      title,
      message,
      bookingId,
    });

    // Emit in real-time to the user's personal room (covers ALL sockets they have open,
    // e.g. GlobalNotificationListener + PanditDashboard both connected simultaneously)
    if (global.io) {
      global.io.to(`user_${receiverId.toString()}`).emit('notification', notification);
    }

    return notification;
  } catch (err) {
    console.error('❌ createAndEmitNotification error:', err.message);
    return null;
  }
};

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ receiverId: req.user.id })
      .sort('-createdAt')
      .limit(50);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-read
// @access  Private
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ receiverId: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markOneRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, receiverId: req.user.id },
      { isRead: true }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.createAndEmitNotification = createAndEmitNotification;
