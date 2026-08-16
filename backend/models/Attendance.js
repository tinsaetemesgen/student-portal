// models/Attendance.js
const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true,
    default: 'present',
  },
  remarks: {
    type: String,
    trim: true,
    default: '',
  },
}, { _id: false });

const AttendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  semester: {
    type: String,
    required: true,
    default: 'Semester 1',
  },
  academicYear: {
    type: String,
    required: true,
  },
  records: [AttendanceRecordSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// One attendance sheet per class per day per term.
AttendanceSchema.index({ classId: 1, date: 1, semester: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
