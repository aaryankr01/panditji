const Booking = require('../models/Booking');
const User = require('../models/User');

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
        const panditSocketId = global.activeUsers?.get(pId);
        if (panditSocketId) {
          console.log(`📡 Broadcast: Sending direct request to Pandit ${pId} on socket ${panditSocketId}`);
          _io.to(panditSocketId).emit('newBookingRequest', populatedBooking);
        } else {
          console.log(`📡 Broadcast: Target Pandit ${pId} is offline. Falling back to city/all rooms.`);
          // If the specific pandit is offline, still broadcast to the city/all so others see it? 
          // Actually, if it's a DIRECT booking, we might want to just wait. 
          // But for now, let's fallback to ensure visibility.
          const cityRoom = `city_${(city || '').toLowerCase().replace(/\s/g, '_')}`;
          _io.to(cityRoom).emit('newBookingRequest', populatedBooking);
          _io.to('all_pandits').emit('newBookingRequest', populatedBooking);
        }
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
      const devoteeSocketId = global.activeUsers?.get(booking.devotee.toString());
      if (devoteeSocketId) {
        _io.to(devoteeSocketId).emit('bookingAccepted', populated);
      }
      // Tell all other pandits this booking is gone
      _io.to('all_pandits').emit('bookingTaken', { bookingId: booking._id.toString() });
    }

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
      const devoteeSocketId = global.activeUsers?.get(booking.devotee._id.toString());
      if (devoteeSocketId) _io.to(devoteeSocketId).emit('bookingStatusUpdated', { bookingId: booking._id, status });
    }

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
      const panditSocketId = global.activeUsers?.get(booking.pandit._id.toString());
      if (panditSocketId) {
        _io.to(panditSocketId).emit('bookingCancelledByDevotee', {
          bookingId: booking._id,
          pujaType: booking.pujaType,
          devotee: `${booking.devotee.firstName} ${booking.devotee.lastName}`,
        });
      }
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

    // Verify ownership (only the assigned pandit or the devotee can delete)
    if (booking.pandit?.toString() !== req.user.id && booking.devotee?.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await booking.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
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
      const devoteeSocketId = global.activeUsers?.get(booking.devotee.toString());
      if (devoteeSocketId) _io.to(devoteeSocketId).emit('bookingLinkUpdated', { bookingId: booking._id, videoLink });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};
