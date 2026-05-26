const mongoose = require("mongoose");

const resetTokenSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  purpose: {
    type: String,
    enum: ["password_reset", "registration"],
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Auto-delete after 10 minutes (MongoDB TTL)
  },
});

module.exports = mongoose.model("ResetToken", resetTokenSchema);
