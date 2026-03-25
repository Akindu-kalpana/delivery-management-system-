const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus
} = require('../controllers/complaints');
const { verifyToken, verifyRole } = require('../middleware/auth');

// User routes
router.post('/', verifyToken, verifyRole('user', 'admin'), createComplaint);
router.get('/my', verifyToken, verifyRole('user', 'admin'), getUserComplaints);

// Admin routes
router.get('/all', verifyToken, verifyRole('admin'), getAllComplaints);
router.put('/:id/status', verifyToken, verifyRole('admin'), updateComplaintStatus);

module.exports = router;
