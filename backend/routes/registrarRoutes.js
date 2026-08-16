// routes/registrarRoutes.js - Student/teacher/parent/class management for the registrar
const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getClassLevel } = require('../utils/helpers');

const DEFAULT_ACADEMIC_YEAR = '2024/25';

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// "Grade 10A" -> { grade: '10', section: 'A' }
const parseClassName = (name) => {
  const match = /^Grade\s*(\d{1,2})\s*([A-Ga-g])?$/.exec((name || '').trim());
  if (!match) return { grade: '', section: '' };
  return { grade: match[1], section: (match[2] || '').toUpperCase() };
};

// Find a class by name or create it on the fly.
const findOrCreateClass = async (className) => {
  let classDoc = await Class.findOne({ name: className });
  if (classDoc) return classDoc;

  const { grade, section } = parseClassName(className);
  if (!grade) return null;

  classDoc = await Class.create({
    name: className,
    grade,
    section: section || 'A',
    academicYear: DEFAULT_ACADEMIC_YEAR,
  });
  return classDoc;
};

// ============================================
// 📌 STUDENTS
// ============================================

// ✅ GET /api/registrar/students
router.get('/students', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .populate('parentId', 'name email phone')
      .sort({ name: 1 });

    const data = students.map((s) => {
      const obj = s.toJSON();
      obj.classLevel = getClassLevel(s.class);
      return obj;
    });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ POST /api/registrar/students - Create a student (optionally link/create a parent)
router.post('/students', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { name, email, password, class: className, age, parentName, parentPhone, parentEmail } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered. Please use a different email.',
      });
    }

    // Attach to the class (created on the fly if needed).
    let classDoc = null;
    if (className) {
      classDoc = await findOrCreateClass(className);
    }

    let parent = null;
    if (parentEmail) {
      parent = await User.findOne({ email: parentEmail });
      if (!parent) {
        const salt = await bcrypt.genSalt(10);
        parent = await User.create({
          name: parentName || parentEmail.split('@')[0],
          email: parentEmail,
          password: await bcrypt.hash('parent123', salt),
          role: 'parent',
          phone: parentPhone || '',
        });
      }
    }

    const student = await User.create({
      name,
      email,
      password: await hashPassword(password || 'password123'),
      role: 'student',
      class: classDoc ? classDoc.name : className,
      age: parseInt(age, 10) || 0,
      parentId: parent ? parent._id : null,
    });

    if (classDoc) {
      if (!classDoc.students.some((id) => id.toString() === student._id.toString())) {
        classDoc.students.push(student._id);
        await classDoc.save();
      }
    }

    if (parent) {
      if (!parent.children.some((id) => id.toString() === student._id.toString())) {
        parent.children.push(student._id);
        await parent.save();
      }
    }

    res.status(201).json({
      success: true,
      message: `Student ${student.name} registered successfully!`,
      data: student,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already exists.' });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ DELETE /api/registrar/students/:id
router.delete('/students/:id', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    await Class.updateMany({ students: student._id }, { $pull: { students: student._id } });
    await User.updateMany({ children: student._id }, { $pull: { children: student._id } });

    await student.deleteOne();

    res.json({ success: true, message: 'Student deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 TEACHERS
// ============================================

// ✅ GET /api/registrar/teachers
router.get('/teachers', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).sort({ name: 1 });
    const classes = await Class.find().select('name grade section academicYear');

    const teacherClassMap = {};
    classes.forEach((c) => {
      (c.teacherIds || []).forEach((tId) => {
        const key = tId.toString();
        if (!teacherClassMap[key]) teacherClassMap[key] = [];
        teacherClassMap[key].push({ _id: c._id, name: c.name, grade: c.grade, section: c.section });
      });
    });

    const data = teachers.map((t) => {
      const obj = t.toJSON();
      obj.assignedClasses = teacherClassMap[t._id.toString()] || [];
      return obj;
    });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ POST /api/registrar/teachers
router.post('/teachers', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { name, email, password, subject, hireDate, phone, assignedClasses } = req.body;

    if (!name || !email || !subject) {
      return res.status(400).json({ success: false, error: 'Name, email and subject are required' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered. Please use a different email.',
      });
    }

    const classIds = Array.isArray(assignedClasses) ? assignedClasses : [];

    const teacher = await User.create({
      name,
      email,
      password: await hashPassword(password || 'password123'),
      role: 'teacher',
      subject,
      hireDate: hireDate || new Date(),
      phone: phone || '',
      assignedClasses: classIds,
    });

    for (const classId of classIds) {
      await Class.findByIdAndUpdate(classId, { $addToSet: { teacherIds: teacher._id } });
    }

    res.status(201).json({
      success: true,
      message: `Teacher ${teacher.name} registered successfully!`,
      data: teacher,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already exists.' });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ DELETE /api/registrar/teachers/:id
router.delete('/teachers/:id', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    await Class.updateMany({ teacherIds: teacher._id }, { $pull: { teacherIds: teacher._id } });

    await teacher.deleteOne();

    res.json({ success: true, message: 'Teacher deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 PARENTS
// ============================================

// ✅ GET /api/registrar/parents
router.get('/parents', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const parents = await User.find({ role: 'parent' })
      .populate('children', 'name email class age')
      .sort({ name: 1 });

    res.json({ success: true, count: parents.length, data: parents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ POST /api/registrar/parents
router.post('/parents', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered. Please use a different email.',
      });
    }

    const parent = await User.create({
      name,
      email,
      password: await hashPassword(password || 'parent123'),
      role: 'parent',
      phone: phone || '',
      address: address || '',
    });

    res.status(201).json({
      success: true,
      message: `Parent ${parent.name} registered successfully!`,
      data: parent,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already exists.' });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ PUT /api/registrar/parents/:parentId/link/:studentId
router.put('/parents/:parentId/link/:studentId', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { parentId, studentId } = req.params;

    const parent = await User.findById(parentId);
    const student = await User.findById(studentId);

    if (!parent || parent.role !== 'parent') {
      return res.status(404).json({ success: false, error: 'Parent not found' });
    }
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    student.parentId = parent._id;
    await student.save();

    if (!parent.children.some((id) => id.toString() === studentId)) {
      parent.children.push(student._id);
      await parent.save();
    }

    const updatedParent = await User.findById(parentId).populate('children', 'name email class age');

    res.json({
      success: true,
      message: `${student.name} linked to ${parent.name} successfully!`,
      data: { parent: updatedParent },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 CLASSES
// ============================================

// ✅ GET /api/registrar/classes
router.get('/classes', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('teacherIds', 'name email subject')
      .populate('students', 'name email')
      .sort({ grade: 1, section: 1 });

    const data = classes.map((c) => {
      const obj = c.toJSON();
      obj.classLevel = getClassLevel(c.grade);
      return obj;
    });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ POST /api/registrar/classes
router.post('/classes', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { name, grade, section, academicYear, teacherIds, subjects } = req.body;

    if (!name || !grade || !section) {
      return res.status(400).json({ success: false, error: 'Name, grade and section are required' });
    }

    const existing = await Class.findOne({ name, academicYear: academicYear || DEFAULT_ACADEMIC_YEAR });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Class already exists for this academic year',
      });
    }

    const classDoc = await Class.create({
      name,
      grade,
      section,
      academicYear: academicYear || DEFAULT_ACADEMIC_YEAR,
      teacherIds: teacherIds || [],
      subjects: subjects || [],
    });

    for (const teacherId of teacherIds || []) {
      await User.findByIdAndUpdate(teacherId, { $addToSet: { assignedClasses: classDoc._id } });
    }

    res.status(201).json({
      success: true,
      message: 'Class created successfully!',
      data: classDoc,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Class already exists.' });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
