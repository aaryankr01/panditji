const express = require('express');
const { getUsers, getConversation, getStats, getAllBookings, getAllPayments, approvePandit, rejectPandit, approveCancellation, rejectCancellation, broadcastNotification, getPayouts, processPayout, getPendingPayoutsSummary, processManualPayout, getProcessedPayouts } = require('../controllers/adminController');
const { getAllTickets, updateTicket, deleteTicket } = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  adminGetAllTemples, adminCreateTemple, adminUpdateTemple, adminDeleteTemple,
  adminGetAllOrders, adminUpdateOrderStatus
} = require('../controllers/templeController');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.post('/broadcast', broadcastNotification);

router.get('/users', getUsers);
router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.get('/payments', getAllPayments);
router.get('/payouts', getPayouts);
router.get('/payouts/pending', getPendingPayoutsSummary);
router.get('/payouts/processed', getProcessedPayouts);
router.post('/payouts/process', upload.single('receipt'), processManualPayout);
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

// Temple Management
router.get('/temples', adminGetAllTemples);
router.post('/temples', adminCreateTemple);
router.put('/temples/:id', adminUpdateTemple);
router.delete('/temples/:id', adminDeleteTemple);

// Temple Orders (Chadava + Prasad)
router.get('/temple-orders', adminGetAllOrders);
router.patch('/temple-orders/:id', adminUpdateOrderStatus);

module.exports = router;