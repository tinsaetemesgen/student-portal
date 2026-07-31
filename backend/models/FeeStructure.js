// models/FeeStructure.js - Enhanced with date range and penalty system
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
  
  // 📅 DATE RANGE - NEW FIELDS
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        // Optional: Ensure startDate is before endDate
        return this.endDate ? value < this.endDate : true;
      },
      message: 'Start date must be before end date',
    },
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        // Optional: Ensure endDate is after startDate
        return this.startDate ? value > this.startDate : true;
      },
      message: 'End date must be after start date',
    },
  },
  
  // ⚠️ OVERDUE/PENALTY SYSTEM - NEW FIELDS
  lateFeeAmount: {
    type: Number,
    default: 0,
    min: [0, 'Late fee cannot be negative'],
    description: 'Additional fee charged if payment is made after endDate + gracePeriod',
  },
  gracePeriodDays: {
    type: Number,
    default: 0,
    min: [0, 'Grace period cannot be negative'],
    description: 'Number of days after endDate before late fee is applied',
  },
  // NEW: Track if late fee is currently being applied
  isLateFeeActive: {
    type: Boolean,
    default: false,
    description: 'Auto-calculated: true if current date > endDate + gracePeriod',
  },
  
  // 📌 Status
  isActive: {
    type: Boolean,
    default: true,
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

// 🔍 Indexes for faster queries
FeeStructureSchema.index({ classLevel: 1, academicYear: 1, isActive: 1 });
FeeStructureSchema.index({ startDate: 1, endDate: 1 });
FeeStructureSchema.index({ isLateFeeActive: 1 });

// 🧮 VIRTUAL FIELD: Calculate total payable amount (including late fee)
FeeStructureSchema.virtual('totalAmount').get(function() {
  const now = new Date();
  let total = this.amount;
  
  // If grace period has passed, add late fee
  if (this.isLateFeeActive) {
    total += this.lateFeeAmount;
  }
  
  return total;
});

// 🔄 VIRTUAL FIELD: Check if fee is overdue
FeeStructureSchema.virtual('isOverdue').get(function() {
  const now = new Date();
  // Get the effective deadline (endDate + gracePeriodDays)
  const deadline = new Date(this.endDate);
  deadline.setDate(deadline.getDate() + this.gracePeriodDays);
  return now > deadline;
});

// ⚙️ METHOD: Calculate late fee status
FeeStructureSchema.methods.calculateLateFeeStatus = function() {
  const now = new Date();
  const deadline = new Date(this.endDate);
  deadline.setDate(deadline.getDate() + this.gracePeriodDays);
  
  // Update isLateFeeActive flag
  this.isLateFeeActive = now > deadline && this.lateFeeAmount > 0;
  this.updatedAt = now;
  
  return this.isLateFeeActive;
};

// 💡 METHOD: Calculate total amount for a given date
FeeStructureSchema.methods.getAmountForDate = function(date) {
  const checkDate = date || new Date();
  const deadline = new Date(this.endDate);
  deadline.setDate(deadline.getDate() + this.gracePeriodDays);
  
  let total = this.amount;
  
  // If past deadline + grace period, add late fee
  if (checkDate > deadline) {
    total += this.lateFeeAmount;
  }
  
  return total;
};

// ⚙️ METHOD: Check if fee is currently active
FeeStructureSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate && this.isActive;
};

// 🧮 Ensure virtuals are included in JSON output
FeeStructureSchema.set('toJSON', { virtuals: true });
FeeStructureSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FeeStructure', FeeStructureSchema);