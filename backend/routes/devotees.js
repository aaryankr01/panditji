const express = require('express');
const { getMyProfile, updateProfile } = require('../controllers/devoteeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('devotee'));

router.get('/my-profile', getMyProfile);
router.patch('/profile', updateProfile);

module.exports = router;