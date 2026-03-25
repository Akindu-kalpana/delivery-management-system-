const express = require('express');
const router = express.Router();
const { estimatePrice } = require('../controllers/priceEstimate');
const { verifyToken } = require('../middleware/auth');

// POST /api/price/estimate - estimate delivery price (auth required)
router.post('/estimate', verifyToken, estimatePrice);

module.exports = router;
