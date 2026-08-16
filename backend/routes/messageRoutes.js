// routes/messageRoutes.js - REST endpoints for messaging
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const USER_FIELDS = 'name email role';

// Who each role may talk to (admin can reach everyone).
const getVisibleRoles = (role) => {
  switch (role) {
    case 'admin':
      return ['student', 'teacher', 'parent', 'admin', 'registrar', 'finance_officer'];
    case 'registrar':
    case 'finance_officer':
      return ['admin', 'teacher'];
    case 'teacher':
      return ['admin', 'parent'];
    case 'student':
    case 'parent':
      return ['admin', 'teacher'];
    default:
      return ['admin'];
  }
};

// ✅ GET /api/messages/users/available - Users the current role can message
router.get('/users/available', auth, async (req, res) => {
  try {
    const roles = getVisibleRoles(req.user.role);
    const users = await User.find({ role: { $in: roles }, _id: { $ne: req.user.id } })
      .select(USER_FIELDS)
      .sort({ name: 1 });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET /api/messages/unread/count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const unread = await Message.countDocuments({ receiverId: req.user.id, isRead: false });
    res.json({ success: true, data: { unread } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET /api/messages/unread/per-user
router.get('/unread/per-user', auth, async (req, res) => {
  try {
    const messages = await Message.aggregate([
      { $match: { receiverId: req.user.id, isRead: false } },
      { $group: { _id: '$senderId', count: { $sum: 1 } } },
    ]);

    const unreadCounts = {};
    messages.forEach((m) => { unreadCounts[m._id.toString()] = m.count; });

    res.json({ success: true, data: { unreadCounts } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET /api/messages/recent?limit=5 - Latest incoming messages (notifications)
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const messages = await Message.find({ receiverId: req.user.id })
      .populate('senderId', USER_FIELDS)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET /api/messages/:userId - Full conversation with one user
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId: me, receiverId: userId },
        { senderId: userId, receiverId: me },
      ],
    })
      .populate('senderId', USER_FIELDS)
      .populate('receiverId', USER_FIELDS)
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ PUT /api/messages/read-all - Mark all incoming as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { receiverId: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All messages marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
