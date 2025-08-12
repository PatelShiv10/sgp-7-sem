const Message = require('../models/Message');
const User = require('../models/User');

exports.getConversation = async (req, res) => {
  try {
    const { lawyerId, userId } = req.query;
    if (!lawyerId || !userId) {
      return res.status(400).json({ success: false, message: 'lawyerId and userId are required' });
    }

    const isLawyerValid = await User.findById(lawyerId).select('role');
    if (!isLawyerValid || isLawyerValid.role !== 'lawyer') {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }

    const reqUser = req.user; // may be undefined if public; require auth for privacy
    if (!reqUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const isRequesterLawyer = reqUser.role === 'lawyer';
    if (isRequesterLawyer && reqUser.id !== lawyerId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (!isRequesterLawyer && reqUser.id !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const messages = await Message.find({ lawyerId, userId })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { lawyerId, userId, text } = req.body;
    if (!lawyerId || !userId || !text) {
      return res.status(400).json({ success: false, message: 'lawyerId, userId and text are required' });
    }

    const reqUser = req.user;
    if (!reqUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const lawyer = await User.findById(lawyerId).select('role');
    if (!lawyer || lawyer.role !== 'lawyer') {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }

    let sender;
    if (reqUser.role === 'lawyer' && reqUser.id === lawyerId) sender = 'lawyer';
    else if (reqUser.role === 'user' && reqUser.id === userId) sender = 'user';
    else return res.status(403).json({ success: false, message: 'Forbidden' });

    const msg = await Message.create({ lawyerId, userId, sender, text });

    // Simple notification: when a user sends a message, mark a new notification for the lawyer (in-memory via User doc field optional)
    try {
      if (sender === 'user') {
        await User.findByIdAndUpdate(lawyerId, { $set: { __hasNewMessages: true } });
      }
    } catch {}

    res.status(201).json({ success: true, data: msg });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};