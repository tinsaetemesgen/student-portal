// models/Payment.js - Enhanced with receipt support
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // 📌 References
  studentFeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentFee',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // 🏦 Bank Information
  bankName: {
    type: String,
    enum: ['CBE', 'Abysina', 'Dashen', 'Coop', 'Wegagan', 'Other'],
    required: true,
  },
  referenceNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true, // ✅ Ensures uniqueness at database level
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9]{6,30}$/.test(v);
      },
      message: 'Reference number must be 6-30 alphanumeric characters',
    },
  },
  
  // 📸 Screenshot
  screenshotUrl: {
    type: String,
    required: true,
  },
  screenshotPublicId: {
    type: String,
  },
  
  // 💵 Payment Details
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  
  // 📌 Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'failed'],
    default: 'pending',
  },
  
  // 🧾 Receipt
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  receiptUrl: {
    type: String,
  },
  
  // 👤 Verification Details
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  confirmedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  
  // 📅 Audit
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PaymentSchema.index({ studentId: 1, status: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);