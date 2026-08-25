// routes/financeRoutes.js - Finance Officer API
//
// Serves the endpoints used by the Finance Officer dashboard, fee structures,
// payment management pages, plus the student/parent-facing fee views.
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FeeStructure = require('../models/FeeStructure');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Finance officer (or admin) only.
const financeGuard = roleCheck('admin', 'finance_officer');
// Anyone signed in can view their own / their children's fee data.
const parentGuard = roleCheck('admin', 'finance_officer', 'parent', 'student');

// ============================================
// 📌 HELPERS
// ============================================

// Expands a StudentFee into the shape the UI expects (with computed totals).
const serializeStudentFee = (sf) => {
  const fee = sf.toObject ? sf.toObject() : sf;
  return {
    ...fee,
    isOverdue: sf.isOverdue(),
    totalAmount: sf.totalAmount(),
    feeName: sf.feeName || 'Unknown Fee',
    dueDate: sf.dueDate || sf.endDate || null,
  };
};

// Payment stats shared by the dashboard, revenue endpoint and actions.
async function computeFinanceStats() {
  const [pendingCount, confirmedAgg, pendingFees, paidCount, totalFeesCount, overdueFees] =
    await Promise.all([
      Payment.countDocuments({ status: 'pending' }),
      Payment.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      StudentFee.find({ status: { $ne: 'paid' } }),
      StudentFee.countDocuments({ status: 'paid' }),
      StudentFee.countDocuments({}),
      StudentFee.find({ status: { $ne: 'paid' } }),
    ]);

  const totalCollected = confirmedAgg[0]?.total || 0;
  const pendingAmount = pendingFees.reduce((sum, f) => sum + f.totalAmount(), 0);
  const overdueAmount = overdueFees
    .filter((f) => f.isOverdue())
    .reduce((sum, f) => sum + f.totalAmount(), 0);
  const collectionRate = totalFeesCount > 0 ? Math.round((paidCount / totalFeesCount) * 100) : 0;

  return {
    pending: pendingCount,
    confirmed: await Payment.countDocuments({ status: 'confirmed' }),
    rejected: await Payment.countDocuments({ status: 'rejected' }),
    totalCollected,
    pendingAmount,
    overdueAmount,
    collectionRate,
    totalFees: totalFeesCount,
    paidFees: paidCount,
    pendingCount,
  };
}

// Verifies the current user is allowed to view the given student's finance data.
async function canAccessStudent(studentId, req) {
  if (req.user.role === 'admin' || req.user.role === 'finance_officer') return true;
  if (req.user.role === 'student') return req.user.id === studentId.toString();
  if (req.user.role === 'parent') {
    const parent = await User.findById(req.user.id);
    return parent && parent.children.some((id) => id.toString() === studentId.toString());
  }
  return false;
}

