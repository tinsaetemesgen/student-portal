// routes/attendanceRoutes.js - Attendance for teacher/admin/student/parent
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const STATUSES = ['present', 'absent', 'late', 'excused'];

const buildSummary = (statuses) => {
  const summary = { present: 0, absent: 0, late: 0, excused: 0 };
  statuses.forEach((s) => {
    if (summary[s] !== undefined) summary[s] += 1;
  });
  const total = summary.present + summary.absent + summary.late + summary.excused;
  const rate = total > 0
    ? Math.round(((summary.present + summary.late + summary.excused) / total) * 1000) / 10
    : 0;
  return { ...summary, total, attendanceRate: rate };
};

const getIsoWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};

const startOfWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = (day === 0 ? 6 : day - 1);
  d.setDate(d.getDate() - diff);
  return d;
};

// ✅ POST /api/attendance - Save/upsert an attendance sheet (teacher/admin)
router.post('/', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const { classId, date, semester, academicYear, records } = req.body;

    if (!classId || !date || !records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'classId, date and records are required',
      });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    if (req.user.role === 'teacher') {
      const ids = classData.teacherIds.map((id) => id.toString());
      if (!ids.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          error: 'You are not assigned to this class',
        });
      }
    }

    const normalizedRecords = records.map((r) => ({
      studentId: r.studentId,
      status: STATUSES.includes(r.status) ? r.status : 'present',
      remarks: r.remarks || '',
    }));

    let sheet = await Attendance.findOne({
      classId,
      date: new Date(date),
      semester: semester || 'Semester 1',
      academicYear: academicYear || '2024/25',
    });

    if (sheet) {
      sheet.records = normalizedRecords;
      sheet.createdBy = req.user.id;
      await sheet.save();
      return res.json({
        success: true,
        message: 'Attendance updated successfully!',
        data: sheet,
      });
    }

    sheet = await Attendance.create({
      classId,
      date: new Date(date),
      semester: semester || 'Semester 1',
      academicYear: academicYear || '2024/25',
      records: normalizedRecords,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully!',
      data: sheet,
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Attendance already recorded for this date. Update instead.',
      });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET /api/attendance/reports - Summary + recent sheets (admin)
router.get('/reports', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { semester, academicYear } = req.query;
    const filter = {};
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    const sheets = await Attendance.find(filter)
      .populate('classId', 'name')
      .populate('records.studentId', 'name')
      .sort({ date: -1 });

    const summary = { totalClasses: sheets.length, present: 0, absent: 0, late: 0, excused: 0 };
    sheets.forEach((s) => {
      (s.records || []).forEach((r) => {
        if (summary[r.status] !== undefined) summary[r.status] += 1;
      });
    });
    summary.totalStudents = summary.present + summary.absent + summary.late + summary.excused;

    res.json({
      success: true,
      data: { summary, records: sheets },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET /api/attendance/class/:classId - Sheets for a class (teacher/admin)
router.get('/class/:classId', auth, roleCheck('teacher', 'admin'), async (req, res) => {
  try {
    const { classId } = req.params;
    const { semester, academicYear } = req.query;

    const filter = { classId };
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    const sheets = await Attendance.find(filter)
      .populate('classId', 'name')
      .populate('records.studentId', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: sheets.length,
      data: sheets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET /api/attendance/my-summary - Student's own summary + breakdown
router.get('/my-summary', auth, roleCheck('student'), async (req, res) => {
  try {
    const sheets = await Attendance.find({ 'records.studentId': req.user.id }).sort({ date: 1 });

    const allStatuses = [];
    sheets.forEach((s) => {
      (s.records || []).forEach((r) => {
        if (r.studentId && r.studentId.toString() === req.user.id) {
          allStatuses.push({ status: r.status, date: s.date, semester: s.semester, academicYear: s.academicYear });
        }
      });
    });

    const overall = buildSummary(allStatuses.map((x) => x.status));

    const byWeek = new Map();
    const byMonth = new Map();
    const bySemester = new Map();
    const byYear = new Map();

    allStatuses.forEach((x) => {
      const date = new Date(x.date);
      const wkStart = startOfWeek(date);
      const key = wkStart.toISOString().slice(0, 10);
      if (!byWeek.has(key)) {
        const end = new Date(wkStart);
        end.setDate(end.getDate() + 6);
        byWeek.set(key, {
          period: 'week',
          periodStart: wkStart.toISOString(),
          periodEnd: end.toISOString(),
          weekNumber: getIsoWeek(date),
          academicYear: x.academicYear,
          statuses: [],
        });
      }
      byWeek.get(key).statuses.push(x.status);

      const mKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth.has(mKey)) {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        byMonth.set(mKey, {
          period: 'month',
          periodStart: start.toISOString(),
          periodEnd: end.toISOString(),
          month: date.toLocaleString('en', { month: 'long' }),
          academicYear: x.academicYear,
          statuses: [],
        });
      }
      byMonth.get(mKey).statuses.push(x.status);

      const sKey = `${x.semester}|${x.academicYear}`;
      if (!bySemester.has(sKey)) {
        bySemester.set(sKey, {
          period: 'semester',
          periodStart: sheets[0]?.date ? new Date(sheets[0].date).toISOString() : new Date().toISOString(),
          periodEnd: new Date().toISOString(),
          semester: x.semester,
          academicYear: x.academicYear,
          statuses: [],
        });
      }
      bySemester.get(sKey).statuses.push(x.status);

      if (!byYear.has(x.academicYear)) {
        byYear.set(x.academicYear, {
          period: 'annual',
          periodStart: sheets[0]?.date ? new Date(sheets[0].date).toISOString() : new Date().toISOString(),
          periodEnd: new Date().toISOString(),
          academicYear: x.academicYear,
          statuses: [],
        });
      }
      byYear.get(x.academicYear).statuses.push(x.status);
    });

    const toBreakdown = (map) => {
      const items = [];
      map.forEach((entry) => {
        const { statuses, ...rest } = entry;
        items.push({ ...rest, summary: buildSummary(statuses) });
      });
      return items.sort((a, b) => new Date(a.periodStart) - new Date(b.periodStart)).reverse();
    };

    res.json({
      success: true,
      data: {
        overall,
        breakdown: [
          ...toBreakdown(byWeek),
          ...toBreakdown(byMonth),
          ...toBreakdown(bySemester),
          ...toBreakdown(byYear),
        ],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET /api/attendance/child/:childId/attendance - Parent views child's records
router.get('/child/:childId/attendance', auth, roleCheck('parent'), async (req, res) => {
  try {
    const { childId } = req.params;
    const parent = await User.findById(req.user.id);
    if (!parent || !parent.children.some((id) => id.toString() === childId)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this student\'s attendance',
      });
    }

    const sheets = await Attendance.find({ 'records.studentId': childId })
      .populate('classId', 'name')
      .sort({ date: -1 });

    const records = [];
    sheets.forEach((s) => {
      (s.records || []).forEach((r) => {
        if (r.studentId && r.studentId.toString() === childId) {
          records.push({
            _id: `${s._id}-${r._id || Math.random().toString(36).slice(2)}`,
            date: s.date,
            status: r.status,
            classId: s.classId || null,
            remarks: r.remarks || '',
          });
        }
      });
    });

    res.json({
      success: true,
      count: records.length,
      data: { records },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
