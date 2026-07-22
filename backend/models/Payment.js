// models/Payment.js - Updated (NO pre('save') hooks)
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // 📌 References
  studentFeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentFee',
    required: [true, 'Student fee ID is required'],
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
  },
  
  // 📌 Payment Details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  
  // 📌 Payment Method
  method: {
    type: String,
    enum: ['bank', 'telebir', 'chapa'],
    required: [true, 'Payment method is required'],
  },
  
  // 🏦 Bank Transfer Fields
  bankName: {
    type: String,
    enum: ['CBE', 'Abysina', 'Dashen', 'Coop', 'Wegagan', 'Other'],
    required: function() { return this.method === 'bank'; },
  },
  referenceNumber: {
    type: String,
    required: function() { return this.method === 'bank'; },
    trim: true,
  },
  
  // 📱 Telebir Fields
  telebirNumber: {
    type: String,
    required: function() { return this.method === 'telebir'; },
    trim: true,
  },
  telebirName: {
    type: String,
    required: function() { return this.method === 'telebir'; },
    trim: true,
  },
  
  // 💳 Chapa Fields (Future)
  chapaRef: {
    type: String,
    trim: true,
  },
  
  // 📌 Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  },
  
  // 📌 Confirmation Details
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  confirmedAt: {
    type: Date,
  },
  
  // 📌 Receipt
  receiptNumber: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
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
PaymentSchema.index({ studentId: 1, status: 1 });
PaymentSchema.index({ studentFeeId: 1 });



module.exports = mongoose.model('Payment', PaymentSchema);