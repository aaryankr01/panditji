const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    pandit: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    panditProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Pandit', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    devotee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['subscription', 'booking_fee'],
      required: true,
    },
    amount: { type: Number, required: true }, // Total amount paid in paise
    panditEarnings: { type: Number, default: 0 }, // 90% of booking fee
    companyEarnings: { type: Number, default: 0 }, // 10% of booking fee
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded', 'completed'],
      default: 'created',
    },
    paymentMethod: { type: String },
    transactionId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    month: { type: String }, // e.g. "2024-08" for subscription tracking
    description: { type: String },
    failureReason: { type: String },
    payoutStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    payoutDate: { type: Date },
    payoutTransactionId: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ pandit: 1, status: 1 });
paymentSchema.index({ month: 1 });

module.exports = mongoose.model('Payment', paymentSchema);