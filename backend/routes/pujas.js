const express = require('express');
const { getPujas, getPujaById } = require('../controllers/pujaController');

const router = express.Router();

router.get('/', getPujas);
router.get('/:id', getPujaById);

module.exports = router;
