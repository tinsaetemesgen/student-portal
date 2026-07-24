// routes/registrarRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Class = require('../models/Class');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const bcrypt = require('bcryptjs');

// ============================================
// 📌 REGISTRAR ROUTES - Student Management
// ============================================

// ✅ Get all students
router.get('/students', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ name: 1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Get all teachers
router.get('/teachers', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('-password')
      .sort({ name: 1 });
    res.json({ success: true, count: teachers.length, data: teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Create student (Registrar)
// ✅ Create student (Registrar) - WITH PARENT LINKING
router.post('/students', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      class: className, 
      age, 
      parentName, 
      parentPhone,
      parentEmail, // ✅ NEW: Parent's email for linking
    } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let parentId = null;

    // ✅ If parent email is provided, find or create parent
    if (parentEmail) {
      let parent = await User.findOne({ email: parentEmail });
      
      if (!parent) {
        // Create a parent account
        const parentPassword = await bcrypt.hash('parent123', salt);
        parent = new User({
          name: parentName || 'Parent',
          email: parentEmail,
          password: parentPassword,
          role: 'parent',
          children: [],
        });
        await parent.save();
      }
      
      parentId = parent._id;
    }

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: 'student',
      class: className,
      age,
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      parentId: parentId, // ✅ Link to parent
    };

    const student = new User(userData);
    await student.save();

    // ✅ Add student to parent's children array
    if (parentId) {
      await User.findByIdAndUpdate(parentId, {
        $push: { children: student._id }
      });
    }

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json({
      success: true,
      message: 'Student created successfully!',
      data: studentResponse,
      parentLinked: !!parentId,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists. Please use a different email.'
      });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});
// ✅ Create teacher (Registrar)
router.post('/teachers', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { name, email, password, subject, hireDate } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: 'teacher',
      subject,
      hireDate: hireDate || new Date(),
    };

    const teacher = new User(userData);
    await teacher.save();
    res.status(201).json({ success: true, message: 'Teacher created successfully!', data: teacher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Update student
router.put('/students/:id', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const student = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, message: 'Student updated successfully!', data: student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Delete student
router.delete('/students/:id', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, message: 'Student deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Manage Classes
router.get('/classes', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const classes = await Class.find().populate('teacherIds', 'name').populate('students', 'name');
    res.json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

router.post('/classes', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { name, grade, section, academicYear, teacherIds, subjects } = req.body;
    const classData = new Class({ name, grade, section, academicYear, teacherIds, subjects });
    await classData.save();
    res.status(201).json({ success: true, message: 'Class created successfully!', data: classData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});
// ============================================
// 📌 REGISTRAR ROUTES - Parent Management
// ============================================

// ✅ Get all parents
router.get('/parents', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const parents = await User.find({ role: 'parent' })
      .select('-password')
      .populate('children', 'name email class age')
      .sort({ name: 1 });
    res.json({ success: true, count: parents.length, data: parents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Create parent (Registrar)
router.post('/parents', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if parent already exists
    const existingParent = await User.findOne({ email });
    if (existingParent) {
      return res.status(400).json({
        success: false,
        error: 'Parent email already exists. Please use a different email.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'parent123', salt);

    const parent = new User({
      name,
      email,
      password: hashedPassword,
      role: 'parent',
      phone,
      address,
      children: [],
    });

    await parent.save();

    const parentResponse = parent.toObject();
    delete parentResponse.password;

    res.status(201).json({
      success: true,
      message: 'Parent created successfully!',
      data: parentResponse
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists. Please use a different email.'
      });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Link student to parent
router.put('/parents/:parentId/link/:studentId', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { parentId, studentId } = req.params;

    const parent = await User.findById(parentId);
    if (!parent || parent.role !== 'parent') {
      return res.status(404).json({ success: false, error: 'Parent not found' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Check if already linked
    if (parent.children.includes(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'Student is already linked to this parent'
      });
    }

    // Link parent to student
    await User.findByIdAndUpdate(parentId, {
      $push: { children: studentId }
    });

    // Link student to parent
    await User.findByIdAndUpdate(studentId, {
      parentId: parentId
    });

    res.json({
      success: true,
      message: 'Student linked to parent successfully!',
      data: {
        parent: { id: parent._id, name: parent.name },
        student: { id: student._id, name: student.name }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});



module.exports = router;