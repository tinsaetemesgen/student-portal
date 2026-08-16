// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
MessageSchema.index({ receiverId: 1, isRead: 1 });

module.exports = mongoose.model('Message', MessageSchema);
