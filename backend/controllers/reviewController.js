const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Add a review for a pandit
// @route   POST /api/reviews
// @access  Private/Devotee
exports.addReview = async (req, res, next) => {
  try {
    const { panditId, rating, comment } = req.body;
    const devoteeId = req.user.id;

    // Check if pandit exists
    const pandit = await User.findById(panditId);
    if (!pandit || pandit.role !== 'pandit') {
      return res.status(404).json({ success: false, message: 'Pandit not found' });
    }

    // Create review
    const review = await Review.create({
      pandit: panditId,
      devotee: devoteeId,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a specific pandit
// @route   GET /api/reviews/pandit/:panditId
// @access  Public
exports.getPanditReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ pandit: req.params.panditId })
      .populate('devotee', 'firstName lastName avatar')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
};
