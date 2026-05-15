const express = require('express');
const { createBooking, getBookings, updateBookingStatus, acceptBooking, deleteBooking, updateBookingLink } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorize('devotee'), createBooking);
router.get('/', getBookings);
router.patch('/:id/accept', authorize('pandit'), acceptBooking);
router.patch('/:id/status', authorize('pandit'), updateBookingStatus);
router.patch('/:id/link', authorize('pandit'), updateBookingLink);
router.delete('/:id', deleteBooking);

module.exports = router;