const { Message, Conversation } = require('../models/Message');
const { createAndEmitNotification } = require('../controllers/notificationController');

module.exports = (io, socket, activeUsers) => {
  socket.on('adminJoin', () => {
    socket.join('admin_tracking');
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, receiverId, text, type, fileUrl } = data;

      // ENFORCE PAYMENT GATING
      const Booking = require('../models/Booking');
      const hasPaidBooking = await Booking.findOne({
        $or: [
          { devotee: senderId, pandit: receiverId },
          { devotee: receiverId, pandit: senderId }
        ],
        status: 'confirmed',
        paymentStatus: 'paid'
      });

      if (!hasPaidBooking) {
        console.log(`🚫 Chat Blocked: No paid booking between ${senderId} and ${receiverId}`);
        return socket.emit('error', { message: 'Chat is locked. Payment required.' });
      }

      // Find or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] }
      });
      if (!conversation) {
        conversation = await Conversation.create({ participants: [senderId, receiverId] });
      }

      let initialStatus = 'sent';
      const receiverSocketId = activeUsers.get(receiverId.toString());
      if (receiverSocketId) {
        initialStatus = 'delivered';
      }

      // Save to DB with correct schema fields
      const message = await Message.create({
        conversation: conversation._id,
        sender: senderId,
        receiver: receiverId,
        content: text || '',
        type: type || 'text',
        fileUrl: fileUrl || null,
        status: initialStatus
      });

      // Update conversation lastMessage
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: message._id,
        lastMessageAt: new Date()
      });

      // Emit to receiver if online
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', message);
      }

      // Persist chat notification for receiver (badge + bell history)
      await createAndEmitNotification(receiverId, {
        senderId,
        type: 'chat',
        title: '💬 New Message',
        message: (text || '').slice(0, 80) || '📎 Attachment',
      });

      // Emit back to sender
      socket.emit('messageSent', message);

      // Broadcast to admin dashboard room if tracking
      io.to('admin_tracking').emit('admin_newMessage', message);

    } catch (err) {
      console.error('Socket send message error:', err);
    }
  });

  socket.on('markDelivered', async ({ messageId, senderId }) => {
    try {
      const msg = await Message.findByIdAndUpdate(messageId, { status: 'delivered' }, { new: true });
      if (msg) {
        const senderSocketId = activeUsers.get(senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageStatusUpdated', { messageId, status: 'delivered' });
        }
      }
    } catch (err) { console.error(err); }
  });

  socket.on('markSeen', async ({ messageId, senderId }) => {
    try {
      const msg = await Message.findByIdAndUpdate(messageId, { 
        status: 'seen',
        isRead: true,
        readAt: new Date()
      }, { new: true });
      if (msg) {
        const senderSocketId = activeUsers.get(senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageStatusUpdated', { messageId, status: 'seen' });
        }
      }
    } catch (err) { console.error(err); }
  });

  socket.on('markConversationSeen', ({ conversationId, readerId, senderId }) => {
    try {
      // 1. Instantly notify the sender (optimistic relay on server)
      // This tells the sender that the recipient has read the messages
      const senderSocketId = activeUsers.get(senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit('conversationSeen', { conversationId, readerId, status: 'seen' });
      }

      // 2. Perform DB update asynchronously (non-blocking)
      Message.updateMany(
        { conversation: conversationId, receiver: readerId, status: { $ne: 'seen' } },
        { $set: { status: 'seen', isRead: true, readAt: new Date() } }
      ).catch(err => console.error('Error in markConversationSeen DB update:', err));
      
    } catch (err) {
      console.error('markConversationSeen error:', err);
    }
  });

  socket.on('deleteMessage', async ({ messageId, deletedBy, type }) => {
    // type: 'me' or 'everyone'
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return;

      if (type === 'everyone') {
        if (msg.sender.toString() === deletedBy) {
          msg.isDeletedBySender = true;
          msg.isDeletedByReceiver = true;
          msg.content = 'This message was deleted';
          msg.fileUrl = null;
        }
      } else if (type === 'me') {
        if (msg.sender.toString() === deletedBy) {
          msg.isDeletedBySender = true;
        } else if (msg.receiver.toString() === deletedBy) {
          msg.isDeletedByReceiver = true;
        }
      }
      
      await msg.save();

      // Broadcast to both so UI updates
      const senderSocketId = activeUsers.get(msg.sender.toString());
      const receiverSocketId = activeUsers.get(msg.receiver.toString());
      
      if (senderSocketId) io.to(senderSocketId).emit('messageDeleted', { messageId, type, deletedBy, newMsg: msg });
      if (receiverSocketId) io.to(receiverSocketId).emit('messageDeleted', { messageId, type, deletedBy, newMsg: msg });
      
    } catch (err) { console.error(err); }
  });
};

