const express = require('express');
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  acceptBooking,
  deleteBooking,
  updateBookingLink,
  cancelBooking,
  requestCancelBooking,
  requestCompletion,
  verifyCompletion,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorize('devotee'), createBooking);
router.get('/', getBookings);

// Devotee cancels their own booking (unpaid only — paid requires admin contact)
router.patch('/:id/cancel', authorize('devotee'), cancelBooking);
router.patch('/:id/request-cancel', authorize('devotee'), requestCancelBooking);

// Pandit-only actions
router.patch('/:id/accept', authorize('pandit'), acceptBooking);
router.patch('/:id/status', authorize('pandit'), updateBookingStatus);
router.patch('/:id/link', authorize('pandit'), updateBookingLink);
router.post('/:id/request-completion', authorize('pandit'), requestCompletion);
router.post('/:id/verify-completion', authorize('pandit'), verifyCompletion);

router.delete('/:id', deleteBooking);

module.exports = router;