// models/FeeStructure.js - School fee structure templates
const mongoose = require('mongoose');

const FeeStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Fee name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    feeType: {
      type: String,
      enum: ['tuition', 'registration', 'activity', 'library', 'lab', 'sports', 'other'],
      default: 'tuition',
    },
    classLevel: {
      type: String,
      enum: ['primary', 'middle', 'secondary'],
      default: 'secondary',
    },
    semester: {
      type: String,
      default: 'Semester 1',
    },
    academicYear: {
      type: String,
      default: '2024/25',
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    lateFeeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    gracePeriodDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Fee is overdue once the deadline + grace period has passed.
FeeStructureSchema.methods.isOverdue = function () {
  if (!this.endDate) return false;
  const deadline = new Date(this.endDate);
  deadline.setDate(deadline.getDate() + (this.gracePeriodDays || 0));
  return new Date() > deadline;
};

FeeStructureSchema.methods.totalAmount = function () {
  return this.amount + (this.isOverdue() ? this.lateFeeAmount : 0);
};

module.exports = mongoose.model('FeeStructure', FeeStructureSchema);
