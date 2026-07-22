// models/Grade.js - Simplified without pre-hooks
const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  // Core Fields
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
  
  //  Grade Details
  type: {
    type: String,
    enum: ['Assignment', 'Quiz', 'Exam', 'Project', 'Participation', 'Homework'],
    required: [true, 'Grade type is required'],
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be less than 0'],
    max: [100, 'Score cannot be more than 100'],
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'I'],
    required: [true, 'Letter grade is required'],
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Feedback cannot exceed 500 characters'],
  },
  
  //  Metadata
  date: {
    type: Date,
    default: Date.now,
  },
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
  
  // Tracking
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

//  Calculate letter grade based on score
GradeSchema.statics.calculateGrade = function(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 65) return 'D';
  return 'F';
};

// Get student's GPA for a specific semester
GradeSchema.statics.getStudentGPA = async function(studentId, semester, academicYear) {
  const grades = await this.find({
    studentId,
    semester,
    academicYear,
  });
  
  if (grades.length === 0) return 0;
  
  const gradeMap = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D': 1.0, 'F': 0.0,
  };
  
  const totalPoints = grades.reduce((sum, g) => {
    return sum + (gradeMap[g.grade] || 0);
  }, 0);
  
  return parseFloat((totalPoints / grades.length).toFixed(2));
};

// Indexes for faster queries
GradeSchema.index({ studentId: 1, semester: 1, academicYear: 1 });
GradeSchema.index({ classId: 1, subject: 1 });
GradeSchema.index({ teacherId: 1 });

module.exports = mongoose.model('Grade', GradeSchema);