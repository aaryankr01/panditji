const mongoose = require('mongoose');

const templeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    deity: { type: String, required: true },
    location: { type: String, required: true },
    state: { type: String, required: true },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    chadavaEnabled: { type: Boolean, default: true },
    prasadEnabled: { type: Boolean, default: true },
    // Admin sets these preset donation amounts (e.g. [51, 101, 251, 501, 1001])
    chadavaPresets: { type: [Number], default: [51, 101, 251, 501, 1001] },
    prasadItem: {
      name: { type: String, default: 'Prasad' },
      price: { type: Number, default: 151 },
      deliveryDays: { type: Number, default: 7 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Temple', templeSchema);
