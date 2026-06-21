const User = require('../models/User');
const { Message } = require('../models/Message');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Pandit = require('../models/Pandit');

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

// @desc    Approve Pandit Profile
// @route   PATCH /api/admin/users/:id/approve-pandit
// @access  Private/Admin
exports.approvePandit = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'pandit' || !user.panditProfile) {
      return res.status(404).json({ success: false, message: 'Pandit not found' });
    }

    await Pandit.findByIdAndUpdate(user.panditProfile, {
      isApproved: true,
      isAadharVerified: true
    });

    res.status(200).json({ success: true, message: 'Pandit approved successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject Pandit Profile
// @route   PATCH /api/admin/users/:id/reject-pandit
// @access  Private/Admin
exports.rejectPandit = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'pandit' || !user.panditProfile) {
      return res.status(404).json({ success: false, message: 'Pandit not found' });
    }

    await Pandit.findByIdAndUpdate(user.panditProfile, {
      isApproved: false,
      isAadharVerified: false
    });

    res.status(200).json({ success: true, message: 'Pandit rejected' });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve cancellation request and refund money (90% to devotee, 10% kept by company)
// @route   PATCH /api/admin/bookings/:id/cancel-approve
// @access  Private/Admin
exports.approveCancellation = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('devotee', 'firstName lastName email')
      .populate('pandit', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Change status to cancelled, paymentStatus to refunded
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledBy = 'admin';
    booking.cancellationReason = req.body.reason || 'Cancellation approved and processed by Admin';
    await booking.save();

    // Find and update the associated Payment record
    const payment = await Payment.findOne({ booking: booking._id });
    let refundAmount = 0;
    let retainedAmount = 0;
    if (payment) {
      // 10% deduction
      retainedAmount = Math.round(payment.amount * 0.1);
      refundAmount = payment.amount - retainedAmount;

      payment.status = 'refunded';
      payment.panditEarnings = 0; // Pandit gets nothing for cancelled puja
      payment.companyEarnings = retainedAmount; // Company retains 10%
      payment.description = `Refunded to devotee: ₹${(refundAmount / 100).toFixed(2)}. Company retained 10% cancellation charge: ₹${(retainedAmount / 100).toFixed(2)}.`;
      await payment.save();
    } else {
      // Fallback if payment record not found but booking fee exists
      retainedAmount = Math.round((booking.fee * 100) * 0.1);
      refundAmount = (booking.fee * 100) - retainedAmount;
    }

    // Add refund to devotee's wallet/UPI Lite balance
    const refundAmountInRupees = refundAmount / 100;
    const devoteeUser = await User.findById(booking.devotee._id || booking.devotee);
    if (devoteeUser) {
      devoteeUser.walletBalance = (devoteeUser.walletBalance || 0) + refundAmountInRupees;
      await devoteeUser.save();
    }

    // Notify Devotee and Pandit via socket
    if (global.io) {
      const devoteeSocketId = global.activeUsers?.get(booking.devotee._id.toString());
      if (devoteeSocketId) {
        global.io.to(devoteeSocketId).emit('bookingStatusUpdated', {
          bookingId: booking._id,
          status: 'cancelled',
          paymentStatus: 'refunded',
          message: `Your booking for ${booking.pujaType} has been cancelled by Admin. A refund of ₹${(refundAmount / 100).toFixed(2)} (after 10% cancellation fee) has been initiated.`
        });
      }

      if (booking.pandit) {
        const panditSocketId = global.activeUsers?.get(booking.pandit._id.toString());
        if (panditSocketId) {
          global.io.to(panditSocketId).emit('bookingCancelledByAdmin', {
            bookingId: booking._id,
            pujaType: booking.pujaType,
            devotee: `${booking.devotee.firstName} ${booking.devotee.lastName}`
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Cancellation and refund approved successfully',
      refundedAmount: refundAmount / 100,
      retainedAmount: retainedAmount / 100,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject cancellation request (restore booking status to confirmed)
// @route   PATCH /api/admin/bookings/:id/cancel-reject
// @access  Private/Admin
exports.rejectCancellation = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('devotee', 'firstName lastName email')
      .populate('pandit', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'cancellation_requested') {
      return res.status(400).json({ success: false, message: 'Booking is not under cancellation request' });
    }

    // Restore to confirmed
    booking.status = 'confirmed';
    await booking.save();

    // Notify Devotee via socket
    if (global.io) {
      const devoteeSocketId = global.activeUsers?.get(booking.devotee._id.toString());
      if (devoteeSocketId) {
        global.io.to(devoteeSocketId).emit('bookingStatusUpdated', {
          bookingId: booking._id,
          status: 'confirmed',
          message: `Your cancellation request for ${booking.pujaType} has been declined by the administrator.`
        });
      }
    }

    res.status(200).json({ success: true, message: 'Cancellation request declined. Booking status restored to confirmed.', data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Broadcast a notification to targeted users (all, pandit, devotee)
// @route   POST /api/admin/broadcast
// @access  Private/Admin
exports.broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, target } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const audience = target || 'all'; // default to all
    const payload = { title, message, target: audience, createdAt: new Date() };

    if (global.io) {
      if (audience === 'pandit') {
        global.io.to('all_pandits').emit('adminBroadcast', payload);
        console.log(`📢 Broadcasted to PANDITS: "${title}"`);
      } else if (audience === 'devotee') {
        global.io.to('all_devotees').emit('adminBroadcast', payload);
        console.log(`📢 Broadcasted to DEVOTEES: "${title}"`);
      } else {
        global.io.emit('adminBroadcast', payload);
        console.log(`📢 Broadcasted to ALL: "${title}"`);
      }
    }

    const targetLabel = audience === 'all' ? 'everyone' : `${audience}s`;
    res.status(200).json({ success: true, message: `Notification broadcasted to ${targetLabel} successfully` });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all payouts
// @route   GET /api/admin/payouts
// @access  Private/Admin
exports.getPayouts = async (req, res, next) => {
  try {
    const payments = await Payment.find({ type: 'booking_fee', status: 'completed' })
      .populate({
        path: 'booking',
        populate: [
          { path: 'devotee', select: 'firstName lastName email phone' },
          { path: 'pandit', select: 'firstName lastName email phone' }
        ]
      })
      .populate({
        path: 'pandit',
        select: 'firstName lastName email phone panditProfile',
        populate: {
          path: 'panditProfile',
          select: 'bankDetails'
        }
      })
      .populate('devotee', 'firstName lastName email phone')
      .sort('-createdAt');

    const payouts = payments.map(payment => {
      const p = payment.toObject();
      if (p.booking && p.booking.status === 'completed') {
        const completedAt = p.booking.completedAt || p.booking.updatedAt;
        const diffTime = Math.abs(new Date() - new Date(completedAt));
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        p.daysRemaining = Math.max(0, Math.ceil(15 - diffDays));
        p.isEligible = diffDays >= 15 && (p.payoutStatus === 'pending' || !p.payoutStatus);
      } else {
        p.daysRemaining = 15;
        p.isEligible = false;
      }
      return p;
    });

    res.status(200).json({ success: true, count: payouts.length, data: payouts });
  } catch (err) {
    next(err);
  }
};

// @desc    Process payout
// @route   POST /api/admin/payouts/:id/pay
// @access  Private/Admin
exports.processPayout = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('booking');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.type !== 'booking_fee') {
      return res.status(400).json({ success: false, message: 'Invalid payment type for payout' });
    }

    if (payment.payoutStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Payout already processed' });
    }

    if (!payment.booking || payment.booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Booking is not completed yet' });
    }

    const completedAt = payment.booking.completedAt || payment.booking.updatedAt;
    const diffTime = Math.abs(new Date() - new Date(completedAt));
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays < 15) {
      return res.status(400).json({
        success: false,
        message: `Payout is locked. ${Math.ceil(15 - diffDays)} days remaining.`
      });
    }

    const crypto = require('crypto');
    payment.payoutStatus = 'paid';
    payment.payoutDate = new Date();
    payment.payoutTransactionId = req.body.transactionId || `PO-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    await payment.save();

    res.status(200).json({ success: true, message: 'Payout processed successfully', data: payment });
  } catch (err) {
    next(err);
  }
};

// Helper to calculate the start (00:00:00) of Monday of the current week
const getStartOfCurrentWeekMonday = () => {
  const today = new Date();
  const day = today.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// @desc    Get summary of pending payouts (completed pujas before current Monday)
// @route   GET /api/admin/payouts/pending
// @access  Private/Admin
exports.getPendingPayoutsSummary = async (req, res, next) => {
  try {
    const mondayCutoff = getStartOfCurrentWeekMonday();

    const payments = await Payment.find({
      type: 'booking_fee',
      status: 'completed',
      $or: [
        { payoutStatus: 'pending' },
        { payoutStatus: { $exists: false } }
      ]
    })
    .populate({
      path: 'booking',
      populate: {
        path: 'devotee',
        select: 'firstName lastName'
      }
    })
    .populate({
      path: 'pandit',
      select: 'firstName lastName email phone',
      populate: {
        path: 'panditProfile',
        select: 'bankDetails'
      }
    });

    // Filter payments: associated booking status must be completed, and completedAt must be before mondayCutoff
    const eligiblePayments = payments.filter(p => {
      if (!p.booking || p.booking.status !== 'completed') return false;
      const completedAt = p.booking.completedAt || p.booking.updatedAt;
      return new Date(completedAt) < mondayCutoff;
    });

    // Group by Pandit
    const summaryMap = {};
    eligiblePayments.forEach(p => {
      if (!p.pandit) return;
      const panditId = p.pandit._id.toString();
      if (!summaryMap[panditId]) {
        summaryMap[panditId] = {
          pandit: p.pandit,
          pendingAmount: 0,
          payments: []
        };
      }
      summaryMap[panditId].pendingAmount += p.panditEarnings || 0;
      summaryMap[panditId].payments.push({
        _id: p._id,
        booking: p.booking,
        amount: p.amount,
        panditEarnings: p.panditEarnings,
        createdAt: p.createdAt
      });
    });

    const data = Object.values(summaryMap);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// @desc    Process manual payout
// @route   POST /api/admin/payouts/process
// @access  Private/Admin
exports.processManualPayout = async (req, res, next) => {
  try {
    const { panditId, paymentIds, transactionId, payoutMethod } = req.body;

    if (!panditId || !paymentIds || !transactionId || !payoutMethod) {
      return res.status(400).json({ success: false, message: 'Please provide panditId, paymentIds, transactionId, and payoutMethod' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a payment receipt screenshot' });
    }

    const parsedPaymentIds = typeof paymentIds === 'string' ? JSON.parse(paymentIds) : paymentIds;

    const User = require('../models/User');
    const Payout = require('../models/Payout');

    const user = await User.findById(panditId).populate('panditProfile');
    if (!user || user.role !== 'pandit' || !user.panditProfile) {
      return res.status(404).json({ success: false, message: 'Pandit profile not found' });
    }

    // Fetch payments to verify eligibility
    const paymentsToSettle = await Payment.find({
      _id: { $in: parsedPaymentIds },
      pandit: panditId,
      $or: [
        { payoutStatus: 'pending' },
        { payoutStatus: { $exists: false } }
      ]
    });

    if (paymentsToSettle.length === 0) {
      return res.status(400).json({ success: false, message: 'No eligible pending payments found to settle' });
    }

    const totalAmount = paymentsToSettle.reduce((sum, p) => sum + (p.panditEarnings || 0), 0);

    // Create the payout record
    const payout = await Payout.create({
      pandit: panditId,
      panditProfile: user.panditProfile._id,
      amount: totalAmount,
      payments: parsedPaymentIds,
      receiptImage: req.file.path, // Cloudinary path URL from upload middleware
      payoutMethod,
      transactionId,
      payoutDate: new Date()
    });

    // Update individual payments
    await Payment.updateMany(
      { _id: { $in: parsedPaymentIds } },
      {
        $set: {
          payoutStatus: 'paid',
          payoutDate: new Date(),
          payoutTransactionId: transactionId,
          payout: payout._id
        }
      }
    );

    res.status(200).json({ success: true, message: 'Payout recorded and processed successfully', data: payout });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all processed payouts
// @route   GET /api/admin/payouts/processed
// @access  Private/Admin
exports.getProcessedPayouts = async (req, res, next) => {
  try {
    const Payout = require('../models/Payout');
    const payouts = await Payout.find()
      .populate('pandit', 'firstName lastName email phone')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: payouts.length, data: payouts });
  } catch (err) {
    next(err);
  }
};
