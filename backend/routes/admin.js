const express = require('express');
const { getUsers, getConversation, getStats, getAllBookings, getAllPayments, approvePandit, rejectPandit, approveCancellation, rejectCancellation, broadcastNotification, getPayouts, processPayout } = require('../controllers/adminController');
const { getAllTickets, updateTicket, deleteTicket } = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { runAutoRefundJob } = require('../jobs/autoRefundJob');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.post('/broadcast', broadcastNotification);

router.get('/users', getUsers);
router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.get('/payments', getAllPayments);
router.get('/payouts', getPayouts);
router.post('/payouts/:id/pay', processPayout);
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

// Manual trigger for auto-refund job (admin only)
router.post('/run-auto-refund', async (req, res) => {
  try {
    const result = await runAutoRefundJob();
    res.json({ success: true, message: `Auto-refund job completed.`, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;