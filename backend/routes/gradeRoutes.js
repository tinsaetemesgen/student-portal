// routes/gradeRoutes.js - COMPLETE UPDATED with manual updatedAt
const express = require('express');
const router = express.Router();
const Grade = require('../models/Grade');
const Class = require('../models/Class');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// ============================================
// 📌 TEACHER ROUTES
// ============================================

// ✅ Enter Single Grade
router.post('/', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const { 
      studentId, 
      subject, 
      classId, 
      type, 
      score, 
      feedback, 
      semester, 
      academicYear 
    } = req.body;
    
    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }
    
    // Verify class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Class not found' 
      });
    }
    
    // Check if teacher is assigned to this class
    if (req.user.role === 'teacher') {
      const teacherIdsAsStrings = classData.teacherIds.map(id => id.toString());
      if (!teacherIdsAsStrings.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          error: 'You are not assigned to this class',
        });
      }
    }
    
    // Calculate letter grade
    const letterGrade = Grade.calculateGrade(score);
    
    // Create grade with manual timestamps
    const newGrade = new Grade({
      studentId,
      subject,
      classId,
      teacherId: req.user.id,
      type,
      score,
      grade: letterGrade,
      feedback,
      semester,
      academicYear,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await newGrade.save();
    
    res.status(201).json({
      success: true,
      message: 'Grade entered successfully!',
      data: newGrade,
    });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, errors });
    }
    
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Enter Multiple Grades (Bulk)
router.post('/bulk', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const { grades } = req.body;
    
    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of grades',
      });
    }
    
    const results = {
      successful: [],
      failed: [],
    };
    
    for (const gradeData of grades) {
      try {
        const { 
          studentId, 
          subject, 
          classId, 
          type, 
          score, 
          feedback, 
          semester, 
          academicYear 
        } = gradeData;
        
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
          results.failed.push({ studentId, reason: 'Student not found' });
          continue;
        }
        
        const classData = await Class.findById(classId);
        if (!classData) {
          results.failed.push({ studentId, reason: 'Class not found' });
          continue;
        }
        
        const letterGrade = Grade.calculateGrade(score);
        
        const newGrade = new Grade({
          studentId,
          subject,
          classId,
          teacherId: req.user.id,
          type,
          score,
          grade: letterGrade,
          feedback,
          semester,
          academicYear,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        await newGrade.save();
        results.successful.push(newGrade);
      } catch (error) {
        results.failed.push({ 
          studentId: gradeData.studentId, 
          reason: error.message 
        });
      }
    }
    
    res.json({
      success: true,
      message: `Added ${results.successful.length} grades successfully`,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Get Grades by Class
router.get('/class/:classId', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const { classId } = req.params;
    const { subject, semester, academicYear } = req.query;
    
    const filter = { classId };
    if (subject) filter.subject = subject;
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    
    const grades = await Grade.find(filter)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email')
      .sort({ date: -1 });
    
    res.json({
      success: true,
      count: grades.length,
      data: grades,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Update Grade
router.put('/:id', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const { score, feedback, type } = req.body;
    
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ success: false, error: 'Grade not found' });
    }
    
    if (req.user.role === 'teacher' && grade.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only update grades you entered',
      });
    }
    
    if (score !== undefined) {
      grade.score = score;
      grade.grade = Grade.calculateGrade(score);
    }
    if (feedback) grade.feedback = feedback;
    if (type) grade.type = type;
    
    // 👇 Manually update the updatedAt timestamp
    grade.updatedAt = new Date();
    
    await grade.save();
    
    res.json({
      success: true,
      message: 'Grade updated successfully!',
      data: grade,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Delete Grade
router.delete('/:id', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ success: false, error: 'Grade not found' });
    }
    
    if (req.user.role === 'teacher' && grade.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete grades you entered',
      });
    }
    
    await grade.deleteOne();
    
    res.json({
      success: true,
      message: 'Grade deleted successfully!',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 STUDENT ROUTES
// ============================================

// ✅ Get Student's Own Grades
router.get('/my-grades', auth, roleCheck('student'), async (req, res) => {
  try {
    const { semester, academicYear, subject } = req.query;
    
    const filter = { studentId: req.user.id };
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    if (subject) filter.subject = subject;
    
    const grades = await Grade.find(filter)
      .populate('teacherId', 'name email')
      .populate('classId', 'name')
      .sort({ date: -1 });
    
    const gpa = await Grade.getStudentGPA(req.user.id, semester, academicYear);
    
    res.json({
      success: true,
      gpa: gpa,
      count: grades.length,
      data: grades,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Get Student's Grade Summary
router.get('/my-grades/summary', auth, roleCheck('student'), async (req, res) => {
  try {
    const { semester, academicYear } = req.query;
    
    const filter = { studentId: req.user.id };
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    
    const grades = await Grade.find(filter);
    
    const summary = {};
    grades.forEach(g => {
      if (!summary[g.subject]) {
        summary[g.subject] = {
          subject: g.subject,
          grades: [],
          average: 0,
        };
      }
      summary[g.subject].grades.push(g);
    });
    
    Object.keys(summary).forEach(subject => {
      const subjectGrades = summary[subject].grades;
      const total = subjectGrades.reduce((sum, g) => sum + g.score, 0);
      summary[subject].average = parseFloat((total / subjectGrades.length).toFixed(2));
    });
    
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 PARENT ROUTES
// ============================================

// ✅ Get Child's Grades
router.get('/child/:childId/grades', auth, roleCheck('parent'), async (req, res) => {
  try {
    const { childId } = req.params;
    const { semester, academicYear } = req.query;
    
    const parent = await User.findById(req.user.id);
    if (!parent.children.includes(childId)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this student\'s grades',
      });
    }
    
    const filter = { studentId: childId };
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    
    const grades = await Grade.find(filter)
      .populate('teacherId', 'name email')
      .populate('classId', 'name')
      .sort({ date: -1 });
    
    const gpa = await Grade.getStudentGPA(childId, semester, academicYear);
    
    res.json({
      success: true,
      gpa: gpa,
      count: grades.length,
      data: grades,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 ADMIN ROUTES
// ============================================

// ✅ Get All Grades
router.get('/all', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { classId, subject, semester, academicYear } = req.query;
    
    const filter = {};
    if (classId) filter.classId = classId;
    if (subject) filter.subject = subject;
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    
    const grades = await Grade.find(filter)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email')
      .populate('classId', 'name')
      .sort({ date: -1 });
    
    res.json({
      success: true,
      count: grades.length,
      data: grades,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Get Grade Statistics
router.get('/stats', auth, roleCheck('admin'), async (req, res) => {
  try {
    const totalGrades = await Grade.countDocuments();
    const averageScore = await Grade.aggregate([
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);
    
    const gradeDistribution = await Grade.aggregate([
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalGrades,
        averageScore: averageScore[0]?.avg || 0,
        gradeDistribution,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;