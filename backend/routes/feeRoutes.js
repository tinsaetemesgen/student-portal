// routes/feeRoutes.js - Complete Fee Management (Routes + Business Logic)
const express = require('express');
const router = express.Router();
const FeeStructure = require('../models/FeeStructure');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
//  ADMIN ROUTES - Fee Structure Management
//  CREATE FEE STRUCTURE (Admin only)
router.post('/structures', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      amount, 
      feeType, 
      classLevel, 
      semester, 
      academicYear, 
      dueDate 
    } = req.body;

    // Validate class level
    const validClassLevels = ['primary', 'middle', 'secondary'];
    if (!validClassLevels.includes(classLevel)) {
      return res.status(400).json({
        success: false,
        error: `Invalid class level. Must be one of: ${validClassLevels.join(', ')}`
      });
    }

    // Validate fee type
    const validFeeTypes = ['tuition', 'registration', 'activity', 'library', 'lab', 'sports', 'other'];
    if (!validFeeTypes.includes(feeType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid fee type. Must be one of: ${validFeeTypes.join(', ')}`
      });
    }

    const feeStructure = new FeeStructure({
      name,
      description,
      amount,
      feeType,
      classLevel,
      semester,
      academicYear,
      dueDate,
      // ✅ Add manual timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await feeStructure.save();

    res.status(201).json({
      success: true,
      message: 'Fee structure created successfully!',
      data: feeStructure,
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

//  GET ALL FEE STRUCTURES (Admin only)
router.get('/structures', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { classLevel, isActive } = req.query;
    const filter = {};
    
    if (classLevel) filter.classLevel = classLevel;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const feeStructures = await FeeStructure.find(filter)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feeStructures.length,
      data: feeStructures,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  UPDATE FEE STRUCTURE (Admin only)
router.put('/structures/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const feeStructure = await FeeStructure.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!feeStructure) {
      return res.status(404).json({ success: false, error: 'Fee structure not found' });
    }

    res.json({
      success: true,
      message: 'Fee structure updated successfully!',
      data: feeStructure,
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

//  DELETE FEE STRUCTURE (Admin only)
router.delete('/structures/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any students are assigned this fee
    const assignedFees = await StudentFee.findOne({ feeStructureId: id });
    if (assignedFees) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete: This fee is already assigned to students',
      });
    }

    const feeStructure = await FeeStructure.findByIdAndDelete(id);
    
    if (!feeStructure) {
      return res.status(404).json({ success: false, error: 'Fee structure not found' });
    }

    res.json({
      success: true,
      message: 'Fee structure deleted successfully!',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  ADMIN ROUTES - Assign Fees to Students
//  ASSIGN FEES TO STUDENTS (Admin only)
router.post('/assign', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { feeStructureId, studentIds } = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one student ID',
      });
    }

    // Get fee structure
    const feeStructure = await FeeStructure.findById(feeStructureId);
    if (!feeStructure) {
      return res.status(404).json({ success: false, error: 'Fee structure not found' });
    }

    // Check if fee is active
    if (!feeStructure.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Cannot assign: Fee structure is inactive',
      });
    }

    const results = {
      successful: [],
      failed: [],
    };

    for (const studentId of studentIds) {
      try {
        // Check if student exists and is a student
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
          results.failed.push({ 
            studentId, 
            reason: 'Student not found or not a student' 
          });
          continue;
        }

        // Check if fee already assigned to this student
        const existingAssignment = await StudentFee.findOne({
          studentId,
          feeStructureId,
          semester: feeStructure.semester,
          academicYear: feeStructure.academicYear,
        });

        if (existingAssignment) {
          results.failed.push({ 
            studentId, 
            reason: 'Fee already assigned' 
          });
          continue;
        }

        // Create student fee assignment
        const studentFee = new StudentFee({
          studentId,
          feeStructureId,
          amount: feeStructure.amount,
          feeName: feeStructure.name,
          feeType: feeStructure.feeType,
          dueDate: feeStructure.dueDate,
          semester: feeStructure.semester,
          academicYear: feeStructure.academicYear,
          status: 'pending',
        });

        await studentFee.save();
        results.successful.push({ studentId, studentFee });
      } catch (error) {
        results.failed.push({ 
          studentId, 
          reason: error.message 
        });
      }
    }

    res.json({
      success: true,
      message: `Assigned to ${results.successful.length} student(s)`,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// GET ALL STUDENT FEES (Admin only)
router.get('/student-fees', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { status, classLevel, academicYear } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;

    const studentFees = await StudentFee.find(filter)
      .populate('studentId', 'name email class')
      .populate('feeStructureId', 'name amount feeType')
      .sort({ createdAt: -1 });

    // If classLevel is provided, filter the populated data
    let filteredData = studentFees;
    if (classLevel) {
      // Get all students with this class level
      const students = await User.find({ 
        role: 'student',
        class: { $regex: new RegExp(`^Grade ${classLevel}`, 'i') }
      });
      const studentIds = students.map(s => s._id.toString());
      filteredData = studentFees.filter(fee => 
        studentIds.includes(fee.studentId._id.toString())
      );
    }

    res.json({
      success: true,
      count: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  PAYMENT ROUTES (Parents & Students)
//  MAKE PAYMENT (Student or Parent)
router.post('/payments', auth, async (req, res) => {
  try {
    const { 
      studentFeeId, 
      method, 
      bankName, 
      referenceNumber, 
      telebirNumber, 
      telebirName,
      notes 
    } = req.body;

    // Get the student fee assignment
    const studentFee = await StudentFee.findById(studentFeeId);
    if (!studentFee) {
      return res.status(404).json({ success: false, error: 'Fee record not found' });
    }

    // Check if already paid
    if (studentFee.status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'This fee has already been paid',
      });
    }

    // Check if user is authorized (student themselves or parent of student)
    const userId = req.user.id;
    const user = await User.findById(userId);
    const isStudent = user.role === 'student' && user._id.toString() === studentFee.studentId.toString();
    const isParent = user.role === 'parent' && user.children.includes(studentFee.studentId);

    if (!isStudent && !isParent) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to pay this fee',
      });
    }

    // Create payment
    const payment = new Payment({
      studentFeeId,
      studentId: studentFee.studentId,
      amount: studentFee.amount,
      method,
      bankName,
      referenceNumber,
      telebirNumber,
      telebirName,
      notes,
      status: 'pending', // Always starts as pending
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully! Awaiting admin confirmation.',
      data: payment,
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

//  CONFIRM PAYMENT (Admin only)
router.put('/payments/:id/confirm', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    if (payment.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        error: 'Payment already confirmed',
      });
    }

    // Update payment
    payment.status = 'confirmed';
    payment.confirmedBy = req.user.id;
    payment.confirmedAt = new Date();
    if (notes) payment.notes = notes;

    // Generate receipt number (auto-generated in pre-save)
    await payment.save();

    // Update student fee status
    const studentFee = await StudentFee.findById(payment.studentFeeId);
    if (studentFee) {
      studentFee.status = 'paid';
      studentFee.paidAt = new Date();
      await studentFee.save();
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully!',
      data: payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  GET PAYMENT HISTORY (Student or Parent)
router.get('/payments/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    let studentIds = [];
    if (user.role === 'student') {
      studentIds = [userId];
    } else if (user.role === 'parent') {
      studentIds = user.children;
    } else {
      return res.status(403).json({
        success: false,
        error: 'Only students and parents can view payment history',
      });
    }

    const payments = await Payment.find({
      studentId: { $in: studentIds },
    })
      .populate('studentId', 'name email class')
      .populate('studentFeeId', 'feeName amount')
      .populate('confirmedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  STUDENT & PARENT ROUTES - View Fees
// GET MY FEES (Student)
router.get('/my-fees', auth, roleCheck('student'), async (req, res) => {
  try {
    const studentId = req.user.id;

    const studentFees = await StudentFee.find({ studentId })
      .populate('feeStructureId', 'name description feeType')
      .sort({ dueDate: 1 });

    // Calculate totals
    const totalDue = studentFees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPaid = studentFees
      .filter(fee => fee.status === 'paid')
      .reduce((sum, fee) => sum + fee.amount, 0);
    const balance = totalDue - totalPaid;

    res.json({
      success: true,
      data: {
        summary: {
          totalDue,
          totalPaid,
          balance,
        },
        fees: studentFees,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});
// ============================================
// 📌 STUDENT ROUTE - VIEW ONLY FEE STATUS (No Amounts)
// ============================================

// ✅ GET MY FEE STATUS (Student only - NO amounts visible)
router.get('/my-fees/status', auth, roleCheck('student'), async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1️⃣ Find all fees assigned to this student
    const studentFees = await StudentFee.find({ studentId })
      .populate('feeStructureId', 'name') // Only get the fee name from the structure
      .sort({ dueDate: 1 });

    // 2️⃣ Format the response: ONLY status, NO amounts
    const statusData = studentFees.map(fee => {
      // Determine status display text
      let statusText = 'Pending';
      let statusColor = 'yellow';
      
      if (fee.status === 'paid') {
        statusText = 'Paid';
        statusColor = 'green';
      } else if (fee.status === 'overdue') {
        statusText = 'Overdue';
        statusColor = 'red';
      }

      return {
        feeName: fee.feeName || fee.feeStructureId?.name || 'Unknown Fee',
        status: fee.status,
        statusText: statusText,
        statusColor: statusColor,
        dueDate: fee.dueDate,
        // ❌ WE DELIBERATELY EXCLUDE: amount, feeStructureId, etc.
      };
    });

    // 3️⃣ Calculate overall summary (still NO amounts)
    const totalFees = studentFees.length;
    const paidCount = studentFees.filter(f => f.status === 'paid').length;
    const pendingCount = studentFees.filter(f => f.status === 'pending').length;
    const overdueCount = studentFees.filter(f => f.status === 'overdue').length;

    res.json({
      success: true,
      data: {
        summary: {
          totalFees,
          paid: paidCount,
          pending: pendingCount,
          overdue: overdueCount,
        },
        fees: statusData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


//  GET MY CHILDREN'S FEES (Parent)
router.get('/my-children', auth, roleCheck('parent'), async (req, res) => {
  try {
    const parentId = req.user.id;
    const parent = await User.findById(parentId);

    if (!parent.children || parent.children.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No children linked to this parent',
      });
    }

    const childrenData = [];
    for (const childId of parent.children) {
      const child = await User.findById(childId);
      const studentFees = await StudentFee.find({ studentId: childId })
        .populate('feeStructureId', 'name description feeType')
        .sort({ dueDate: 1 });

      const totalDue = studentFees.reduce((sum, fee) => sum + fee.amount, 0);
      const totalPaid = studentFees
        .filter(fee => fee.status === 'paid')
        .reduce((sum, fee) => sum + fee.amount, 0);
      const balance = totalDue - totalPaid;

      childrenData.push({
        child: {
          _id: child._id,
          name: child.name,
          email: child.email,
          class: child.class,
        },
        summary: {
          totalDue,
          totalPaid,
          balance,
        },
        fees: studentFees,
      });
    }

    res.json({
      success: true,
      data: childrenData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  GET OUTSTANDING BALANCE (Student or Parent)
router.get('/balance', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    let studentIds = [];
    if (user.role === 'student') {
      studentIds = [userId];
    } else if (user.role === 'parent') {
      studentIds = user.children;
    } else {
      return res.status(403).json({
        success: false,
        error: 'Only students and parents can view balance',
      });
    }

    let totalBalance = 0;
    const studentBalances = [];

    for (const studentId of studentIds) {
      const student = await User.findById(studentId);
      const studentFees = await StudentFee.find({ studentId });

      const totalDue = studentFees.reduce((sum, fee) => sum + fee.amount, 0);
      const totalPaid = studentFees
        .filter(fee => fee.status === 'paid')
        .reduce((sum, fee) => sum + fee.amount, 0);
      const balance = totalDue - totalPaid;

      totalBalance += balance;
      studentBalances.push({
        student: {
          _id: student._id,
          name: student.name,
          class: student.class,
        },
        balance,
        totalDue,
        totalPaid,
      });
    }

    res.json({
      success: true,
      data: {
        overallBalance: totalBalance,
        students: studentBalances,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ADMIN ROUTES - Reports & Analytics


//  GET PAYMENT SUMMARY (Admin only)
router.get('/reports/summary', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { academicYear, classLevel } = req.query;

    const filter = {};
    if (academicYear) filter.academicYear = academicYear;

    // Get all student fees with filters
    let studentFees = await StudentFee.find(filter)
      .populate('studentId', 'name class');

    // Filter by class level if provided
    if (classLevel) {
      const students = await User.find({ 
        role: 'student',
        class: { $regex: new RegExp(`^Grade ${classLevel}`, 'i') }
      });
      const studentIds = students.map(s => s._id.toString());
      studentFees = studentFees.filter(fee => 
        studentIds.includes(fee.studentId._id.toString())
      );
    }

    const totalFees = studentFees.length;
    const totalAmount = studentFees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidFees = studentFees.filter(fee => fee.status === 'paid');
    const pendingFees = studentFees.filter(fee => fee.status === 'pending');
    const overdueFees = studentFees.filter(fee => fee.status === 'overdue');

    const paidAmount = paidFees.reduce((sum, fee) => sum + fee.amount, 0);
    const pendingAmount = pendingFees.reduce((sum, fee) => sum + fee.amount, 0);
    const overdueAmount = overdueFees.reduce((sum, fee) => sum + fee.amount, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalFees,
          totalAmount,
          paid: {
            count: paidFees.length,
            amount: paidAmount,
          },
          pending: {
            count: pendingFees.length,
            amount: pendingAmount,
          },
          overdue: {
            count: overdueFees.length,
            amount: overdueAmount,
          },
        },
        // Group by fee type
        byType: studentFees.reduce((acc, fee) => {
          const type = fee.feeType;
          if (!acc[type]) {
            acc[type] = { count: 0, total: 0, paid: 0, pending: 0, overdue: 0 };
          }
          acc[type].count++;
          acc[type].total += fee.amount;
          if (fee.status === 'paid') acc[type].paid += fee.amount;
          else if (fee.status === 'pending') acc[type].pending += fee.amount;
          else if (fee.status === 'overdue') acc[type].overdue += fee.amount;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;