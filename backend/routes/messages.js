const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

// Apply authentication middleware to all message routes
router.use(protect);

// Send an encrypted message
router.post('/', messageController.sendMessage);

// Get messages for a specific chat
router.get('/:chatId', messageController.getChatMessages);

// Get all chats for the current user
router.get('/chats', messageController.getUserChats);

// Mark messages as read
router.put('/:chatId/read', messageController.markMessagesAsRead);

// Delete a message
router.delete('/:messageId', messageController.deleteMessage);

// Get unread message count
router.get('/unread/count', messageController.getUnreadCount);

module.exports = router;
