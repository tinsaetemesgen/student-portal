// models/Announcement.js
const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  audience: {
    type: String,
    enum: ['all', 'students', 'teachers', 'parents', 'admin'],
    default: 'all',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'published',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
