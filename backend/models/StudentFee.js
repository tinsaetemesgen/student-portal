// models/StudentFee.js - Updated (NO pre('save') hooks)
const mongoose = require('mongoose');

const StudentFeeSchema = new mongoose.Schema({
  // 📌 References
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
  },
  feeStructureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeStructure',
    required: [true, 'Fee structure ID is required'],
  },
  
  // 📌 Fee Details (copied from FeeStructure)
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  feeName: {
    type: String,
    required: [true, 'Fee name is required'],
  },
  feeType: {
    type: String,
    enum: ['tuition', 'registration', 'activity', 'library', 'lab', 'sports', 'other'],
    required: [true, 'Fee type is required'],
  },
  
  // 📌 Status
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  
  // 📌 Dates
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  paidAt: {
    type: Date,
  },
  
  // 📌 Academic Period
  semester: {
    type: String,
    required: [true, 'Semester is required'],
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
  },
  
  // 📅 Timestamps (manual)
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Indexes
StudentFeeSchema.index({ studentId: 1, status: 1 });
StudentFeeSchema.index({ feeStructureId: 1 });



module.exports = mongoose.model('StudentFee', StudentFeeSchema);