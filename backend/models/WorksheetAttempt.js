// models/WorksheetAttempt.js
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  selectedOption: {
    type: Number,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  marksObtained: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const WorksheetAttemptSchema = new mongoose.Schema({
  worksheetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worksheet',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [AnswerSchema],
  score: {
    type: Number,
    default: 0,
  },
  totalMarks: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['in_progress', 'submitted'],
    default: 'in_progress',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: {
    type: Date,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
});

WorksheetAttemptSchema.index({ worksheetId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('WorksheetAttempt', WorksheetAttemptSchema);
