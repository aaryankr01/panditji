const express = require('express');
const { addReview, getPanditReviews, getLatestReviews, addAppReview, getAppReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/latest', getLatestReviews);
router.get('/pandit/:panditId', getPanditReviews);
router.post('/', protect, authorize('devotee'), addReview);

// App reviews
router.get('/app', getAppReviews);
router.post('/app', protect, addAppReview);

module.exports = router;