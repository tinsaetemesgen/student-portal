// routes/authRoutes.js - Authentication routes (login/register)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//  REGISTER - Create a new user


router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      class: className,
      age,
      parentName,
      parentPhone,
      subject,
      hireDate
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered. Please use a different email.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Build user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'student', // Default to student if not provided
    };

    // Add role-specific fields
    if (userData.role === 'student') {
      userData.class = className;
      if (age) userData.age = age;
      if (parentName) userData.parentName = parentName;
      if (parentPhone) userData.parentPhone = parentPhone;
    } else if (userData.role === 'teacher') {
      userData.subject = subject;
      if (hireDate) userData.hireDate = hireDate;
    }

    // Create user
    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
      },
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      data: user,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists. Please use a different email.',
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        errors: errors,
      });
    }

    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


//  LOGIN - Authenticate user and get token

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // 2️⃣ Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // 3️⃣ Generate JWT token
    const payload = {
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
      },
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4️⃣ Send response
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;