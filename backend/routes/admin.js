const express = require('express');
const { getUsers, getConversation, getStats, getAllBookings, getAllPayments, approvePandit, rejectPandit, approveCancellation, rejectCancellation, broadcastNotification } = require('../controllers/adminController');
const { getAllTickets, updateTicket, deleteTicket } = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.post('/broadcast', broadcastNotification);

router.get('/users', getUsers);
router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.get('/payments', getAllPayments);
router.get('/conversations/:user1Id/:user2Id', getConversation);

// Support tickets
router.get('/support', getAllTickets);
router.patch('/support/:id', updateTicket);
router.delete('/support/:id', deleteTicket);

// Pandit Verification
router.patch('/users/:id/approve-pandit', approvePandit);
router.patch('/users/:id/reject-pandit', rejectPandit);

// Booking Cancellation Requests
router.patch('/bookings/:id/cancel-approve', approveCancellation);
router.patch('/bookings/:id/cancel-reject', rejectCancellation);

module.exports = router;