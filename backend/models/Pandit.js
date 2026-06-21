const mongoose = require('mongoose');

const panditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specializations: [
      {
        type: String,
        enum: [
          'Griha Pravesh',
          'Satyanarayan Katha',
          'Vivah Ceremony',
          'Mundan Ceremony',
          'Navratri Puja',
          'Durga Puja',
          'Havan & Yagya',
          'Naamkaran',
          'Ganesh Puja',
          'Lakshmi Puja',
          'Rudrabhishek',
          'Surya Puja',
          'All Pujas',
        ],
      },
    ],
    experience: { type: Number, default: 0 }, // years
    bio: { type: String, maxlength: 500 },
    languages: [{ type: String }],
    feePerPuja: { type: Number, required: true, default: 1500 },
    city: { type: String, required: true },
    state: { type: String },
    serviceRadius: { type: Number, default: 20 }, // km
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    rating: { type: Number, default: 3.8, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    whatsappNumber: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    documents: [{ type: String }], // verification docs
    aadharNumber: { type: String, default: '' },
    isAadharVerified: { type: Boolean, default: false },
    aadharDetails: { type: Object, default: null }, // To store fetched KYC info
    subscription: {
      isActive: { type: Boolean, default: false },
      startDate: { type: Date },
      endDate: { type: Date },
      razorpaySubId: { type: String },
    },
    adminNotes: { type: String }, // admin can add notes
    bankDetails: {
      payoutMethod: {
        type: String,
        enum: ['upi', 'qr_code', 'bank_transfer'],
        default: 'bank_transfer',
      },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
      upiId: { type: String, default: '' },
      qrCode: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

panditSchema.index({ location: '2dsphere' });
panditSchema.index({ city: 1, isApproved: 1 });

module.exports = mongoose.model('Pandit', panditSchema);