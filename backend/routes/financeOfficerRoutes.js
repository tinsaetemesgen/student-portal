// routes/financeOfficerRoutes.js - COMPLETE UPDATE
// Replaces the entire file with new fields support

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FeeStructure = require('../models/FeeStructure');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const bcrypt = require('bcryptjs');

// ============================================
// 📌 HELPER FUNCTIONS
// ============================================

// Check if a fee is overdue
const isFeeOverdue = (fee) => {
  const now = new Date();
  const deadline = new Date(fee.endDate || fee.dueDate);
  deadline.setDate(deadline.getDate() + (fee.gracePeriodDays || 0));
  return now > deadline;
};

// Calculate total amount with late fee
const calculateTotalAmount = (fee) => {
  let total = fee.amount || 0;
  if (isFeeOverdue(fee)) {
    total += (fee.lateFeeAmount || 0);
  }
  return total;
};

// ============================================
// 📌 FINANCE OFFICER ROUTES - Fee Management
// ============================================

// ✅ CREATE FEE STRUCTURE - UPDATED with new fields
router.post('/fee-structures', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
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
    } = req.body;

    // ✅ Log incoming data for debugging
    console.log('📥 Creating fee with data:', req.body);

    // ✅ Validate required fields
    if (!name || !amount || !feeType || !classLevel || !semester || !academicYear) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: name, amount, feeType, classLevel, semester, academicYear'
      });
    }

    // ✅ Validate new date fields
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    // ✅ Validate date logic
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    // ✅ Create fee structure with ALL fields
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
      lateFeeAmount: parseFloat(lateFeeAmount) || 0,
      gracePeriodDays: parseInt(gracePeriodDays) || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await feeStructure.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Fee structure created successfully!', 
      data: feeStructure 
    });
  } catch (error) {
    console.error('❌ Error creating fee:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, errors });
    }
    
    res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
  }
});

