const express = require('express');
const { getChatHistory, sendMessage, getConversationsList, uploadChatFile } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const chatUpload = require('../middleware/chatUpload');

const router = express.Router();

router.use(protect);

router.get('/conversations/list', getConversationsList);
router.get('/:userId', getChatHistory);
router.post('/upload', chatUpload.single('file'), uploadChatFile);
router.post('/', sendMessage);

module.exports = router;