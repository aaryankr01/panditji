const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead, markOneRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.patch('/mark-read', protect, markAllRead);
router.patch('/:id/read', protect, markOneRead);

module.exports = router;
