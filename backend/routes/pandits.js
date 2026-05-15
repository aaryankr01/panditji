const express = require('express');
const { getPandits, getPandit, getMyProfile, updateProfile } = require('../controllers/panditController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPandits);
router.get('/my-profile', protect, authorize('pandit'), getMyProfile);
router.get('/:id', getPandit);
router.patch('/profile', protect, authorize('pandit'), updateProfile);

module.exports = router;