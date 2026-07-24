// models/Grade.js - Simplified with NO pre-hooks
const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  // 📌 Core Fields
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required'],
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required'],
  },
  
  // 📝 Weighted Assessments
  assessments: {
    quiz: {
      score: { type: Number, default: 0, min: 0 },
      maxScore: { type: Number, default: 20 },
      weight: { type: Number, default: 15 },
    },
    homework: {
      score: { type: Number, default: 0, min: 0 },
      maxScore: { type: Number, default: 15 },
      weight: { type: Number, default: 10 },
    },
    classTest: {
      score: { type: Number, default: 0, min: 0 },
      maxScore: { type: Number, default: 20 },
      weight: { type: Number, default: 20 },
    },
    finalTest: {
      score: { type: Number, default: 0, min: 0 },
      maxScore: { type: Number, default: 50 },
      weight: { type: Number, default: 35 },
    },
    groupWork: {
      score: { type: Number, default: 0, min: 0 },
      maxScore: { type: Number, default: 20 },
      weight: { type: Number, default: 20 },
    },
  },

  // ✅ Calculated Fields (Set manually in route)
  totalScore: {
    type: Number,
    default: 0,
  },
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'I'],
    default: 'I',
  },
  gradePoints: {
    type: Number,
    default: 0,
  },

  // 📅 Metadata
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['Semester 1', 'Semester 2'],
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true,
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Feedback cannot exceed 500 characters'],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ❌ NO pre('save') hooks!
// ❌ NO pre('findOneAndUpdate') hooks!

// ✅ Helper function to calculate weighted grade (used in routes)
GradeSchema.statics.calculateWeightedGrade = function(assessments) {
  const weights = {
    quiz: 15,
    homework: 10,
    classTest: 20,
    finalTest: 35,
    groupWork: 20,
  };
  
  let totalWeighted = 0;
  let allZero = true;
  
  const keys = ['quiz', 'homework', 'classTest', 'finalTest', 'groupWork'];
  
  for (const key of keys) {
    const data = assessments[key];
    if (data && data.score > 0) {
      allZero = false;
      const percentage = (data.score / data.maxScore) * 100;
      totalWeighted += percentage * (weights[key] / 100);
    }
  }
  
  if (allZero) {
    return { total: 0, grade: 'I', points: 0 };
  }
  
  const total = Math.round(totalWeighted * 10) / 10;
  
  // Determine letter grade
  let grade = 'F', points = 0;
  if (total >= 97) { grade = 'A+'; points = 4.0; }
  else if (total >= 93) { grade = 'A'; points = 4.0; }
  else if (total >= 90) { grade = 'A-'; points = 3.7; }
  else if (total >= 87) { grade = 'B+'; points = 3.3; }
  else if (total >= 83) { grade = 'B'; points = 3.0; }
  else if (total >= 80) { grade = 'B-'; points = 2.7; }
  else if (total >= 77) { grade = 'C+'; points = 2.3; }
  else if (total >= 73) { grade = 'C'; points = 2.0; }
  else if (total >= 70) { grade = 'C-'; points = 1.7; }
  else if (total >= 65) { grade = 'D'; points = 1.0; }
  else { grade = 'F'; points = 0.0; }
  
  return { total, grade, points };
};

// ✅ Indexes
GradeSchema.index({ studentId: 1, subject: 1, semester: 1, academicYear: 1 });
GradeSchema.index({ classId: 1 });

module.exports = mongoose.model('Grade', GradeSchema);