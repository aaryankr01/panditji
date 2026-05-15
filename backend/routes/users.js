const express = require('express');
const { uploadAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/avatar', upload.single('file'), uploadAvatar);

module.exports = router;
