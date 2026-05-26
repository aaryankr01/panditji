const express = require('express');
const { login, adminLogin, getMe } = require('../controllers/authController');
const { checkPhone, verifyFirebaseOtp, resetPassword, register } = require('../controllers/firebaseOtpController');
const { checkPhoneLimiter, verifyOtpLimiter, resetPasswordLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Firebase OTP verify, check and reset routes
router.post('/check-phone', checkPhoneLimiter, checkPhone);
router.post('/verify-firebase-otp', verifyOtpLimiter, verifyFirebaseOtp);
router.post('/reset-password', resetPasswordLimiter, resetPassword);
router.post('/register', register);

// Email OTP send/verify routes
const { sendEmailOtp, verifyEmailOtp } = require('../controllers/emailOtpController');
router.post('/otp/send-email', checkPhoneLimiter, sendEmailOtp);
router.post('/otp/verify-email', verifyOtpLimiter, verifyEmailOtp);

// Core auth routes
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);

module.exports = router;