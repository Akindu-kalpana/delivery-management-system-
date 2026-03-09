const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatbot');
const { verifyToken } = require('../middleware/auth');

router.post('/chat', verifyToken, chat);

module.exports = router;