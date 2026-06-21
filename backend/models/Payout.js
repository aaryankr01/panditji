const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    pandit: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    panditProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Pandit', required: true },
    amount: { type: Number, required: true }, // Amount paid in paise
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }], // Settled payment IDs
    receiptImage: { type: String, required: true }, // Cloudinary URL of the payment receipt
    payoutMethod: { type: String, enum: ['upi', 'qr_code', 'bank_transfer'], required: true },
    transactionId: { type: String, required: true },
    payoutDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payout', payoutSchema);
