const express = require('express');
const router = express.Router();
const {
  createDamageClaim,
  getUserDamageClaims,
  getAllDamageClaims,
  updateDamageClaimDecision
} = require('../controllers/damageClaims');
const { verifyToken, verifyRole } = require('../middleware/auth');
const { uploadImages } = require('../middleware/upload');

// User routes
router.post('/', verifyToken, uploadImages, createDamageClaim);
router.get('/my', verifyToken, getUserDamageClaims);

// Admin routes
router.get('/all', verifyToken, verifyRole('admin'), getAllDamageClaims);
router.put('/:id/decision', verifyToken, verifyRole('admin'), updateDamageClaimDecision);

module.exports = router;
