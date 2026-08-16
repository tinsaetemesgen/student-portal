// models/PasswordResetRequest.js
const mongoose = require('mongoose');

const PasswordResetRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('PasswordResetRequest', PasswordResetRequestSchema);
