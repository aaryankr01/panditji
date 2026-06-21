const express = require('express');
const { getPandits, getPandit, getMyProfile, updateProfile, uploadAadharDocument, uploadQrCode, getMyPayouts } = require('../controllers/panditController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getPandits);
router.get('/my-profile', protect, authorize('pandit'), getMyProfile);
router.get('/:id', getPandit);
router.patch('/profile', protect, authorize('pandit'), updateProfile);
router.post('/aadhar/upload', protect, authorize('pandit'), upload.single('document'), uploadAadharDocument);
router.post('/payout-details/qr', protect, authorize('pandit'), upload.single('qrCode'), uploadQrCode);
router.get('/payouts', protect, authorize('pandit'), getMyPayouts);

module.exports = router;