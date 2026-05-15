const express = require('express');
const { createTicket, getMyTickets } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', createTicket);
router.get('/my', getMyTickets);

module.exports = router;
