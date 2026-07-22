// server.js - Clean server file
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const parentRoutes = require('./routes/parentRoutes');
const classRoutes = require('./routes/classRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const app = express();
const PORT = process.env.PORT || 7000;

// Connect to MongoDB before starting the server
const startServer = async () => {
  try {
    await connectDB();

    // Middleware
    app.use(express.json());

    // Logger middleware (optional)
    app.use((req, res, next) => {
      console.log(`📝 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
      next();
    });

    // Routes
    app.use('/api/users', userRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/parents', parentRoutes);
    app.use('/api/classes', classRoutes);
    app.use('/api/grades', gradeRoutes);

    // Home route
    app.get('/', (req, res) => {
      res.send('High School Portal Backend is running!');
    });

    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Server startup aborted due to MongoDB connection failure.');
    process.exit(1);
  }
};

startServer();