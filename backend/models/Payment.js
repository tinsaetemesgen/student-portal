// models/Payment.js - Student/parent payment submissions
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    studentFeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentFee',
      required: [true, 'Student fee is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 1,
    },
    bankName: {
      type: String,
      default: '',
      trim: true,
    },
    referenceNumber: {
      type: String,
      default: '',
      trim: true,
    },
    screenshotUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'failed'],
      default: 'pending',
    },
    receiptNumber: {
      type: String,
      default: '',
      trim: true,
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    confirmedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    // Display helpers (names are snapshotted at submission time).
    paidBy: {
      type: String,
      default: '',
      trim: true,
    },
    paidFor: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
