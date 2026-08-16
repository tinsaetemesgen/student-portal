// routes/passwordResetRoutes.js - Password reset requests handled by the registrar
const express = require('express');
const router = express.Router();
const PasswordResetRequest = require('../models/PasswordResetRequest');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// ✅ POST /api/password-reset/request - Public: student/parent asks for a reset
router.post('/request', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with that email' });
    }

    // Keep pending requests to one per user to avoid spam.
    await PasswordResetRequest.updateMany(
      { userId: user._id, status: 'pending' },
      { status: 'cancelled', notes: 'Superseded by a newer request' }
    );

    const request = await PasswordResetRequest.create({
      userId: user._id,
      email: user.email,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Password reset request submitted. The registrar will review it.',
      data: { requestId: request._id },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET /api/password-reset/all - List all requests (admin/registrar)
router.get('/all', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const requests = await PasswordResetRequest.find()
      .populate('userId', 'name email role')
      .populate('resolvedBy', 'name email role')
      .sort({ requestedAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ POST /api/password-reset/:id/reset - Reset the user's password (admin/registrar)
router.post('/:id/reset', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const { newPassword, notes } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters',
      });
    }

    const request = await PasswordResetRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Only pending requests can be resolved',
      });
    }

    const user = await User.findById(request.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    request.status = 'resolved';
    request.resolvedBy = req.user.id;
    request.resolvedAt = new Date();
    request.notes = notes || '';
    await request.save();

    res.json({
      success: true,
      message: `Password reset for ${user.name}. They must log in with the new password.`,
      data: request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ PUT /api/password-reset/:id/cancel - Cancel a pending request (admin/registrar)
router.put('/:id/cancel', auth, roleCheck('admin', 'registrar'), async (req, res) => {
  try {
    const request = await PasswordResetRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Only pending requests can be cancelled',
      });
    }

    request.status = 'cancelled';
    request.resolvedBy = req.user.id;
    request.resolvedAt = new Date();
    request.notes = req.body.reason || 'Cancelled by registrar';
    await request.save();

    res.json({ success: true, message: 'Request cancelled successfully!', data: request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
