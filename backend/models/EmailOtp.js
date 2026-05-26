const mongoose = require("mongoose");

const emailOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["registration", "password_reset"],
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 10 minutes TTL
  },
});

emailOtpSchema.index({ email: 1, purpose: 1 });
module.exports = mongoose.model("EmailOtp", emailOtpSchema);
