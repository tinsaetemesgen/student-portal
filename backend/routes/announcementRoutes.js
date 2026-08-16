// routes/announcementRoutes.js - Announcements for all roles
const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getTimeRemaining } = require('../utils/helpers');

const withMeta = (announcement) => {
  const obj = announcement.toJSON ? announcement.toJSON() : { ...announcement };
  const expiresAt = obj.expiresAt ? new Date(obj.expiresAt) : null;
  obj.isExpired = !!expiresAt && expiresAt.getTime() < Date.now();
  obj.timeRemaining = getTimeRemaining(obj.expiresAt);
  return obj;
};

// ✅ GET /api/announcements - All announcements (newest first)
router.get('/', auth, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: announcements.length,
      data: announcements.map(withMeta),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ POST /api/announcements - Create (teacher/admin)
router.post('/', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const { title, content, audience, priority, expiresAt, status, date } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required',
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      audience: audience || 'all',
      priority: priority || 'medium',
      status: status || 'published',
      date: date || new Date(),
      expiresAt: expiresAt || null,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully!',
      data: withMeta(await announcement.populate('createdBy', 'name email role')),
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ PUT /api/announcements/:id - Update
router.put('/:id', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const { title, content, audience, priority, expiresAt, status } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    if (req.user.role === 'teacher' && announcement.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only update announcements you created',
      });
    }

    if (title !== undefined) announcement.title = title;
    if (content !== undefined) announcement.content = content;
    if (audience !== undefined) announcement.audience = audience;
    if (priority !== undefined) announcement.priority = priority;
    if (status !== undefined) announcement.status = status;
    if (expiresAt !== undefined) announcement.expiresAt = expiresAt || null;

    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement updated successfully!',
      data: withMeta(await announcement.populate('createdBy', 'name email role')),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ DELETE /api/announcements/:id - Delete
router.delete('/:id', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    if (req.user.role === 'teacher' && announcement.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete announcements you created',
      });
    }

    await announcement.deleteOne();

    res.json({
      success: true,
      message: 'Announcement deleted successfully!',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
