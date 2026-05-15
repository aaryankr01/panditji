const express = require('express');
const { addReview, getPanditReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/pandit/:panditId', getPanditReviews);
router.post('/', protect, authorize('devotee'), addReview);

module.exports = router;