// ============================================
// 📌 DASHBOARD STATS
// ============================================
router.get('/dashboard/stats', auth, financeGuard, async (req, res) => {
  try {
    const data = await computeFinanceStats();
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 REVENUE OVERVIEW (payment stats for the header cards)
// ============================================
router.get('/revenue', auth, financeGuard, async (req, res) => {
  try {
    const { pending, confirmed, rejected, totalCollected } = await computeFinanceStats();
    res.json({ success: true, data: { pending, confirmed, rejected, totalCollected } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 FEE STRUCTURES
// ============================================

// GET /fee-structures
router.get('/fee-structures', auth, financeGuard, async (req, res) => {
  try {
    const fees = await FeeStructure.find().sort({ createdAt: -1 });
    res.json({ success: true, count: fees.length, data: fees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /fee-structures - create and auto-assign to matching students
router.post('/fee-structures', auth, financeGuard, async (req, res) => {
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

    if (!name || amount === undefined || amount === null || amount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Fee name and a valid amount are required.',
      });
    }

    const structure = await FeeStructure.create({
      name,
      description: description || '',
      amount: Number(amount),
      feeType: feeType || 'tuition',
      classLevel: classLevel || 'secondary',
      semester: semester || 'Semester 1',
      academicYear: academicYear || '2024/25',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      lateFeeAmount: Number(lateFeeAmount) || 0,
      gracePeriodDays: Number(gracePeriodDays) || 0,
      isActive: true,
    });

    // Auto-assign to every student in the matching class level. Class levels
    // map to grades: primary (1-4), middle (5-8), secondary (9-12).
    let assignedCount = 0;
    if (structure.isActive && classLevel) {
      const gradeRange =
        classLevel === 'primary' ? ['1', '2', '3', '4'] :
        classLevel === 'middle' ? ['5', '6', '7', '8'] :
        ['9', '10', '11', '12'];

      const students = await User.find({ role: 'student' });
      const targetStudents = students.filter((s) => {
        const grade = String(s.class || '').replace(/[^\d]/g, '');
        return gradeRange.includes(grade);
      });

      for (const student of targetStudents) {
        const existing = await StudentFee.findOne({
          studentId: student._id,
          feeStructureId: structure._id,
        });
        if (existing) continue;
        await StudentFee.create({
          studentId: student._id,
          feeStructureId: structure._id,
          feeName: structure.name,
          amount: structure.amount,
          lateFeeAmount: structure.lateFeeAmount,
          gracePeriodDays: structure.gracePeriodDays,
          semester: structure.semester,
          academicYear: structure.academicYear,
          startDate: structure.startDate,
          endDate: structure.endDate,
          dueDate: structure.endDate,
        });
        assignedCount += 1;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Fee structure created successfully!',
      data: { ...structure.toObject(), assignedCount },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// PATCH /fee-structures/:id/toggle
router.patch('/fee-structures/:id/toggle', auth, financeGuard, async (req, res) => {
  try {
    const structure = await FeeStructure.findById(req.params.id);
    if (!structure) {
      return res.status(404).json({ success: false, error: 'Fee structure not found' });
    }
    structure.isActive = !structure.isActive;
    await structure.save();
    res.json({ success: true, data: structure });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// DELETE /fee-structures/:id
router.delete('/fee-structures/:id', auth, financeGuard, async (req, res) => {
  try {
    const structure = await FeeStructure.findByIdAndDelete(req.params.id);
    if (!structure) {
      return res.status(404).json({ success: false, error: 'Fee structure not found' });
    }
    // Remove the matching student fees so balances stay consistent.
    await StudentFee.deleteMany({ feeStructureId: req.params.id });
    res.json({ success: true, message: 'Fee structure deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 PAYMENT MANAGEMENT
// ============================================

// GET /payments?status=
router.get('/payments', auth, financeGuard, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const payments = await Payment.find(filter)
      .populate('studentId', 'name email class role parentId')
      .populate('studentFeeId', 'feeName amount')
      .populate('confirmedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// GET /payments/:id
router.get('/payments/:id', auth, financeGuard, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('studentId', 'name email class role parentId')
      .populate('studentFeeId', 'feeName amount')
      .populate('confirmedBy', 'name email');
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// PUT /payments/:id/confirm
router.put('/payments/:id/confirm', auth, financeGuard, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('studentFeeId', 'feeName amount');
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    if (payment.status === 'confirmed') {
      return res.status(400).json({ success: false, error: 'Payment is already confirmed' });
    }

    payment.status = 'confirmed';
    payment.confirmedBy = req.user.id;
    payment.confirmedAt = new Date();
    payment.receiptNumber = `RCP-${Date.now()}`;
    await payment.save();

    // Mark the student fee as paid.
    if (payment.studentFeeId) {
      await StudentFee.findByIdAndUpdate(payment.studentFeeId._id, {
        status: 'paid',
        paidAt: new Date(),
        isLateFeeApplied: false,
      });
    }

    const stats = await computeFinanceStats();
    res.json({ success: true, message: 'Payment confirmed!', data: { payment, stats } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// PUT /payments/:id/reject
router.put('/payments/:id/reject', auth, financeGuard, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    if (payment.status === 'confirmed') {
      return res.status(400).json({ success: false, error: 'Confirmed payments cannot be rejected' });
    }

    payment.status = 'rejected';
    payment.rejectionReason = req.body.reason || 'Payment rejected';
    await payment.save();

    const stats = await computeFinanceStats();
    res.json({ success: true, message: 'Payment rejected', data: { payment, stats } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// GET /payments/:id/receipt - minimal PDF receipt for download
router.get('/payments/:id/receipt', auth, financeGuard, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('studentId', 'name email class')
      .populate('studentFeeId', 'feeName amount');
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    const receipt = buildReceiptPdf(payment);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="receipt-${payment._id}.pdf"`
    );
    res.send(receipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 STUDENT / PARENT FACING VIEWS
// ============================================

// GET /parent/student-fees?studentId=
router.get('/parent/student-fees', auth, parentGuard, async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'studentId is required' });
    }
    if (!(await canAccessStudent(studentId, req))) {
      return res.status(403).json({ success: false, error: 'You do not have access to this student' });
    }

    const fees = await StudentFee.find({ studentId })
      .populate('feeStructureId', 'name feeType amount')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: fees.length,
      data: fees.map(serializeStudentFee),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// GET /parent/payments?studentId=
router.get('/parent/payments', auth, parentGuard, async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'studentId is required' });
    }
    if (!(await canAccessStudent(studentId, req))) {
      return res.status(403).json({ success: false, error: 'You do not have access to this student' });
    }

    const payments = await Payment.find({ studentId })
      .populate('studentId', 'name email class role')
      .populate('studentFeeId', 'feeName amount')
      .populate('confirmedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ============================================
// 📌 RECEIPT PDF BUILDER (minimal, dependency-free)
// ============================================

function buildReceiptPdf(payment) {
  const schoolName = 'Elevate skills';
  const lines = [
    `${schoolName} - Official Payment Receipt`,
    `Receipt: ${payment.receiptNumber || payment._id}`,
    `Student: ${payment.paidFor || payment.studentId?.name || 'N/A'}`,
    `Fee: ${payment.studentFeeId?.feeName || 'N/A'}`,
    `Amount: ${payment.amount} ETB`,
    `Bank: ${payment.bankName || 'N/A'}`,
    `Reference: ${payment.referenceNumber || 'N/A'}`,
    `Status: ${payment.status.toUpperCase()}`,
    `Confirmed: ${payment.confirmedAt ? new Date(payment.confirmedAt).toLocaleDateString() : 'N/A'}`,
    `Date: ${new Date().toLocaleDateString()}`,
  ];

  const esc = (text) =>
    String(text || '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[^\x20-\x7E]/g, '');

  const content = lines.map((line) => `BT /F1 12 Tf 72 ${720 - lines.indexOf(line) * 24} Td (${esc(line)}) Tj ET`).join('\n');

  const objects = [
    '<</Type /Catalog /Pages 2 0 R>>',
    '<</Type /Pages /Kids [3 0 R] /Count 1>>',
    '<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources <</Font <</F1 4 0 R>>>> /Contents 5 0 R>>',
    '<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>',
    `<</Length ${Buffer.byteLength(content)}>>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<</Size ${objects.length + 1} /Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
}

module.exports = router;
