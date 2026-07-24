// routes/financeOfficerRoutes.js
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
// 📌 FINANCE OFFICER ROUTES - Fee Management
// ============================================

// ✅ Create Fee Structure
router.post('/fee-structures', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { name, description, amount, feeType, classLevel, semester, academicYear, dueDate } = req.body;
    const feeStructure = new FeeStructure({
      name,
      description,
      amount,
      feeType,
      classLevel,
      semester,
      academicYear,
      dueDate,
    });
    await feeStructure.save();
    res.status(201).json({ success: true, message: 'Fee structure created!', data: feeStructure });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Get all fee structures
router.get('/fee-structures', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const feeStructures = await FeeStructure.find().sort({ createdAt: -1 });
    res.json({ success: true, count: feeStructures.length, data: feeStructures });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Get all student fees
router.get('/student-fees', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const studentFees = await StudentFee.find()
      .populate('studentId', 'name email class')
      .populate('feeStructureId', 'name amount')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: studentFees.length, data: studentFees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Assign fees to students
router.post('/assign-fees', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { feeStructureId, studentIds } = req.body;
    
    const feeStructure = await FeeStructure.findById(feeStructureId);
    if (!feeStructure) {
      return res.status(404).json({ success: false, error: 'Fee structure not found' });
    }

    const results = { successful: [], failed: [] };
    for (const studentId of studentIds) {
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        results.failed.push({ studentId, reason: 'Student not found' });
        continue;
      }

      const existing = await StudentFee.findOne({ studentId, feeStructureId });
      if (existing) {
        results.failed.push({ studentId, reason: 'Fee already assigned' });
        continue;
      }

      const studentFee = new StudentFee({
        studentId,
        feeStructureId,
        amount: feeStructure.amount,
        feeName: feeStructure.name,
        feeType: feeStructure.feeType,
        dueDate: feeStructure.dueDate,
        semester: feeStructure.semester,
        academicYear: feeStructure.academicYear,
      });
      await studentFee.save();
      results.successful.push({ studentId });
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

// ============================================
// 📌 FINANCE OFFICER ROUTES - Payment Processing
// ============================================

// ✅ Get all payments (including pending)
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
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Confirm Payment
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

    payment.status = 'confirmed';
    payment.confirmedBy = req.user.id;
    payment.confirmedAt = new Date();
    if (notes) payment.notes = notes;
    await payment.save();

    const studentFee = await StudentFee.findById(payment.studentFeeId);
    if (studentFee) {
      studentFee.status = 'paid';
      studentFee.paidAt = new Date();
      await studentFee.save();
    }

    res.json({ success: true, message: 'Payment confirmed!', data: payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Reject Payment
router.put('/payments/:id/reject', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Payment already processed' });
    }

    payment.status = 'failed';
    payment.notes = reason || 'Payment rejected';
    await payment.save();

    res.json({ success: true, message: 'Payment rejected!', data: payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 FINANCE OFFICER ROUTES - Revenue & Reports
// ============================================

// ✅ Get revenue summary
router.get('/revenue', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const totalCollected = await Payment.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
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
        totalPending: totalPending[0]?.total || 0,
        totalOverdue: totalOverdue[0]?.total || 0,
        paidStudents: totalPaidStudents.length,
        totalStudents,
        collectionRate: totalStudents > 0 ? Math.round((totalPaidStudents.length / totalStudents) * 100) : 0,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ Get payment history
router.get('/payment-history', auth, roleCheck('admin', 'finance_officer'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { status: 'confirmed' };
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const payments = await Payment.find(filter)
      .populate('studentId', 'name email class')
      .populate('confirmedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});



module.exports = router;