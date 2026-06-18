/**
 * Auto-Refund Job
 * ───────────────────────────────────────────────────────────────────
 * Runs daily. Finds bookings that are:
 *   - paymentStatus: 'paid'
 *   - status: 'confirmed' or 'in-progress'  (NOT completed/cancelled)
 *   - scheduledDate is more than AUTO_REFUND_DAYS ago
 *   - completionOtp: null  (pandit never generated/shared an OTP)
 *
 * For each such booking:
 *   → Refund full booking fee to devotee's walletBalance (UPI Lite)
 *   → Mark booking as cancelled + paymentStatus refunded
 *   → Update payment record
 *   → Send real-time socket event + persistent notification to devotee
 */

const Booking = require('../models/Booking');
const User    = require('../models/User');
const Payment = require('../models/Payment');
const { createAndEmitNotification } = require('../controllers/notificationController');

const AUTO_REFUND_DAYS = 5;

const runAutoRefundJob = async () => {
  const jobStart = new Date();
  console.log(`\n⏰ [AutoRefund] Job started at ${jobStart.toISOString()}`);

  try {
    // Cutoff = now minus 5 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - AUTO_REFUND_DAYS);

    const staleBookings = await Booking.find({
      paymentStatus: 'paid',
      status: { $in: ['confirmed', 'in-progress'] },
      scheduledDate: { $lte: cutoffDate },
      completionOtp: null,  // OTP was never generated (puja was never started)
    }).populate('devotee', 'firstName lastName email walletBalance');

    console.log(`[AutoRefund] Found ${staleBookings.length} stale booking(s) eligible for auto-refund.`);

    let successCount = 0;
    let errorCount   = 0;

    for (const booking of staleBookings) {
      try {
        const devoteeId  = (booking.devotee._id || booking.devotee).toString();
        const refundAmt  = booking.fee; // in Rupees

        // 1) Credit wallet
        const devoteeUser = await User.findById(devoteeId);
        if (!devoteeUser) {
          console.warn(`[AutoRefund] Devotee ${devoteeId} not found. Skipping booking ${booking._id}`);
          continue;
        }

        devoteeUser.walletBalance = (devoteeUser.walletBalance || 0) + refundAmt;
        await devoteeUser.save();

        // 2) Update booking
        booking.status             = 'cancelled';
        booking.paymentStatus      = 'refunded';
        booking.cancelledBy        = 'admin';
        booking.cancellationReason =
          `Auto-refunded: Puja was not completed within ${AUTO_REFUND_DAYS} days of the scheduled date ` +
          `and no OTP was shared. ₹${refundAmt} has been credited to your PanditJi Wallet.`;
        await booking.save();

        // 3) Update payment record
        const payment = await Payment.findOne({ booking: booking._id });
        if (payment) {
          payment.status          = 'refunded';
          payment.panditEarnings  = 0;
          payment.companyEarnings = 0;
          payment.description     =
            `Auto-refund: Puja not completed within ${AUTO_REFUND_DAYS} days. ` +
            `₹${refundAmt} returned to devotee wallet.`;
          await payment.save();
        }

        // 4) Persistent notification
        await createAndEmitNotification(devoteeId, {
          type: 'booking_cancelled',
          title: '💰 Refund Credited to Your Wallet',
          message:
            `Your ${booking.pujaType} puja was not completed within ${AUTO_REFUND_DAYS} days. ` +
            `₹${refundAmt} has been refunded to your PanditJi Wallet (UPI Lite). ` +
            `You can use it instantly for your next booking!`,
          bookingId: booking._id,
        });

        // 5) Real-time socket event if devotee is online
        if (global.io) {
          global.io.to(`user_${devoteeId}`).emit('autoRefundProcessed', {
            bookingId:     booking._id.toString(),
            pujaType:      booking.pujaType,
            refundAmount:  refundAmt,
            walletBalance: devoteeUser.walletBalance,
          });
        }

        console.log(
          `[AutoRefund] ✅ Refunded ₹${refundAmt} → ${devoteeUser.firstName} ${devoteeUser.lastName} ` +
          `(booking: ${booking._id}) | New wallet: ₹${devoteeUser.walletBalance}`
        );
        successCount++;
      } catch (innerErr) {
        console.error(`[AutoRefund] ❌ Error processing booking ${booking._id}:`, innerErr.message);
        errorCount++;
      }
    }

    const duration = ((Date.now() - jobStart) / 1000).toFixed(2);
    console.log(
      `[AutoRefund] Job finished in ${duration}s — ` +
      `✅ ${successCount} refunded, ❌ ${errorCount} errors.\n`
    );
    return { processed: successCount, errors: errorCount };
  } catch (err) {
    console.error('[AutoRefund] ❌ Job failed with fatal error:', err);
    throw err;
  }
};

module.exports = { runAutoRefundJob, AUTO_REFUND_DAYS };
