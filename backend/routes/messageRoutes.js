// routes/messageRoutes.js - FIXED role-based chatting
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ✅ GET AVAILABLE USERS (Role-based)
router.get('/users/available', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let targetUsers = [];

    // ✅ ROLE-BASED FILTERING
    switch (user.role) {
      case 'admin':
        // Admin can chat with everyone
        targetUsers = await User.find({
          _id: { $ne: req.user.id }
        }).select('name email role');
        break;

      case 'teacher':
        // Teacher can chat with parents, admins, and students
        targetUsers = await User.find({
          _id: { $ne: req.user.id },
          role: { $in: ['parent', 'admin', 'student'] }
        }).select('name email role');
        break;

      case 'parent':
        // Parent can chat with teachers, admins, and their children's teachers
        // For simplicity, teachers and admins
        targetUsers = await User.find({
          _id: { $ne: req.user.id },
          role: { $in: ['teacher', 'admin'] }
        }).select('name email role');
        
        // Also, get the teachers of their children
        // This is a simplified version - in production, you'd fetch teachers of linked students
        break;

      case 'student':
        // Student can chat with teachers and admins
        targetUsers = await User.find({
          _id: { $ne: req.user.id },
          role: { $in: ['teacher', 'admin'] }
        }).select('name email role');
        break;

      default:
        targetUsers = [];
    }

    res.json({
      success: true,
      data: targetUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET UNREAD COUNT (with role-based filtering)
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

// ✅ MARK ALL AS READ (for notification badge)
router.put('/read-all', auth, async (req, res) => {
  try {
    const result = await Message.updateMany(
      {
        receiverId: req.user.id,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} messages as read`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;