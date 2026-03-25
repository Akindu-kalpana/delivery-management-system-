const express = require('express');
const router = express.Router();
const {
  createDelivery,
  getUserDeliveries,
  getDeliveryById,
  getDriverDeliveries,
  getAllDeliveries,
  updateDeliveryStatus,
  updateDriverInstructions,
  getPublicDelivery,
  generateInvoiceData
} = require('../controllers/deliveries');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Public route - no auth needed
router.get('/public/:id', getPublicDelivery);

// User routes
router.post('/', verifyToken, verifyRole('user', 'admin'), createDelivery);
router.get('/my', verifyToken, verifyRole('user', 'admin'), getUserDeliveries);
router.get('/track/:id', verifyToken, getDeliveryById);
router.put('/:id/instructions', verifyToken, verifyRole('user'), updateDriverInstructions);
router.get('/:id/invoice', verifyToken, generateInvoiceData);

// Driver routes
router.get('/driver', verifyToken, verifyRole('driver'), getDriverDeliveries);

// Admin routes
router.get('/all', verifyToken, verifyRole('admin'), getAllDeliveries);

// Update status - driver and admin
router.put('/:id/status', verifyToken, verifyRole('driver', 'admin'), updateDeliveryStatus);

module.exports = router;
