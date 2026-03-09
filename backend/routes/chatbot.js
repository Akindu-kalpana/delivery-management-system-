const express = require('express');
const router = express.Router();

// placeholder - we will add controllers soon
router.get('/', (req, res) => {
  res.json({ message: 'Chatbot route working' });
});

module.exports = router;