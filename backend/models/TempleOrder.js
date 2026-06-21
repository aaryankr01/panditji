const mongoose = require('mongoose');

const templeOrderSchema = new mongoose.Schema(
  {
    devotee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    temple: { type: mongoose.Schema.Types.ObjectId, ref: 'Temple', required: true },
    templeName: { type: String, required: true }, // denormalized for quick display
    orderType: { type: String, enum: ['chadava', 'prasad'], required: true },

    // Chadava fields
    amount: { type: Number, required: true }, // in rupees
    dedicatedTo: { type: String, default: '' }, // optional dedication message

    // Prasad fields
    prasadItem: { type: String, default: '' },
    deliveryName: { type: String, default: '' },
    deliveryAddress: { type: String, default: '' },
    deliveryCity: { type: String, default: '' },
    deliveryPincode: { type: String, default: '' },
    deliveryPhone: { type: String, default: '' },
    deliveryStatus: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'delivered'],
      default: 'placed',
    },
    trackingId: { type: String, default: '' },

    // Payment
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String, default: '' },
  },
  { timestamps: true }
);

templeOrderSchema.index({ devotee: 1, createdAt: -1 });
templeOrderSchema.index({ temple: 1, orderType: 1 });

module.exports = mongoose.model('TempleOrder', templeOrderSchema);
