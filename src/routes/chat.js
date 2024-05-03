
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat');
const verifyToken = require("../config/jwt");
// Create a new chat
router.post('/chats',verifyToken, chatController.createChat);
router.get('/chats',verifyToken, chatController.getChatList);
// Get chat by ID
router.get('/chats/:chatId',verifyToken, chatController.getChatById);

module.exports = router;
