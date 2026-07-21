// config/db.js - MongoDB connection logic
const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI. Add it to backend/.env or your environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      console.error('   - mongodb+srv uses DNS SRV. This may fail if your network blocks DNS lookups or Atlas traffic.');
      console.error('   - Ensure your IP is allowed in Atlas Network Access and that your machine can resolve SRV records.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;