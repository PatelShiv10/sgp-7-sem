const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const UserKey = require('../models/UserKey');

/**
 * Send an encrypted message
 * POST /api/messages
 */
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, receiverId, encryptedContent, nonce, ephemeralPublicKey, messageType = 'text', metadata = {} } = req.body;
    const senderId = req.user.id; // From JWT token

    // Validate required fields
    if (!chatId || !receiverId || !encryptedContent || !nonce || !ephemeralPublicKey) {
      return res.status(400).json({
        message: 'Missing required fields: chatId, receiverId, encryptedContent, nonce, ephemeralPublicKey'
      });
    }

    // Validate sender and receiver
    if (senderId === receiverId) {
      return res.status(400).json({
        message: 'Sender and receiver cannot be the same'
      });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        message: 'Receiver not found'
      });
    }

    // Get sender's public key for the message
    const senderKey = await UserKey.findOne({ userId: senderId });
    if (!senderKey) {
      return res.status(400).json({
        message: 'Sender public key not found. Please generate crypto keys first.'
      });
    }

    // Create new message
    const message = new Message({
      chatId,
      senderId,
      receiverId,
      encryptedContent,
      nonce,
      ephemeralPublicKey,
      senderPublicKey: senderKey.publicKey,
      messageType,
      metadata
    });

    await message.save();

    // Populate sender and receiver details for response
    await message.populate([
      { path: 'senderId', select: 'firstName lastName email' },
      { path: 'receiverId', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      message: 'Message sent successfully',
      data: {
        id: message._id,
        chatId: message.chatId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        encryptedContent: message.encryptedContent,
        nonce: message.nonce,
        ephemeralPublicKey: message.ephemeralPublicKey,
        senderPublicKey: message.senderPublicKey,
        messageType: message.messageType,
        metadata: message.metadata,
        isRead: message.isRead,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Get messages for a specific chat
 * GET /api/messages/:chatId
 */
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    // Validate chatId
    if (!chatId) {
      return res.status(400).json({
        message: 'Chat ID is required'
      });
    }

    // Get messages for the chat, ensuring user is either sender or receiver
    const messages = await Message.find({
      chatId,
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset))
    .populate([
      { path: 'senderId', select: 'firstName lastName email' },
      { path: 'receiverId', select: 'firstName lastName email' }
    ]);

    // Mark messages as read if user is the receiver
    const unreadMessages = messages.filter(msg => 
      msg.receiverId._id.toString() === userId && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessages.map(msg => msg._id) } },
        { isRead: true }
      );
    }

    res.status(200).json({
      message: 'Messages retrieved successfully',
      data: {
        messages: messages.reverse(), // Return in chronological order
        total: messages.length,
        hasMore: messages.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Get all chats for the current user
 * GET /api/messages/chats
 */
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all unique chat IDs where user is sender or receiver
    const chats = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: mongoose.Types.ObjectId(userId) },
            { receiverId: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: '$chatId',
          lastMessage: { $last: '$$ROOT' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiverId', mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Populate user details for each chat
    const populatedChats = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await Message.findById(chat.lastMessage._id)
          .populate([
            { path: 'senderId', select: 'firstName lastName email' },
            { path: 'receiverId', select: 'firstName lastName email' }
          ]);

        return {
          chatId: chat._id,
          lastMessage: lastMessage,
          messageCount: chat.messageCount,
          unreadCount: chat.unreadCount
        };
      })
    );

    res.status(200).json({
      message: 'Chats retrieved successfully',
      data: {
        chats: populatedChats
      }
    });

  } catch (error) {
    console.error('Error retrieving chats:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Mark messages as read
 * PUT /api/messages/:chatId/read
 */
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Mark all unread messages in the chat as read
    const result = await Message.updateMany(
      {
        chatId,
        receiverId: userId,
        isRead: false
      },
      {
        isRead: true,
        updatedAt: new Date()
      }
    );

    res.status(200).json({
      message: 'Messages marked as read',
      data: {
        updatedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Delete a message (only sender can delete)
 * DELETE /api/messages/:messageId
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Find the message and verify ownership
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        message: 'You can only delete your own messages'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

/**
 * Get unread message count for the current user
 * GET /api/messages/unread/count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.status(200).json({
      message: 'Unread count retrieved successfully',
      data: {
        unreadCount
      }
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};
