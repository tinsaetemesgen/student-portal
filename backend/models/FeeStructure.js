// models/FeeStructure.js - Updated (NO pre('save') hooks)
const mongoose = require('mongoose');

const FeeStructureSchema = new mongoose.Schema({
  // 📌 Core Fields
  name: {
    type: String,
    required: [true, 'Fee name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  
  // 📌 Fee Type
  feeType: {
    type: String,
    enum: ['tuition', 'registration', 'activity', 'library', 'lab', 'sports', 'other'],
    required: [true, 'Fee type is required'],
  },
  
  // 📌 Class Level (Which grades this applies to)
  classLevel: {
    type: String,
    enum: ['primary', 'middle', 'secondary'],
    required: [true, 'Class level is required'],
  },
  
  // 📌 Academic Period
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    trim: true,
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true,
  },
  
  //  Due Date
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  
  // 📌 Status
  isActive: {
    type: Boolean,
    default: true,
  },
  
  //  Timestamps (manual)
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
FeeStructureSchema.index({ classLevel: 1, academicYear: 1, isActive: 1 });


module.exports = mongoose.model('FeeStructure', FeeStructureSchema);