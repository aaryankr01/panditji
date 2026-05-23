const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel',
    required: true
  },
  userModel: {
    type: String,
    required: true,
    enum: ['User', 'Admin']
  },
  userRole: {
    type: String,
    enum: ['devotee', 'pandit', 'admin'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Booking', 'Payments', 'Account', 'Technical', 'Subscription', 'Other'],
    default: 'Other'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  adminReply: {
    type: String,
    default: ''
  },
  repliedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
