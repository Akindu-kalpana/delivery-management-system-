const express = require('express');
const router = express.Router();
const { getLoyaltyInfo, redeemPoints } = require('../controllers/loyalty');
const { verifyToken } = require('../middleware/auth');

// GET /api/loyalty/info - get loyalty points, level, and transaction history
router.get('/info', verifyToken, getLoyaltyInfo);

// POST /api/loyalty/redeem - redeem points for a discount
router.post('/redeem', verifyToken, redeemPoints);

module.exports = router;
