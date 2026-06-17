const Review = require('../models/Review');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Pandit = require('../models/Pandit');

// @desc    Add a review for a pandit
// @route   POST /api/reviews
// @access  Private/Devotee
exports.addReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const devoteeId = req.user.id;

    // Find and validate the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.devotee.toString() !== devoteeId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to review this booking' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review completed bookings' });
    }

    if (booking.reviewed) {
      return res.status(400).json({ success: false, message: 'This booking has already been reviewed' });
    }

    // Get pandit and their profile
    const panditId = booking.pandit;
    if (!panditId) {
      return res.status(400).json({ success: false, message: 'No pandit assigned to this booking' });
    }

    const panditProfile = await Pandit.findOne({ user: panditId });
    if (!panditProfile) {
      return res.status(404).json({ success: false, message: 'Pandit profile not found' });
    }

    // Create review
    const review = await Review.create({
      booking: bookingId,
      devotee: devoteeId,
      pandit: panditId,
      panditProfile: panditProfile._id,
      rating,
      comment
    });

    // Mark booking as reviewed
    booking.reviewed = true;
    await booking.save();

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
      .populate('booking', 'pujaType')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
};

// @desc    Get latest reviews across platform (for home page)
// @route   GET /api/reviews/latest
// @access  Public
exports.getLatestReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ comment: { $exists: true, $ne: '' } })
      .populate('devotee', 'firstName lastName avatar')
      .populate('booking', 'pujaType')
      .sort('-createdAt')
      .limit(6);

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
};

const AppReview = require('../models/AppReview');

// @desc    Add a review for the app/platform
// @route   POST /api/reviews/app
// @access  Private
exports.addAppReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const appReview = await AppReview.create({
      user: userId,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: appReview });
  } catch (err) {
    next(err);
  }
};

// @desc    Get app reviews
// @route   GET /api/reviews/app
// @access  Public
exports.getAppReviews = async (req, res, next) => {
  try {
    const reviews = await AppReview.find()
      .populate('user', 'firstName lastName avatar role')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};
