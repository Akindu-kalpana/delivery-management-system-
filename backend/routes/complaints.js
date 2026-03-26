const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  getAllRefundRequests,
  updateRefundRequest,
  updateComplaintStatus,
} = require('../controllers/complaints');
const { verifyToken, verifyRole } = require('../middleware/auth');
const { uploadImages } = require('../middleware/upload');

// User routes
router.post('/', verifyToken, verifyRole('user', 'admin'), uploadImages, createComplaint);
router.get('/my', verifyToken, verifyRole('user', 'admin'), getUserComplaints);

// Admin routes
router.get('/all', verifyToken, verifyRole('admin'), getAllComplaints);
router.put('/:id/status', verifyToken, verifyRole('admin'), updateComplaintStatus);

// Refund request routes (admin)
router.get('/refund-requests', verifyToken, verifyRole('admin'), getAllRefundRequests);
router.put('/refund-requests/:id', verifyToken, verifyRole('admin'), updateRefundRequest);

module.exports = router;
