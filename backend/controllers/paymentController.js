const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');

// @desc    Create a Razorpay order
// @route   POST /api/payments/create-order
// @access  Private/Devotee
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const devoteeId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.devotee.toString() !== devoteeId) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
    }
    if (!booking.pandit) {
      return res.status(400).json({ success: false, message: 'Cannot pay before a Pandit is assigned' });
    }

    const amountInPaise = booking.fee * 100;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `bk_${bookingId}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).json({ success: false, message: 'Failed to create order' });
    }

    res.status(200).json({ success: true, orderId: order.id, amount: order.amount });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay payment signature and record payment
// @route   POST /api/payments/verify
// @access  Private/Devotee
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
    const devoteeId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const amountInPaise = booking.fee * 100;
    const panditEarnings = Math.round(amountInPaise * 0.9);
    const companyEarnings = Math.round(amountInPaise * 0.1);

    let panditProfileId = booking.panditProfile;
    if (!panditProfileId) {
      const Pandit = require('../models/Pandit');
      const profile = await Pandit.findOne({ user: booking.pandit });
      panditProfileId = profile ? profile._id : null;
    }

    // Create payment record
    const payment = await Payment.create({
      pandit: booking.pandit,
      panditProfile: panditProfileId,
      booking: bookingId,
      devotee: devoteeId,
      type: 'booking_fee',
      amount: amountInPaise,
      panditEarnings: panditEarnings,
      companyEarnings: companyEarnings,
      currency: 'INR',
      status: 'completed',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // Update booking status using findByIdAndUpdate
    await Booking.findByIdAndUpdate(bookingId, {
      $set: {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentId: razorpay_payment_id
      }
    });

    res.status(200).json({ success: true, message: 'Payment successful', data: payment });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payments for logged in user
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query = {};
    if (role === 'devotee') {
      query = { devotee: userId };
    } else if (role === 'pandit') {
      query = { pandit: userId };
    }

    const payments = await Payment.find(query)
      .populate('booking')
      .populate('devotee', 'firstName lastName')
      .populate('pandit', 'firstName lastName')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
};

// @desc    Create Razorpay Order for Subscription
// @route   POST /api/payments/create-subscription-order
// @access  Private/Pandit
exports.createSubscriptionOrder = async (req, res, next) => {
  try {
    const feeInPaise = 500 * 100; // 500 INR

    const options = {
      amount: feeInPaise,
      currency: 'INR',
      receipt: `sub_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay Payment for Subscription
// @route   POST /api/payments/verify-subscription
// @access  Private/Pandit
exports.verifySubscription = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const Pandit = require('../models/Pandit');
      const profile = await Pandit.findOne({ user: req.user.id });

      if (!profile) {
        return res.status(404).json({ success: false, message: 'Pandit profile not found' });
      }

      // Update subscription in Pandit Profile
      const now = new Date();
      // If already active and not expired, add 30 days to existing endDate, else start from now
      let newEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      if (profile.subscription?.isActive && profile.subscription.endDate && new Date(profile.subscription.endDate) > now) {
        newEndDate = new Date(new Date(profile.subscription.endDate).getTime() + 30 * 24 * 60 * 60 * 1000);
      }

      await Pandit.findByIdAndUpdate(profile._id, {
        $set: {
          subscription: {
            isActive: true,
            startDate: profile.subscription?.startDate || now,
            endDate: newEndDate,
            razorpaySubId: razorpay_order_id
          }
        }
      });

      // Create payment record for Subscription
      await Payment.create({
        pandit: req.user.id,
        panditProfile: profile._id,
        type: 'subscription',
        amount: 500 * 100, // 500 INR in paise
        panditEarnings: 0,
        companyEarnings: 500 * 100, // Company takes 100% of subscription fee
        status: 'completed',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      });

      res.status(200).json({ success: true, message: 'Subscription successfully activated/renewed', data: profile });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (err) {
    next(err);
  }
};
