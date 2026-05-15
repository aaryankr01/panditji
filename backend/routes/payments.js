const express = require('express');
const { createOrder, verifyPayment, getPayments, createSubscriptionOrder, verifySubscription } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/create-order', authorize('devotee'), createOrder);
router.post('/verify', authorize('devotee'), verifyPayment);
router.get('/', getPayments);

router.post('/create-subscription-order', authorize('pandit'), createSubscriptionOrder);
router.post('/verify-subscription', authorize('pandit'), verifySubscription);

module.exports = router;