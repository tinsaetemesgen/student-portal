// models/StudentFee.js - A fee structure assigned to a single student
const mongoose = require('mongoose');

const StudentFeeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeStructure',
      required: [true, 'Fee structure is required'],
    },
    // Denormalized snapshot so the fee stays stable if the structure changes.
    feeName: {
      type: String,
      required: [true, 'Fee name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending',
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
    isLateFeeApplied: {
      type: Boolean,
      default: false,
    },
    semester: {
      type: String,
      default: 'Semester 1',
    },
    academicYear: {
      type: String,
      default: '2024/25',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

StudentFeeSchema.index({ studentId: 1, feeStructureId: 1 }, { unique: true });

// A fee is overdue when the deadline + grace period has passed and it is unpaid.
StudentFeeSchema.methods.isOverdue = function () {
  if (this.status === 'paid') return false;
  if (!this.endDate) return false;
  const deadline = new Date(this.endDate);
  deadline.setDate(deadline.getDate() + (this.gracePeriodDays || 0));
  return new Date() > deadline;
};

// Total amount owed including any late fee that currently applies.
StudentFeeSchema.methods.totalAmount = function () {
  return this.amount + (this.isOverdue() ? this.lateFeeAmount : 0);
};

module.exports = mongoose.model('StudentFee', StudentFeeSchema);
