const User = require('../models/User');
const { Message } = require('../models/Message');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get all users (optionally filtered by role)
// @route   GET /api/admin/users?role=pandit
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter).populate('panditProfile').select('-password').sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all messages between two users (chat tracking)
// @route   GET /api/admin/conversations/:user1Id/:user2Id
// @access  Private/Admin
exports.getConversation = async (req, res, next) => {
  try {
    const { user1Id, user2Id } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: user1Id, receiver: user2Id },
        { sender: user2Id, receiver: user1Id }
      ]
    }).sort('createdAt');
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPandits = await User.countDocuments({ role: 'pandit' });
    const totalDevotees = await User.countDocuments({ role: 'devotee' });
    const totalMessages = await Message.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const revenueAggregation = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCompanyEarnings: { $sum: '$companyEarnings' }
        }
      }
    ]);

    const totalRevenue = revenueAggregation[0]?.totalAmount || 0;
    const totalCompanyEarnings = revenueAggregation[0]?.totalCompanyEarnings || 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers, totalPandits, totalDevotees, totalMessages,
        totalBookings,
        totalRevenue,
        totalCompanyEarnings
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings (admin view)
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('devotee', 'firstName lastName email')
      .populate('pandit', 'firstName lastName email')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all payments (admin view)
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('devotee', 'firstName lastName')
      .populate('pandit', 'firstName lastName')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
};
