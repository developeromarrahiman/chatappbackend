const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation');
const verifyToken = require('../config/jwt');
// Create a new conversation

router.get(
  '/conversations/:chatId',
  verifyToken,
  conversationController.getMessagesByChatId
);
router.post(
  '/conversations/:chatId',
  verifyToken,
  conversationController.addMessage
);
router.post(
  '/conversations/:chatId',
  verifyToken,
  conversationController.addMessage
);
// Get conversation by ID
router.get(
  '/schedule',
  verifyToken,
  conversationController.getScheduleMessages
);
router.post(
  '/schedule',
  verifyToken,
  conversationController.createScheduleMessage
);
router.put(
  '/schedule/:cid',
  verifyToken,
  conversationController.updateScheduleMessage
);
router.delete(
  '/schedule/:cid',
  verifyToken,
  conversationController.deleteScheduleMessage
);
// Delete
router.delete(
  '/conversations/:conversationId',
  verifyToken,
  conversationController.deleteMessage
);

module.exports = router;
