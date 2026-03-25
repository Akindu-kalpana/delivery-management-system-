const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getDriverStats,
  assignDriver,
  getAnalytics
} = require('../controllers/admin');
const { verifyToken, verifyRole } = require('../middleware/auth');

// All admin routes require authentication and admin role
const adminOnly = [verifyToken, verifyRole('admin')];

router.get('/dashboard', ...adminOnly, getDashboardStats);
router.get('/users', ...adminOnly, getAllUsers);
router.put('/users/:id/role', ...adminOnly, updateUserRole);
router.get('/drivers', ...adminOnly, getDriverStats);
router.put('/deliveries/:id/assign', ...adminOnly, assignDriver);
router.get('/analytics', ...adminOnly, getAnalytics);

module.exports = router;
