const express = require('express');
const router = express.Router();
const {
  createDelivery,
  getUserDeliveries,
  getDeliveryById,
  getDriverDeliveries,
  getAllDeliveries,
  updateDeliveryStatus
} = require('../controllers/deliveries');
const { verifyToken, verifyRole } = require('../middleware/auth');

// User routes
router.post('/', verifyToken, verifyRole('user'), createDelivery);
router.get('/my', verifyToken, verifyRole('user'), getUserDeliveries);
router.get('/track/:id', verifyToken, getDeliveryById);

// Driver routes
router.get('/driver', verifyToken, verifyRole('driver'), getDriverDeliveries);

// Admin routes
router.get('/all', verifyToken, verifyRole('admin'), getAllDeliveries);

// Update status - driver and admin
router.put('/:id/status', verifyToken, verifyRole('driver', 'admin'), updateDeliveryStatus);

module.exports = router;