// ✅ GET ALL FEE STRUCTURES - UPDATED (returns new fields automatically)
router.get('/fee-structures', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { classLevel, isActive } = req.query;
    const filter = {};
    
    if (classLevel) filter.classLevel = classLevel;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const feeStructures = await FeeStructure.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: feeStructures.length, data: feeStructures });
  } catch (error) {
    console.error('❌ Error fetching fees:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET SINGLE FEE STRUCTURE - NEW ROUTE
router.get('/fee-structures/:id', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const feeStructure = await FeeStructure.findById(id);
    
    if (!feeStructure) {
      return res.status(404).json({ success: false, error: 'Fee structure not found' });
    }
    
    res.json({ success: true, data: feeStructure });
  } catch (error) {
    console.error('❌ Error fetching fee:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ UPDATE FEE STRUCTURE - UPDATED with new fields
router.put('/fee-structures/:id', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { id } = req.params;
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
      isActive,
    } = req.body;

    // ✅ Build update object
    const updateData = {
      name,
      description: description || '',
      amount: parseFloat(amount),
      feeType,
      classLevel,
      semester,
      academicYear,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      lateFeeAmount: parseFloat(lateFeeAmount) || 0,
      gracePeriodDays: parseInt(gracePeriodDays) || 0,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date(),
    };

    // ✅ Validate date logic
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    const feeStructure = await FeeStructure.findByIdAndUpdate(
      id,
      updateData,
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
    console.error('❌ Error updating fee:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, errors });
    }
    
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ DELETE FEE STRUCTURE
router.delete('/fee-structures/:id', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
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
    console.error('❌ Error deleting fee:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ TOGGLE FEE ACTIVE STATUS - NEW ROUTE
router.patch('/fee-structures/:id/toggle', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const feeStructure = await FeeStructure.findById(id);
    if (!feeStructure) {
      return res.status(404).json({ success: false, error: 'Fee structure not found' });
    }

    feeStructure.isActive = !feeStructure.isActive;
    feeStructure.updatedAt = new Date();
    await feeStructure.save();

    res.json({
      success: true,
      message: `Fee ${feeStructure.isActive ? 'activated' : 'deactivated'} successfully!`,
      data: feeStructure,
    });
  } catch (error) {
    console.error('❌ Error toggling fee:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 FINANCE OFFICER ROUTES - Assign Fees
// ============================================

// ✅ ASSIGN FEES TO STUDENTS - UPDATED with new fields
router.post('/assign-fees', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { feeStructureId, studentIds } = req.body;
    
    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one student ID',
      });
    }

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

    const results = { successful: [], failed: [] };
    
    for (const studentId of studentIds) {
      try {
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
          results.failed.push({ studentId, reason: 'Student not found or not a student' });
          continue;
        }

        const existing = await StudentFee.findOne({ 
          studentId, 
          feeStructureId,
          semester: feeStructure.semester,
          academicYear: feeStructure.academicYear,
        });
        
        if (existing) {
          results.failed.push({ studentId, reason: 'Fee already assigned' });
          continue;
        }

        // ✅ Create student fee with ALL fields
        const studentFee = new StudentFee({
          studentId,
          feeStructureId,
          amount: feeStructure.amount,
          feeName: feeStructure.name,
          feeType: feeStructure.feeType,
          startDate: feeStructure.startDate,
          endDate: feeStructure.endDate,
          dueDate: feeStructure.endDate, // Keep for backward compatibility
          lateFeeAmount: feeStructure.lateFeeAmount,
          gracePeriodDays: feeStructure.gracePeriodDays,
          semester: feeStructure.semester,
          academicYear: feeStructure.academicYear,
          classLevel: feeStructure.classLevel,
          status: 'pending',
        });
        
        await studentFee.save();
        results.successful.push({ 
          studentId, 
          studentName: student.name,
          studentFee: studentFee._id,
        });
      } catch (error) {
        results.failed.push({ studentId, reason: error.message });
      }
    }

    res.json({
      success: true,
      message: `Assigned to ${results.successful.length} student(s)`,
      data: results,
    });
  } catch (error) {
    console.error('❌ Error assigning fees:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET ALL STUDENT FEES - UPDATED with population
router.get('/student-fees', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { status, classLevel, academicYear } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;

    let studentFees = await StudentFee.find(filter)
      .populate('studentId', 'name email class')
      .populate('feeStructureId', 'name amount feeType startDate endDate lateFeeAmount gracePeriodDays')
      .sort({ createdAt: -1 });

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

    res.json({ success: true, count: studentFees.length, data: studentFees });
  } catch (error) {
    console.error('❌ Error fetching student fees:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET STUDENT FEE DETAIL - NEW ROUTE
router.get('/student-fees/:id', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const studentFee = await StudentFee.findById(id)
      .populate('studentId', 'name email class')
      .populate('feeStructureId', 'name amount feeType startDate endDate lateFeeAmount gracePeriodDays');

    if (!studentFee) {
      return res.status(404).json({ success: false, error: 'Student fee record not found' });
    }

    const isOverdue = isFeeOverdue(studentFee);
    const totalAmount = calculateTotalAmount(studentFee);

    res.json({
      success: true,
      data: {
        ...studentFee.toObject(),
        isOverdue,
        totalAmount,
        isLateFeeApplied: isOverdue && studentFee.lateFeeAmount > 0,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching student fee:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 FINANCE OFFICER ROUTES - Payment Processing
// ============================================

// ✅ GET ALL PAYMENTS - UPDATED
router.get('/payments', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('studentId', 'name email class')
      .populate('studentFeeId', 'feeName amount')
      .populate('confirmedBy', 'name')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET PENDING PAYMENTS - NEW ROUTE
router.get('/payments/pending', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('studentId', 'name email')
      .populate('studentFeeId', 'feeName amount')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error('❌ Error fetching pending payments:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ CONFIRM PAYMENT - UPDATED with receipt generation
router.put('/payments/:id/confirm', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    
    if (payment.status === 'confirmed') {
      return res.status(400).json({ success: false, error: 'Payment already confirmed' });
    }

    // Update payment
    payment.status = 'confirmed';
    payment.confirmedBy = req.user.id;
    payment.confirmedAt = new Date();
    if (notes) payment.notes = notes;

    // Generate receipt number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    payment.receiptNumber = `REC-${year}${month}${day}-${random}`;

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
      message: 'Payment confirmed!', 
      data: payment 
    });
  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ REJECT PAYMENT - UPDATED
router.put('/payments/:id/reject', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    
    if (payment.status === 'confirmed') {
      return res.status(400).json({ success: false, error: 'Cannot reject a confirmed payment' });
    }

    payment.status = 'rejected';
    payment.rejectionReason = reason || 'Payment rejected';
    await payment.save();

    res.json({ 
      success: true, 
      message: 'Payment rejected!', 
      data: payment 
    });
  } catch (error) {
    console.error('❌ Error rejecting payment:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 FINANCE OFFICER ROUTES - Revenue & Reports
// ============================================

// ✅ GET REVENUE SUMMARY - UPDATED with late fees
router.get('/revenue', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const totalCollected = await Payment.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalLateFees = await Payment.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$lateFee' } } }
    ]);

    const totalPending = await Payment.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalOverdue = await StudentFee.aggregate([
      { $match: { status: 'overdue' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPaidStudents = await StudentFee.distinct('studentId', { status: 'paid' });
    const totalStudents = await User.countDocuments({ role: 'student' });

    res.json({
      success: true,
      data: {
        totalCollected: totalCollected[0]?.total || 0,
        totalLateFees: totalLateFees[0]?.total || 0,
        totalPending: totalPending[0]?.total || 0,
        totalOverdue: totalOverdue[0]?.total || 0,
        paidStudents: totalPaidStudents.length,
        totalStudents,
        collectionRate: totalStudents > 0 ? Math.round((totalPaidStudents.length / totalStudents) * 100) : 0,
      }
    });
  } catch (error) {
    console.error('❌ Error fetching revenue:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET PAYMENT HISTORY - UPDATED
router.get('/payment-history', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { status: 'confirmed' };
    
    if (startDate && endDate) {
      filter.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const payments = await Payment.find(filter)
      .populate('studentId', 'name email class')
      .populate('studentFeeId', 'feeName amount')
      .populate('confirmedBy', 'name')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error('❌ Error fetching payment history:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET OVERDUE FEES REPORT - NEW ROUTE
router.get('/reports/overdue', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const studentFees = await StudentFee.find({ status: { $ne: 'paid' } })
      .populate('studentId', 'name email class')
      .populate('feeStructureId', 'name');

    const overdueFees = studentFees.filter(fee => isFeeOverdue(fee));

    const totalOverdue = overdueFees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalLateFees = overdueFees.reduce((sum, fee) => sum + (fee.lateFeeAmount || 0), 0);

    res.json({
      success: true,
      data: {
        count: overdueFees.length,
        totalOverdue,
        totalLateFees,
        totalWithLateFees: totalOverdue + totalLateFees,
        fees: overdueFees.map(fee => ({
          ...fee.toObject(),
          daysOverdue: Math.floor((new Date() - new Date(fee.endDate || fee.dueDate)) / (1000 * 60 * 60 * 24)),
          totalAmount: fee.amount + (isFeeOverdue(fee) ? (fee.lateFeeAmount || 0) : 0),
        })),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching overdue fees:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET FINANCE DASHBOARD STATS - NEW ROUTE
router.get('/dashboard/stats', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const allFees = await StudentFee.find();
    
    let totalDue = 0;
    let totalCollected = 0;
    let totalLateFees = 0;
    let overdueCount = 0;
    let pendingCount = 0;

    for (const fee of allFees) {
      if (fee.status === 'paid') {
        totalCollected += fee.amount;
      } else {
        totalDue += fee.amount;
        pendingCount++;
        
        if (isFeeOverdue(fee)) {
          overdueCount++;
          totalLateFees += (fee.lateFeeAmount || 0);
        }
      }
    }

    const totalFees = allFees.length;
    const paidCount = totalFees - pendingCount;

    const recentPayments = await Payment.find({ status: 'confirmed' })
      .populate('studentId', 'name')
      .populate('studentFeeId', 'feeName')
      .sort({ confirmedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        summary: {
          totalFees,
          totalDue,
          totalCollected,
          totalLateFees,
          outstandingBalance: totalDue + totalLateFees,
          paidCount,
          pendingCount,
          overdueCount,
          collectionRate: totalFees > 0 ? (totalCollected / (totalFees * (totalDue / totalFees || 1))) * 100 : 0,
        },
        recentPayments,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;