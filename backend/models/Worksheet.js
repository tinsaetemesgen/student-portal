// models/Worksheet.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: [{
    type: String,
    trim: true,
  }],
  correctAnswer: {
    type: Number,
    min: 0,
  },
  marks: {
    type: Number,
    min: 1,
    default: 1,
  },
}, { _id: false });

const WorksheetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [QuestionSchema],
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: () => Date.now() + 7 * 86400000,
  },
  duration: {
    type: Number,
    min: 1,
    default: 30,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

WorksheetSchema.virtual('totalMarks').get(function () {
  return (this.questions || []).reduce((sum, q) => sum + (q.marks || 0), 0);
});

WorksheetSchema.virtual('totalQuestions').get(function () {
  return (this.questions || []).length;
});

WorksheetSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Worksheet', WorksheetSchema);
