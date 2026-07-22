// models/Class.js - FIXED!
const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    unique: true,
    trim: true,
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    trim: true,
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true,
  },
  
  
  teacherIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Subjects taught in this class
  subjects: [{
    type: String,
    trim: true,
  }],
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Class', ClassSchema);