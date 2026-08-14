// seed.js - Creates the baseline accounts every developer needs in order to log in.
//
//   npm run seed            idempotent: creates anything missing, touches nothing existing
//   npm run seed -- --reset DESTRUCTIVE: wipes users/classes/grades first
//
// The cluster is shared, so --reset destroys your teammates' data too. Ask first.
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');
const User = require('./models/User');
const Class = require('./models/Class');
const Grade = require('./models/Grade');

const PASSWORD = process.env.SEED_PASSWORD || 'ChangeMe123!';
const ACADEMIC_YEAR = '2024/25';
const SEMESTER = 'Semester 1';
const CLASS_NAME = 'Grade 10A';
const RESET = process.argv.includes('--reset');

// Creates the user only if the email is free, so re-running is safe.
const findOrCreateUser = async (email, fields) => {
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`   = ${email.padEnd(22)} already exists, left untouched`);
    return existing;
  }

  const salt = await bcrypt.genSalt(10);
  const user = await User.create({
    ...fields,
    email,
    password: await bcrypt.hash(PASSWORD, salt),
  });

  console.log(`   + ${email.padEnd(22)} created as ${user.role}`);
  return user;
};

const seed = async () => {
  await connectDB();

  if (RESET) {
    console.log('\n⚠️  --reset: deleting every user, class and grade in this database');
    await Promise.all([User.deleteMany({}), Class.deleteMany({}), Grade.deleteMany({})]);
  }

  console.log('\n👤 Accounts');
  const admin = await findOrCreateUser('admin@school.test', {
    name: 'Admin User',
    role: 'admin',
  });
  const teacher = await findOrCreateUser('teacher@school.test', {
    name: 'Tigist Bekele',
    role: 'teacher',
    subject: 'Mathematics',
  });
  // Parent must exist before the student: User.parentId validates that the
  // referenced document exists and has role 'parent'.
  const parent = await findOrCreateUser('parent@school.test', {
    name: 'Alemu Kebede',
    role: 'parent',
  });
  const student = await findOrCreateUser('student@school.test', {
    name: 'Sara Alemu',
    role: 'student',
    class: CLASS_NAME,
    age: 16,
    parentId: parent._id,
  });
  const finance = await findOrCreateUser('finance@school.test', {
    name: 'Finance Officer',
    role: 'finance',
  });

  if (!parent.children.some((id) => id.equals(student._id))) {
    parent.children.push(student._id);
    await parent.save();
    console.log(`   ↳ linked ${student.name} to ${parent.name}`);
  }

  console.log('\n🏫 Class');
  let classDoc = await Class.findOne({ name: CLASS_NAME });
  if (classDoc) {
    console.log(`   = ${CLASS_NAME} already exists, left untouched`);
  } else {
    classDoc = await Class.create({
      name: CLASS_NAME,
      grade: '10',
      section: 'A',
      academicYear: ACADEMIC_YEAR,
      teacherIds: [teacher._id],
      students: [student._id],
      subjects: ['Mathematics', 'English', 'Biology', 'Physics'],
    });
    console.log(`   + ${CLASS_NAME} created`);
  }

  console.log('\n📊 Grades');
  if (await Grade.countDocuments({ studentId: student._id })) {
    console.log('   = student already has grades, left untouched');
  } else {
    const samples = [
      { subject: 'Mathematics', type: 'Exam', score: 91 },
      { subject: 'Mathematics', type: 'Quiz', score: 78 },
      { subject: 'English', type: 'Assignment', score: 85 },
      { subject: 'Biology', type: 'Project', score: 94 },
      { subject: 'Physics', type: 'Exam', score: 68 },
    ];

    await Grade.insertMany(
      samples.map((sample) => ({
        ...sample,
        studentId: student._id,
        classId: classDoc._id,
        teacherId: teacher._id,
        grade: Grade.calculateGrade(sample.score),
        semester: SEMESTER,
        academicYear: ACADEMIC_YEAR,
      }))
    );
    console.log(`   + ${samples.length} grades created for ${student.name}`);
  }

  console.log(`\n✅ Done. Log in at http://localhost:5173 with password: ${PASSWORD}`);
  console.log('   admin@school.test | teacher@school.test | student@school.test | parent@school.test');
  console.log(`\n   (admin id ${admin._id})`);

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(`\n❌ Seed failed: ${error.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
