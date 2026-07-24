// models/User.js 
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  
  // CORE FIELDS
  
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
  type: String,
  enum: ['admin', 'registrar', 'finance_officer', 'teacher', 'student', 'parent'],
  required: true,
  default: 'student',
},
  phone: {
    type: String,
    trim: true,
},
gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
},

  
  //  STUDENT-SPECIFIC FIELDS
 
  class: {
    type: String,
    required: function () {
      return this.role === 'student';
    },
    trim: true,
  },
  age: {
    type: Number,
    min: 0,
    max: 120,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    
    validate: {
      validator: async function(value) {
        if (!value) return true; // null is allowed (student can be added later)
        const parent = await mongoose.model('User').findById(value);
        return parent && parent.role === 'parent';
      },
      message: 'Parent must exist and have role "parent"',
    },
  },

  
  //  TEACHER-SPECIFIC FIELDS
 
  subject: {
    type: String,
    required: function () {
      return this.role === 'teacher';
    },
    trim: true,
  },
  hireDate: {
    type: Date,
    default: function () {
      return this.role === 'teacher' ? Date.now() : null;
    },
  },

 
  //  PARENT-SPECIFIC FIELDS
  
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],


  //  COMMON FIELDS

  createdAt: {
    type: Date,
    default: Date.now,
  },
});


//  Remove role-specific fields before sending response

UserSchema.methods.toJSON = function () {
  const user = this.toObject();

  //  Always remove password
  delete user.password;

  //  Remove role-specific fields based on user role
  switch (user.role) {
    case 'student':
      delete user.children;
      delete user.hireDate;
      delete user.subject;
      delete user.phone;
      break;

    case 'teacher':
      delete user.children;
      delete user.class;
      delete user.age;
      delete user.parentId;
      break;

    case 'parent':
      delete user.class;
      delete user.age;
      delete user.parentId;
      delete user.subject;
      delete user.hireDate;
      break;
      case 'finance_officer':
        delete user.class;
      delete user.age;
      delete user.parentId;
      delete user.subject;
      delete user.hireDate;
      delete user.children;
      break;
      case 'registrar':
        delete user.class;
      delete user.age;
      delete user.parentId;
      delete user.subject;
      delete user.hireDate;
      delete user.children;
      break;

    case 'admin':
      delete user.class;
      delete user.age;
      delete user.parentId;
      delete user.subject;
      delete user.hireDate;
      delete user.children;
      break;

    default:
      break;
  }

  return user;
};

module.exports = mongoose.model('User', UserSchema);