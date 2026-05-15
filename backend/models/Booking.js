const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    devotee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pandit: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    panditProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Pandit', default: null },
    pujaType: {
      type: String,
      required: true,
      enum: [
        'Griha Pravesh', 'Satyanarayan Katha', 'Vivah Ceremony',
        'Mundan Ceremony', 'Navratri Puja', 'Durga Puja',
        'Havan & Yagya', 'Naamkaran', 'Ganesh Puja',
        'Lakshmi Puja', 'Rudrabhishek', 'Surya Puja', 'Other',
      ],
    },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    fee: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String },
    notes: { type: String },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['devotee', 'pandit', 'admin'] },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ devotee: 1, status: 1 });
bookingSchema.index({ pandit: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);