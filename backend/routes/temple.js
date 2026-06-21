const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTemples,
  createChadavaOrder,
  createPrasadOrder,
  getMyOrders,
} = require('../controllers/templeController');

router.get('/', getTemples);
router.post('/chadava', protect, createChadavaOrder);
router.post('/prasad', protect, createPrasadOrder);
router.get('/my-orders', protect, getMyOrders);

module.exports = router;
