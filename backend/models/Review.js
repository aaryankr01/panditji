const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    devotee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pandit: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    panditProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Pandit', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    isVisible: { type: Boolean, default: true },
    adminHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Update pandit avg rating after review
reviewSchema.post('save', async function () {
  const Pandit = require('./Pandit');
  const Review = this.constructor;
  const stats = await Review.aggregate([
    { $match: { panditProfile: this.panditProfile } },
    { $group: { _id: '$panditProfile', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Pandit.findByIdAndUpdate(this.panditProfile, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);