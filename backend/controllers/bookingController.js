const Booking = require('../models/Booking');
const User = require('../models/User');
const { createAndEmitNotification } = require('./notificationController');

// Global io reference set from server.js
let _io = null;
exports.setIO = (io) => { _io = io; };

// @desc    Create new booking & broadcast to all city pandits
// @route   POST /api/bookings
// @access  Private/Devotee
exports.createBooking = async (req, res, next) => {
  try {
    const { pujaType, date, time, address, city, notes, fee, panditId, pujaMode } = req.body;
    const devoteeId = req.user.id;

    const devotee = await User.findById(devoteeId).select('firstName lastName phone city');

    const bookingData = {
      devotee: devoteeId,
      pujaType: pujaType || 'Other',
      scheduledDate: new Date(date),
      scheduledTime: time,
      address,
      city: city || devotee.city,
      notes,
      fee: fee || 0,
      pujaMode: pujaMode || 'in-person',
      status: 'pending'
    };

    if (panditId) {
      bookingData.pandit = panditId;
    }

    const booking = await Booking.create(bookingData);

    const populatedBooking = await Booking.findById(booking._id)
      .populate('devotee', 'firstName lastName phone city');

    // Broadcast logic
    if (_io) {
      console.log(`📡 Broadcast: Attempting to notify pandits for booking ${booking._id}`);
      if (panditId) {
        const pId = panditId.toString();
        // Notify all sockets of this targeted Pandit
        _io.to(`user_${pId}`).emit('newBookingRequest', populatedBooking);
        console.log(`📡 Broadcast: Target Pandit ${pId} notified or room broadcasted.`);
        const cityRoom = `city_${(city || '').toLowerCase().replace(/\s/g, '_')}`;
        _io.to(cityRoom).emit('newBookingRequest', populatedBooking);
        _io.to('all_pandits').emit('newBookingRequest', populatedBooking);

        // Save persistent notification for specific pandit
        await createAndEmitNotification(pId, {
          senderId: devoteeId,
          type: 'booking_request',
          title: '🔔 New Puja Booking',
          message: `A devotee has requested ${pujaType || 'a puja'} in ${city || 'your city'}.`,
          bookingId: booking._id,
        });
      } else if (pujaMode === 'online') {
        console.log(`📡 Broadcast: Online puja - notifying all pandits`);
        _io.to('all_pandits').emit('newBookingRequest', populatedBooking);
      } else {
        const cityRoom = `city_${(city || '').toLowerCase().replace(/\s/g, '_')}`;
        console.log(`📡 Broadcast: In-person puja - notifying city room ${cityRoom}`);
        _io.to(cityRoom).emit('newBookingRequest', populatedBooking);
        _io.to('all_pandits').emit('newBookingRequest', populatedBooking);
      }
    }

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (err) {
    next(err);
  }
};

// @desc    Pandit accepts booking
// @route   PATCH /api/bookings/:id/accept
// @access  Private/Pandit
exports.acceptBooking = async (req, res, next) => {
  try {
    const panditId = req.user.id;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking already taken' });
    }

    const Pandit = require('../models/Pandit');
    const profile = await Pandit.findOne({ user: panditId });

    booking.pandit = panditId;
    booking.panditProfile = profile ? profile._id : null;
    booking.status = 'confirmed';
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('devotee', 'firstName lastName phone city')
      .populate('pandit', 'firstName lastName phone city');

    // Notify devotee their pandit is confirmed
    if (_io) {
      _io.to(`user_${booking.devotee.toString()}`).emit('bookingAccepted', populated);
      // Tell all other pandits this booking is gone
      _io.to('all_pandits').emit('bookingTaken', { bookingId: booking._id.toString() });
    }

    // Persist notification for devotee
    await createAndEmitNotification(booking.devotee.toString(), {
      senderId: panditId,
      type: 'booking_accepted',
      title: '✅ Booking Accepted',
      message: `Pt. ${populated.pandit?.firstName} has accepted your ${booking.pujaType} booking.`,
      bookingId: booking._id,
    });

    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let query;

    if (role === 'devotee') {
      query = { devotee: userId };
    } else {
      // For pandit: show bookings assigned to them OR pending unassigned bookings (online or in their city)
      query = {
        $or: [
          { pandit: userId },
          {
            status: 'pending',
            pandit: null,
            $or: [
              { pujaMode: 'online' },
              { city: { $regex: new RegExp(`^${req.user.city || ''}$`, 'i') } }
            ]
          }
        ]
      };
    }

    const bookings = await Booking.find(query)
      .populate('devotee', 'firstName lastName email phone city')
      .populate('pandit', 'firstName lastName email phone city')
      .sort('-createdAt');

    const now = new Date();
    for (let booking of bookings) {
      if (booking.status === 'pending' && booking.scheduledDate && booking.scheduledTime) {
        try {
          const dateStr = booking.scheduledDate.toISOString().split('T')[0];
          const scheduledDateTime = new Date(`${dateStr}T${booking.scheduledTime}:00`);
          if (scheduledDateTime < now) {
            booking.status = 'cancelled';
            booking.cancellationReason = 'Auto-cancelled because the scheduled time has passed.';
            await booking.save();
          }
        } catch (e) {
          console.error("Error checking date for booking:", booking._id, e);
        }
      }
    }

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking status (pandit / admin use)
// @route   PATCH /api/bookings/:id/status
// @access  Private/Pandit
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('devotee', 'firstName lastName phone city')
      .populate('pandit', 'firstName lastName phone city');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = status;
    await booking.save();

    // Notify devotee of status change
    if (_io) {
      _io.to(`user_${booking.devotee._id.toString()}`).emit('bookingStatusUpdated', { bookingId: booking._id, status });
    }

    // Persist notification
    const notifType = status === 'rejected' ? 'booking_rejected' : status === 'cancelled' ? 'booking_cancelled' : 'booking_accepted';
    const notifTitle = status === 'rejected' ? '❌ Booking Rejected' : status === 'completed' ? '✅ Puja Completed' : `🔔 Booking ${status}`;
    await createAndEmitNotification(booking.devotee._id.toString(), {
      type: notifType,
      title: notifTitle,
      message: `Your ${booking.pujaType} booking status has been updated to: ${status}.`,
      bookingId: booking._id,
    });

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Devotee cancels their own booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private/Devotee
exports.cancelBooking = async (req, res, next) => {
  try {
    const devoteeId = req.user.id;
    const booking = await Booking.findById(req.params.id)
      .populate('devotee', 'firstName lastName phone city')
      .populate('pandit', 'firstName lastName phone city');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only the devotee who made the booking can cancel
    if (booking.devotee._id.toString() !== devoteeId) {
      return res.status(403).json({ success: false, message: 'Not authorised to cancel this booking' });
    }

    // Already cancelled or completed
    if (['cancelled', 'completed', 'rejected'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
    }

    // Block self-cancellation if payment is already done — must contact admin
    if (booking.paymentStatus === 'paid') {
      return res.status(403).json({
        success: false,
        message: 'This booking is already paid. Please contact admin or Pandit Ji to cancel and process a refund.',
        requiresAdminContact: true,
      });
    }

    // Block cancellation if the scheduled time has already passed
    if (booking.scheduledDate && booking.scheduledTime) {
      try {
        const dateStr = new Date(booking.scheduledDate).toISOString().split('T')[0];
        const scheduledAt = new Date(`${dateStr}T${booking.scheduledTime}:00`);
        if (scheduledAt <= new Date()) {
          return res.status(400).json({
            success: false,
            message: 'This booking cannot be cancelled because its scheduled time has already passed.',
          });
        }
      } catch (e) {
        console.error('Date parse error in cancelBooking:', e);
      }
    }

    // Allow cancel for: pending OR confirmed-but-unpaid (and still upcoming)
    booking.status = 'cancelled';
    booking.cancelledBy = 'devotee';
    booking.cancellationReason = req.body.reason || 'Cancelled by devotee';
    await booking.save();

    // Notify the assigned pandit (if any) via socket
    if (_io && booking.pandit) {
      // Use user room so ALL sockets of the pandit receive this (dashboard + listener)
      _io.to(`user_${booking.pandit._id.toString()}`).emit('bookingCancelledByDevotee', {
        bookingId: booking._id,
        pujaType: booking.pujaType,
        devotee: `${booking.devotee.firstName} ${booking.devotee.lastName}`,
      });
      // Persist notification for pandit
      await createAndEmitNotification(booking.pandit._id.toString(), {
        senderId: devoteeId,
        type: 'booking_cancelled',
        title: '❌ Booking Cancelled',
        message: `${booking.devotee.firstName} ${booking.devotee.lastName} cancelled their ${booking.pujaType} booking.`,
        bookingId: booking._id,
      });
    }

    // Also broadcast to all pandits so it disappears from their queue
    if (_io) {
      _io.to('all_pandits').emit('bookingTaken', { bookingId: booking._id.toString() });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Devotee requests cancellation of paid booking
// @route   PATCH /api/bookings/:id/request-cancel
// @access  Private/Devotee
exports.requestCancelBooking = async (req, res, next) => {
  try {
    const devoteeId = req.user.id;
    const booking = await Booking.findById(req.params.id)
      .populate('devotee', 'firstName lastName phone city')
      .populate('pandit', 'firstName lastName phone city');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only the devotee who made the booking can cancel
    if (booking.devotee._id.toString() !== devoteeId) {
      return res.status(403).json({ success: false, message: 'Not authorised to request cancellation for this booking' });
    }

    // Must be confirmed and paid
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ success: false, message: 'Only paid bookings require cancellation requests. For unpaid bookings, please cancel directly.' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: `Booking status must be confirmed to request cancellation (current status: ${booking.status})` });
    }

    // Block if the scheduled time has already passed
    if (booking.scheduledDate && booking.scheduledTime) {
      try {
        const dateStr = new Date(booking.scheduledDate).toISOString().split('T')[0];
        const scheduledAt = new Date(`${dateStr}T${booking.scheduledTime}:00`);
        if (scheduledAt <= new Date()) {
          return res.status(400).json({
            success: false,
            message: 'This booking cannot be cancelled because its scheduled time has already passed.',
          });
        }
      } catch (e) {
        console.error('Date parse error in requestCancelBooking:', e);
      }
    }

    booking.status = 'cancellation_requested';
    booking.cancellationReason = req.body.reason || 'Cancellation requested by devotee';
    await booking.save();

    // Notify the assigned pandit (if any) and admin via socket
    if (_io && booking.pandit) {
      const panditSocketId = global.activeUsers?.get(booking.pandit._id.toString());
      if (panditSocketId) {
        _io.to(panditSocketId).emit('bookingCancellationRequested', {
          bookingId: booking._id,
          pujaType: booking.pujaType,
          devotee: `${booking.devotee.firstName} ${booking.devotee.lastName}`,
        });
      }
    }

    // Emit to admin rooms or global if needed
    if (_io) {
      _io.emit('adminBookingCancellationRequested', {
        bookingId: booking._id,
        devotee: `${booking.devotee.firstName} ${booking.devotee.lastName}`,
        pujaType: booking.pujaType,
      });
    }

    res.status(200).json({ success: true, message: 'Cancellation and refund request submitted successfully', data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // req.user is a Mongoose doc — use _id (ObjectId) then toString() for safe string compare
    const userId = (req.user._id || req.user.id)?.toString();
    const bookingPandit = booking.pandit?.toString();
    const bookingDevotee = booking.devotee?.toString();
    const isAdmin = req.user.role === 'admin';

    console.log(`[deleteBooking] userId=${userId} | pandit=${bookingPandit} | devotee=${bookingDevotee} | isAdmin=${isAdmin}`);

    // Allow: the devotee who made it, the pandit assigned to it, or an admin
    if (!isAdmin && bookingPandit !== userId && bookingDevotee !== userId) {
      console.log(`[deleteBooking] DENIED — no ownership match`);
      return res.status(401).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    await booking.deleteOne();
    console.log(`[deleteBooking] Deleted booking ${req.params.id}`);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error('[deleteBooking] Error:', err);
    next(err);
  }
};



// @desc    Update booking video link
// @route   PATCH /api/bookings/:id/link
// @access  Private/Pandit
exports.updateBookingLink = async (req, res, next) => {
  try {
    const { videoLink } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.pandit.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    booking.videoLink = videoLink;
    await booking.save();

    // Notify devotee of new link
    if (_io) {
      _io.to(`user_${booking.devotee.toString()}`).emit('bookingLinkUpdated', { bookingId: booking._id, videoLink });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Request booking completion (generate 4-digit OTP)
// @route   POST /api/bookings/:id/request-completion
// @access  Private/Pandit
exports.requestCompletion = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const bookingPanditId = booking.pandit?._id ? booking.pandit._id.toString() : booking.pandit?.toString();
    if (bookingPanditId !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Booking is not confirmed' });
    }
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ success: false, message: 'Booking must be paid to complete' });
    }

    // Generate random 4-digit OTP code
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    booking.completionOtp = otp;
    booking.otpGeneratedAt = new Date();
    await booking.save();

    // Notify Devotee via Socket
    if (_io) {
      _io.to(`user_${booking.devotee.toString()}`).emit('bookingCompletionOtpGenerated', {
        bookingId: booking._id.toString(),
        completionOtp: otp,
      });
    }

    res.status(200).json({ success: true, message: 'Completion OTP generated successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify booking completion with OTP code
// @route   POST /api/bookings/:id/verify-completion
// @access  Private/Pandit
exports.verifyCompletion = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('devotee', 'firstName lastName phone city')
      .populate('pandit', 'firstName lastName phone city');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const bookingPanditId = booking.pandit?._id ? booking.pandit._id.toString() : booking.pandit?.toString();
    if (bookingPanditId !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Booking is not active/confirmed' });
    }
    if (!booking.completionOtp) {
      return res.status(400).json({ success: false, message: 'OTP has not been generated for this booking' });
    }
    if (booking.completionOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // OTP Verified! Complete Puja
    booking.status = 'completed';
    booking.completionOtp = null;
    booking.otpGeneratedAt = null;
    booking.completedAt = new Date();
    await booking.save();

    // Notify Devotee via Socket
    if (_io) {
      _io.to(`user_${booking.devotee._id.toString()}`).emit('bookingStatusUpdated', {
        bookingId: booking._id.toString(),
        status: 'completed',
      });
    }

    // Persist notification
    await createAndEmitNotification(booking.devotee._id.toString(), {
      type: 'booking_accepted',
      title: '✅ Puja Completed',
      message: `Your ${booking.pujaType} booking has been successfully completed.`,
      bookingId: booking._id,
    });

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};
