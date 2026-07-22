// routes/messageRoutes.js - Message routes
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ============================================
// 📌 GET CONVERSATIONS (All users you've chatted with)
// ============================================
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all unique users this user has chatted with
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .sort({ createdAt: -1 });

    // Extract unique users from messages
    const conversations = {};
    messages.forEach(msg => {
      const otherUser = msg.senderId._id.toString() === userId
        ? msg.receiverId
        : msg.senderId;

      const key = otherUser._id.toString();
      if (!conversations[key]) {
        conversations[key] = {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        };
      }
    });

    // Count unread messages
    const unreadMessages = await Message.find({
      receiverId: userId,
      isRead: false,
    });

    unreadMessages.forEach(msg => {
      const key = msg.senderId.toString();
      if (conversations[key]) {
        conversations[key].unreadCount++;
      }
    });

    res.json({
      success: true,
      data: Object.values(conversations),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 GET MESSAGES BETWEEN TWO USERS
// ============================================
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { limit = 50, before } = req.query;

    const filter = {
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    };

    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(filter)
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        senderId: userId,
        receiverId: currentUserId,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    res.json({
      success: true,
      count: messages.length,
      data: messages.reverse(), // Return in chronological order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 GET UNREAD MESSAGE COUNT
// ============================================
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user.id,
      isRead: false,
    });

    res.json({
      success: true,
      data: { unread: count },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;