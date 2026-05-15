const { Message, Conversation } = require('../models/Message');
const User = require('../models/User');

// @desc    Get chat history between current user and another user
// @route   GET /api/chat/:userId
// @access  Private
exports.getChatHistory = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    }).sort('createdAt');

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text, type, fileUrl } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Please provide receiver' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants: [senderId, receiverId] });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content: text || '',
      type: type || 'text',
      fileUrl: fileUrl || null
    });

    // Update conversation lastMessage
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      lastMessageAt: new Date()
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's conversations list (people they've chatted with)
// @route   GET /api/chat/conversations/list
// @access  Private
exports.getConversationsList = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    const conversations = await Conversation.find({
      participants: currentUserId
    }).populate({
      path: 'participants',
      select: 'firstName lastName email avatar role',
      match: { _id: { $ne: currentUserId } }
    }).sort('-lastMessageAt');

    // Flatten to list of other users
    const users = conversations
      .map(c => c.participants[0])
      .filter(Boolean);

    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload file for chat
// @route   POST /api/chat/upload
// @access  Private
exports.uploadChatFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // multer-storage-cloudinary puts the URL in req.file.path
    const fileUrl = req.file.path;
    res.status(200).json({ success: true, fileUrl });
  } catch (err) {
    next(err);
  }
};
