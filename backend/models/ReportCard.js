// models/ReportCard.js
const mongoose = require('mongoose');

const SubjectScoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  grade: {
    type: String,
    trim: true,
    default: '',
  },
  remarks: {
    type: String,
    trim: true,
    default: '',
  },
}, { _id: false });

const ReportCardSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  term: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3', 'Final'],
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  subjects: [SubjectScoreSchema],
  totalMarks: {
    type: Number,
    default: 0,
  },
  totalObtained: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  gpa: {
    type: Number,
    default: 0,
  },
  overallGrade: {
    type: String,
    trim: true,
    default: '',
  },
  teacherRemarks: {
    type: String,
    trim: true,
    default: '',
  },
  fileUrl: {
    type: String,
    default: '',
  },
  fileName: {
    type: String,
    trim: true,
    default: '',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
  },
  isVisibleToStudent: {
    type: Boolean,
    default: true,
  },
  isVisibleToParent: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ReportCard', ReportCardSchema);
