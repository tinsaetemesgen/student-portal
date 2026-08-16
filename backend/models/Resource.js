// models/Resource.js
const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  fileUrl: {
    type: String,
    default: '',
  },
  fileName: {
    type: String,
    trim: true,
    default: '',
  },
  fileType: {
    type: String,
    default: 'file',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  readableSize: {
    type: String,
    default: '0 B',
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  topic: {
    type: String,
    trim: true,
    default: '',
  },
  classLevel: {
    type: String,
    enum: ['primary', 'middle', 'secondary'],
    default: 'secondary',
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    trim: true,
  },
  sections: [{
    type: String,
    trim: true,
  }],
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  }],
  semester: {
    type: String,
    default: 'Semester 1',
  },
  academicYear: {
    type: String,
    default: '2024/25',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resource', ResourceSchema);
