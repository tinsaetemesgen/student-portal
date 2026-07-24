// routes/gradeRoutes.js - COMPLETE UPDATED with manual updatedAt
const express = require('express');
const router = express.Router();
const Grade = require('../models/Grade');
const Class = require('../models/Class');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

//  TEACHER ROUTES
// ✅ POST /api/grades - Create grade with MANUAL calculation
router.post('/', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const {
      studentId,
      subject,
      classId,
      semester,
      academicYear,
      feedback,
      assessments,
    } = req.body;

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Validate class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    // Check if teacher is assigned to this class
    if (req.user.role === 'teacher') {
      const teacherIds = classData.teacherIds.map(id => id.toString());
      if (!teacherIds.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          error: 'You are not assigned to this class',
        });
      }
    }

    // Check if grade already exists
    const existingGrade = await Grade.findOne({
      studentId,
      subject,
      semester,
      academicYear,
    });

    if (existingGrade) {
      return res.status(400).json({
        success: false,
        error: 'Grade already exists for this student and subject. Use PUT to update.',
      });
    }

    // ✅ MANUALLY CALCULATE weighted grade
    const assessmentData = {
      quiz: assessments?.quiz || { score: 0, maxScore: 20, weight: 15 },
      homework: assessments?.homework || { score: 0, maxScore: 15, weight: 10 },
      classTest: assessments?.classTest || { score: 0, maxScore: 20, weight: 20 },
      finalTest: assessments?.finalTest || { score: 0, maxScore: 50, weight: 35 },
      groupWork: assessments?.groupWork || { score: 0, maxScore: 20, weight: 20 },
    };

    const result = Grade.calculateWeightedGrade(assessmentData);

    // Create grade with calculated values
    const grade = new Grade({
      studentId,
      subject,
      classId,
      teacherId: req.user.id,
      semester,
      academicYear,
      feedback,
      assessments: assessmentData,
      totalScore: result.total,
      letterGrade: result.grade,
      gradePoints: result.points,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await grade.save();

    res.status(201).json({
      success: true,
      message: 'Grade created successfully!',
      data: grade,
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
// Enter Multiple Grades (Bulk)
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

// Get Grades by Class
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
// ✅ PUT /api/grades/:id - Update grade with assessments
// ✅ PUT /api/grades/:id - Update grade with MANUAL recalculation
router.put('/:id', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { assessments, feedback, subject, semester, academicYear } = req.body;

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({ success: false, error: 'Grade not found' });
    }

    // Check if teacher owns this grade
    if (req.user.role === 'teacher' && grade.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only update grades you created',
      });
    }

    // Update fields
    if (assessments) {
      if (assessments.quiz) grade.assessments.quiz = { ...grade.assessments.quiz, ...assessments.quiz };
      if (assessments.homework) grade.assessments.homework = { ...grade.assessments.homework, ...assessments.homework };
      if (assessments.classTest) grade.assessments.classTest = { ...grade.assessments.classTest, ...assessments.classTest };
      if (assessments.finalTest) grade.assessments.finalTest = { ...grade.assessments.finalTest, ...assessments.finalTest };
      if (assessments.groupWork) grade.assessments.groupWork = { ...grade.assessments.groupWork, ...assessments.groupWork };
      
      // ✅ Recalculate totalScore, letterGrade, gradePoints
      const result = Grade.calculateWeightedGrade(grade.assessments);
      grade.totalScore = result.total;
      grade.letterGrade = result.grade;
      grade.gradePoints = result.points;
    }
    
    if (feedback) grade.feedback = feedback;
    if (subject) grade.subject = subject;
    if (semester) grade.semester = semester;
    if (academicYear) grade.academicYear = academicYear;
    
    grade.updatedAt = new Date();
    await grade.save();

    res.json({
      success: true,
      message: 'Grade updated successfully!',
      data: grade,
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
// ✅ GET /api/grades/my-grades - Student's own grades
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

    // ✅ Calculate GPA manually (plain JavaScript)
    let gpa = 0;
    let totalPoints = 0;
    const gradeCount = grades.length;

    if (gradeCount > 0) {
      const gradeMap = {  // ✅ NO TypeScript type annotation!
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D': 1.0, 'F': 0.0,
      };
      
      for (const grade of grades) {
        const points = gradeMap[grade.letterGrade || grade.grade] || 0;
        totalPoints += points;
      }
      gpa = parseFloat((totalPoints / gradeCount).toFixed(2));
    }

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
// ✅ Get Child's Grades
// ✅ GET /api/grades/child/:childId/grades - Parent views child's grades
router.get('/child/:childId/grades', auth, roleCheck('parent'), async (req, res) => {
  try {
    const { childId } = req.params;
    const { semester, academicYear } = req.query;

    // Verify this child belongs to this parent
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

    // ✅ Calculate GPA manually (plain JavaScript)
    let gpa = 0;
    let totalPoints = 0;
    const gradeCount = grades.length;

    if (gradeCount > 0) {
      const gradeMap = {  // ✅ NO TypeScript type annotation!
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D': 1.0, 'F': 0.0,
      };
      
      for (const grade of grades) {
        const points = gradeMap[grade.letterGrade || grade.grade] || 0;
        totalPoints += points;
      }
      gpa = parseFloat((totalPoints / gradeCount).toFixed(2));
    }

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