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

// Public tracking - no auth needed
router.get('/public/:id', async (req, res) => {
  try {
    const pool = require('../config/db');
    const delivery = await pool.query(
      'SELECT id, sender_name, receiver_name, pickup_address, delivery_address, status, created_at FROM deliveries WHERE id = $1',
      [req.params.id]
    );
    if (delivery.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.json({ delivery: delivery.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;