const express = require('express');
const { getPandits, getPandit, getMyProfile, updateProfile, uploadAadharDocument } = require('../controllers/panditController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getPandits);
router.get('/my-profile', protect, authorize('pandit'), getMyProfile);
router.get('/:id', getPandit);
router.patch('/profile', protect, authorize('pandit'), updateProfile);
router.post('/aadhar/upload', protect, authorize('pandit'), upload.single('document'), uploadAadharDocument);

module.exports = router;