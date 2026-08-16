// routes/paymentsRoutes.js - Public-facing payment submissions (students/parents)
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const User = require('../models/User');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'payments');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `payment-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG or WEBP images are allowed'));
  },
});

// ============================================
// 📌 SUBMIT A PAYMENT (student or parent)
// ============================================
router.post(
  '/submit',
  auth,
  roleCheck('parent', 'student', 'admin'),
  upload.single('screenshot'),
  async (req, res) => {
    try {
      const { studentFeeId, bankName, referenceNumber, amount, paymentDate, notes } = req.body;

      if (!studentFeeId) {
        return res.status(400).json({ success: false, error: 'A fee must be selected' });
      }

      const studentFee = await StudentFee.findById(studentFeeId);
      if (!studentFee) {
        return res.status(404).json({ success: false, error: 'Fee not found' });
      }

      // Authorization: only the fee's student, the student's parent, or an admin.
      if (req.user.role === 'student' && req.user.id !== studentFee.studentId.toString()) {
        return res.status(403).json({ success: false, error: 'You cannot pay for another student' });
      }
      if (req.user.role === 'parent') {
        const parent = await User.findById(req.user.id);
        const isChild = parent && parent.children.some(
          (id) => id.toString() === studentFee.studentId.toString()
        );
        if (!isChild) {
          return res.status(403).json({ success: false, error: 'You do not have access to this student' });
        }
      }

      const student = await User.findById(studentFee.studentId);
      const submitter = await User.findById(req.user.id);

      const payment = await Payment.create({
        studentId: studentFee.studentId,
        studentFeeId: studentFee._id,
        amount: amount ? Number(amount) : studentFee.totalAmount(),
        bankName: bankName || '',
        referenceNumber: referenceNumber || '',
        screenshotUrl: req.file ? `/uploads/payments/${req.file.filename}` : '',
        status: 'pending',
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes: notes || '',
        paidBy: submitter.name,
        paidFor: student ? student.name : studentFee.studentId.toString(),
      });

      res.status(201).json({ success: true, message: 'Payment submitted successfully!', data: payment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
);

module.exports = router;
