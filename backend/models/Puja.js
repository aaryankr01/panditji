const mongoose = require('mongoose');

const PujaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["Devotional", "Remedial", "Festival", "Celebration", "Ancestral"], required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number },
  rating: { type: Number, default: 4.5 },
  tag: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true },
  duration: { type: String, default: "1.5 hrs" }
}, { timestamps: true });

module.exports = mongoose.model('Puja', PujaSchema);
