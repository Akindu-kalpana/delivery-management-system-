const express = require('express');
const router = express.Router();
const {
  processBulkOrder,
  confirmBulkOrder,
  getUserBulkOrders
} = require('../controllers/bulkOrders');
const { verifyToken, verifyRole } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// POST /api/bulk/process - upload and extract deliveries from file or raw text
router.post('/process', verifyToken, verifyRole('user', 'admin'), uploadSingle, processBulkOrder);

// POST /api/bulk/confirm/:id - confirm and create all deliveries from a bulk order
router.post('/confirm/:id', verifyToken, verifyRole('user', 'admin'), confirmBulkOrder);

// GET /api/bulk - get all bulk orders for the logged-in user
router.get('/', verifyToken, verifyRole('user', 'admin'), getUserBulkOrders);

module.exports = router;
