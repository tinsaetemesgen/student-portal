// routes/feeRoutes.js - COMPLETE WITH AUTO-ASSIGN

const express = require('express');
const router = express.Router();
const FeeStructure = require('../models/FeeStructure');
const StudentFee = require('../models/StudentFee');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// ============================================
// 📌 HELPER FUNCTIONS
// ============================================

const isFeeOverdue = (fee) => {
  const now = new Date();
  const deadline = new Date(fee.endDate || fee.dueDate);
  deadline.setDate(deadline.getDate() + (fee.gracePeriodDays || 0));
  return now > deadline;
};

// ============================================
// 📌 CREATE FEE WITH AUTO-ASSIGN
// ============================================

router.post('/structures', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      amount, 
      feeType, 
      classLevel, 
      semester, 
      academicYear,
      startDate,
      endDate,
      lateFeeAmount,
      gracePeriodDays,
      autoAssign,
    } = req.body;

    console.log('📥 Creating fee with data:', req.body);

    // ✅ Validate
    if (!name || !amount || !feeType || !classLevel || !semester || !academicYear) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    // ✅ Create fee structure
    const feeStructure = new FeeStructure({
      name,
      description: description || '',
      amount: parseFloat(amount),
      feeType,
      classLevel,
      semester,
      academicYear,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      dueDate: new Date(endDate),
      lateFeeAmount: parseFloat(lateFeeAmount) || 0,
      gracePeriodDays: parseInt(gracePeriodDays) || 0,
      isActive: true,
    });

    await feeStructure.save();

    // ✅ AUTO-ASSIGN if requested
    let assignedCount = 0;
    const assignedStudents = [];

    if (autoAssign) {
      console.log(`🔍 Finding students in class level: ${classLevel}`);
      
      const students = await User.find({
        role: 'student',
        classLevel: classLevel,
      });

      console.log(`👨‍🎓 Found ${students.length} students in ${classLevel}`);

      for (const student of students) {
        const existing = await StudentFee.findOne({
          studentId: student._id,
          feeStructureId: feeStructure._id,
          semester: semester,
          academicYear: academicYear,
        });

        if (existing) {
          console.log(`⏭️ Fee already assigned to ${student.name}`);
          continue;
        }

        const studentFee = new StudentFee({
          studentId: student._id,
          feeStructureId: feeStructure._id,
          amount: parseFloat(amount),
          feeName: name,
          feeType: feeType,
          classLevel: classLevel,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          dueDate: new Date(endDate),
          lateFeeAmount: parseFloat(lateFeeAmount) || 0,
          gracePeriodDays: parseInt(gracePeriodDays) || 0,
          semester: semester,
          academicYear: academicYear,
          status: 'pending',
        });

        await studentFee.save();
        assignedCount++;
        assignedStudents.push(student.name);
      }

      console.log(`✅ Assigned to ${assignedCount} students`);
    }

    res.status(201).json({
      success: true,
      message: `Fee structure created! ${autoAssign ? `Assigned to ${assignedCount} students` : ''}`,
      data: {
        feeStructure,
        assignedCount: autoAssign ? assignedCount : 0,
        autoAssigned: autoAssign || false,
        students: assignedStudents,
      },
    });

  } catch (error) {
    console.error('❌ Error creating fee:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error: ' + error.message 
    });
  }
});

// ============================================
// 📌 GET STUDENT FEES (Parent Dashboard)
// ============================================

router.get('/student-fees', auth, async (req, res) => {
  try {
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    // ✅ Check authorization
    const user = await User.findById(req.user.id);
    
    if (user.role === 'student' && user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own fees'
      });
    }
    
    if (user.role === 'parent') {
      const isChild = user.children.some(child => child.toString() === studentId);
      if (!isChild) {
        return res.status(403).json({
          success: false,
          error: 'You can only view your children\'s fees'
        });
      }
    }

    const studentFees = await StudentFee.find({ studentId })
      .populate('feeStructureId', 'name description feeType')
      .sort({ dueDate: 1 });

    // ✅ Add overdue status
    const feesWithStatus = studentFees.map(fee => {
      const isOverdue = isFeeOverdue(fee);
      return {
        ...fee.toObject(),
        isOverdue,
        totalAmount: fee.amount + (isOverdue ? (fee.lateFeeAmount || 0) : 0),
        isLateFeeApplied: isOverdue && (fee.lateFeeAmount || 0) > 0,
      };
    });

    res.json({
      success: true,
      count: feesWithStatus.length,
      data: feesWithStatus,
    });

  } catch (error) {
    console.error('❌ Error fetching student fees:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 GET ALL FEE STRUCTURES
// ============================================

router.get('/structures', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const feeStructures = await FeeStructure.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: feeStructures.length,
      data: feeStructures,
    });
  } catch (error) {
    console.error('❌ Error fetching fee structures:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;