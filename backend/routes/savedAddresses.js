const express = require('express');
const router = express.Router();
const {
  getSavedAddresses,
  createSavedAddress,
  updateSavedAddress,
  deleteSavedAddress
} = require('../controllers/savedAddresses');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.get('/', verifyToken, getSavedAddresses);
router.post('/', verifyToken, createSavedAddress);
router.put('/:id', verifyToken, updateSavedAddress);
router.delete('/:id', verifyToken, deleteSavedAddress);

module.exports = router;
