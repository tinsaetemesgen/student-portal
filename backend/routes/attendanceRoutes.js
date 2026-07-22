const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');


//  TEACHER ROUTES

//  MARK ATTENDANCE (Teacher)
router.post('/', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const { classId, date, records, semester, academicYear } = req.body;

    // Validate class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    // Verify teacher is assigned to this class
    if (req.user.role === 'teacher') {
      const teacherIds = classData.teacherIds.map(id => id.toString());
      if (!teacherIds.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          error: 'You are not assigned to this class',
        });
      }
    }

    // Validate all students exist
    for (const record of records) {
      const student = await User.findById(record.studentId);
      if (!student || student.role !== 'student') {
        return res.status(404).json({
          success: false,
          error: `Student ${record.studentId} not found`,
        });
      }
    }

    // Check if attendance already exists for this class and date
    const existingAttendance = await Attendance.findOne({
      classId,
      date: new Date(date || Date.now()),
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.records = records;
      existingAttendance.updatedAt = new Date();
      await existingAttendance.save();

      return res.json({
        success: true,
        message: 'Attendance updated successfully!',
        data: existingAttendance,
      });
    }

    // Create new attendance
    const attendance = new Attendance({
      classId,
      date: date || new Date(),
      semester,
      academicYear,
      records,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully!',
      data: attendance,
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

//  GET ATTENDANCE FOR A CLASS (Teacher/Admin)
router.get('/class/:classId', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, semester, academicYear } = req.query;

    const filter = { classId };
    if (date) filter.date = new Date(date);
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    const attendance = await Attendance.find(filter)
      .populate('records.studentId', 'name email')
      .populate('createdBy', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  GET TODAY'S ATTENDANCE FOR A CLASS (Teacher)
router.get('/class/:classId/today', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const { classId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      classId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate('records.studentId', 'name email');

    // Get all students in the class
    const classData = await Class.findById(classId).populate('students', 'name email');

    if (!attendance) {
      // Return students with no attendance marked yet
      return res.json({
        success: true,
        message: 'No attendance marked for today',
        data: {
          class: classData,
          students: classData.students,
          attendance: null,
        },
      });
    }

    res.json({
      success: true,
      data: {
        class: classData,
        attendance,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  GET STUDENT'S ATTENDANCE (Student)
router.get('/my-attendance', auth, roleCheck('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { semester, academicYear } = req.query;

    // Find all attendance records where this student appears
    const filter = {
      'records.studentId': studentId,
    };
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    const attendance = await Attendance.find(filter)
      .populate('classId', 'name')
      .sort({ date: -1 });

    // Format response to show student's status only
    const formattedAttendance = attendance.map(record => {
      const studentRecord = record.records.find(
        r => r.studentId.toString() === studentId
      );
      return {
        date: record.date,
        class: record.classId,
        status: studentRecord ? studentRecord.status : 'Not marked',
        remarks: studentRecord ? studentRecord.remarks : '',
        markedAt: studentRecord ? studentRecord.markedAt : null,
      };
    });

    // Calculate statistics
    const total = formattedAttendance.length;
    const present = formattedAttendance.filter(r => r.status === 'present').length;
    const absent = formattedAttendance.filter(r => r.status === 'absent').length;
    const late = formattedAttendance.filter(r => r.status === 'late').length;
    const excused = formattedAttendance.filter(r => r.status === 'excused').length;

    res.json({
      success: true,
      data: {
        summary: {
          total,
          present,
          absent,
          late,
          excused,
          attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
        },
        records: formattedAttendance,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  GET CHILD'S ATTENDANCE (Parent)
router.get('/child/:childId/attendance', auth, roleCheck('parent'), async (req, res) => {
  try {
    const { childId } = req.params;
    const { semester, academicYear } = req.query;

    // Verify parent has access to this child
    const parent = await User.findById(req.user.id);
    if (!parent.children.includes(childId)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this student\'s attendance',
      });
    }

    const filter = {
      'records.studentId': childId,
    };
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    const attendance = await Attendance.find(filter)
      .populate('classId', 'name')
      .sort({ date: -1 });

    const formattedAttendance = attendance.map(record => {
      const studentRecord = record.records.find(
        r => r.studentId.toString() === childId
      );
      return {
        date: record.date,
        class: record.classId,
        status: studentRecord ? studentRecord.status : 'Not marked',
        remarks: studentRecord ? studentRecord.remarks : '',
        markedAt: studentRecord ? studentRecord.markedAt : null,
      };
    });

    const total = formattedAttendance.length;
    const present = formattedAttendance.filter(r => r.status === 'present').length;
    const absent = formattedAttendance.filter(r => r.status === 'absent').length;
    const late = formattedAttendance.filter(r => r.status === 'late').length;
    const excused = formattedAttendance.filter(r => r.status === 'excused').length;

    // Get child info
    const child = await User.findById(childId);

    res.json({
      success: true,
      data: {
        student: {
          name: child.name,
          class: child.class,
        },
        summary: {
          total,
          present,
          absent,
          late,
          excused,
          attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
        },
        records: formattedAttendance,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  ADMIN ROUTES


//  GET ATTENDANCE REPORTS (Admin)
router.get('/reports', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { classId, semester, academicYear, startDate, endDate } = req.query;

    const filter = {};
    if (classId) filter.classId = classId;
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const attendance = await Attendance.find(filter)
      .populate('classId', 'name')
      .populate('records.studentId', 'name email class')
      .sort({ date: -1 });

    // Calculate overall statistics
    const stats = {
      totalClasses: attendance.length,
      totalStudents: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    attendance.forEach(record => {
      record.records.forEach(r => {
        stats.totalStudents++;
        if (r.status === 'present') stats.present++;
        else if (r.status === 'absent') stats.absent++;
        else if (r.status === 'late') stats.late++;
        else if (r.status === 'excused') stats.excused++;
      });
    });

    res.json({
      success: true,
      data: {
        summary: stats,
        records: attendance,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;