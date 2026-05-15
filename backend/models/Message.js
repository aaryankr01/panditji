const mongoose = require('mongoose');

// Conversation between devotee and pandit
const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    isActive: { type: Boolean, default: true },
    // Admin tracking
    flaggedByAdmin: { type: Boolean, default: false },
    adminNote: { type: String },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

// Individual messages
const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, maxlength: 2000, default: '' },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'contact_share', 'booking_request', 'system'],
      default: 'text',
    },
    fileUrl: { type: String },
    // For contact sharing (pandit shares WhatsApp)
    contactData: {
      phone: String,
      whatsapp: String,
      name: String,
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'seen'],
      default: 'sent',
    },
    isDeletedBySender: { type: Boolean, default: false },
    isDeletedByReceiver: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = { Conversation, Message };