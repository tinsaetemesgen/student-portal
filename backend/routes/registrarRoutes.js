// routes/registrarRoutes.js - COMPLETE FIXED VERSION

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Class = require('../models/Class');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const bcrypt = require('bcryptjs');

// ============================================
// 📌 HELPER FUNCTION - Determine classLevel from class name
// ============================================

const getClassLevel = (className) => {
    if (!className) return 'secondary';
    
    const classStr = className.toLowerCase();
    
    // ✅ FIXED: Use proper regex patterns
    // Check for primary (Grades 1-4)
    if (classStr.includes('grade 1') || classStr.includes('grade 2') || 
        classStr.includes('grade 3') || classStr.includes('grade 4') ||
        classStr.match(/grade\s*[1-4]/i)) {  // ✅ FIXED: [1-4] is valid
        return 'primary';
    }
    
    // Check for middle (Grades 5-8)
    if (classStr.includes('grade 5') || classStr.includes('grade 6') || 
        classStr.includes('grade 7') || classStr.includes('grade 8') ||
        classStr.match(/grade\s*[5-8]/i)) {  // ✅ FIXED: [5-8] is valid
        return 'middle';
    }
    
    // Check for secondary (Grades 9-12)
    if (classStr.includes('grade 9') || classStr.includes('grade 10') || 
        classStr.includes('grade 11') || classStr.includes('grade 12') ||
        classStr.match(/grade\s*9/i) ||  // ✅ FIXED: Match individually
        classStr.match(/grade\s*10/i) ||
        classStr.match(/grade\s*11/i) ||
        classStr.match(/grade\s*12/i)) {
        return 'secondary';
    }
    
    // Default to secondary
    return 'secondary';
};

// ============================================
// 📌 REGISTRAR ROUTES - Student Management
// ============================================

// ✅ Get all students
router.get('/students', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password')
            .populate('parentId', 'name email phone')
            .sort({ name: 1 });
        
        res.json({ success: true, count: students.length, data: students });
    } catch (error) {
        console.error('❌ Error fetching students:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// ✅ Create student (Registrar) - WITH classLevel
router.post('/students', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            class: className, 
            age, 
            parentName, 
            parentPhone,
            parentEmail,
        } = req.body;

        console.log('📥 Creating student with data:', req.body);

        // ✅ Validate required fields
        if (!name || !email || !password || !className) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, password, and class are required'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let parentId = null;

        // ✅ If parent email is provided, find or create parent
        if (parentEmail) {
            let parent = await User.findOne({ email: parentEmail });
            
            if (!parent) {
                // Create a parent account
                const parentPassword = await bcrypt.hash('parent123', salt);
                parent = new User({
                    name: parentName || 'Parent',
                    email: parentEmail,
                    password: parentPassword,
                    role: 'parent',
                    children: [],
                });
                await parent.save();
                console.log(`✅ Created new parent: ${parent.name}`);
            }
            
            parentId = parent._id;
        }

        // ✅ Determine classLevel from class name
        const classLevel = getClassLevel(className);
        console.log(`📚 Class: ${className} → Class Level: ${classLevel}`);

        // ✅ Create student with classLevel
        const userData = {
            name,
            email,
            password: hashedPassword,
            role: 'student',
            class: className,
            classLevel: classLevel,
            age: age || 0,
            parentId: parentId,
        };

        const student = new User(userData);
        await student.save();
        console.log(`✅ Student created: ${student.name}`);

        // ✅ Add student to parent's children array
        if (parentId) {
            await User.findByIdAndUpdate(parentId, {
                $push: { children: student._id }
            });
            console.log(`✅ Linked ${student.name} to parent`);
        }

        const studentResponse = student.toObject();
        delete studentResponse.password;

        res.status(201).json({
            success: true,
            message: 'Student created successfully!',
            data: studentResponse,
            parentLinked: !!parentId,
        });
    } catch (error) {
        console.error('❌ Error creating student:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Email already exists. Please use a different email.'
            });
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, errors });
        }
        
        res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
    }
});

// ✅ Get all teachers
router.get('/teachers', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' })
            .select('-password')
            .populate('assignedClasses', 'name grade section')
            .sort({ name: 1 });
            
        res.json({ success: true, count: teachers.length, data: teachers });
    } catch (error) {
        console.error('❌ Error fetching teachers:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// ✅ Create teacher (Registrar) - WITH CLASS ASSIGNMENT
router.post('/teachers', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const { name, email, password, subject, hireDate, phone, assignedClasses } = req.body;

        console.log('📥 Creating teacher with data:', req.body);

        // ✅ Validate required fields
        if (!name || !email || !password || !subject) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, password, and subject are required'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ✅ Create teacher with assigned classes
        const userData = {
            name,
            email,
            password: hashedPassword,
            role: 'teacher',
            subject,
            hireDate: hireDate || new Date(),
            phone: phone || '',
            assignedClasses: assignedClasses || [],
        };

        const teacher = new User(userData);
        await teacher.save();
        console.log(`✅ Teacher created: ${teacher.name}`);

        // ✅ If classes are assigned, add teacher to those classes
        if (assignedClasses && assignedClasses.length > 0) {
            for (const classId of assignedClasses) {
                await Class.findByIdAndUpdate(classId, {
                    $addToSet: { teacherIds: teacher._id }
                });
            }
            console.log(`✅ Assigned to ${assignedClasses.length} classes`);
        }

        const teacherResponse = teacher.toObject();
        delete teacherResponse.password;

        res.status(201).json({
            success: true,
            message: 'Teacher created successfully!',
            data: teacherResponse,
        });
    } catch (error) {
        console.error('❌ Error creating teacher:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Email already exists. Please use a different email.'
            });
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, errors });
        }
        
        res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
    }
});

// ✅ Update student
router.put('/students/:id', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // ✅ If class is updated, recalculate classLevel
        if (updates.class) {
            updates.classLevel = getClassLevel(updates.class);
        }
        
        const student = await User.findByIdAndUpdate(
            id, 
            updates, 
            { new: true, runValidators: true }
        );
        
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        
        res.json({ success: true, message: 'Student updated successfully!', data: student });
    } catch (error) {
        console.error('❌ Error updating student:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// ✅ Delete student
router.delete('/students/:id', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const { id } = req.params;
        const student = await User.findByIdAndDelete(id);
        
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        
        // ✅ Remove student from parent's children array
        if (student.parentId) {
            await User.findByIdAndUpdate(student.parentId, {
                $pull: { children: id }
            });
        }
        
        res.json({ success: true, message: 'Student deleted successfully!' });
    } catch (error) {
        console.error('❌ Error deleting student:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// ✅ Get all classes
router.get('/classes', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const classes = await Class.find()
            .populate('teacherIds', 'name email subject')
            .populate('students', 'name email')
            .sort({ name: 1 });
            
        res.json({ success: true, count: classes.length, data: classes });
    } catch (error) {
        console.error('❌ Error fetching classes:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// ✅ Create class
router.post('/classes', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const { name, grade, section, academicYear, teacherIds, subjects } = req.body;
        
        // ✅ Determine classLevel from grade
        const classLevel = getClassLevel(grade || name);
        
        const classData = new Class({
            name,
            grade,
            section,
            academicYear,
            teacherIds: teacherIds || [],
            subjects: subjects || [],
            classLevel,
        });
        
        await classData.save();
        console.log(`✅ Class created: ${classData.name}`);
        
        res.status(201).json({
            success: true,
            message: 'Class created successfully!',
            data: classData
        });
    } catch (error) {
        console.error('❌ Error creating class:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// ✅ Update teacher
router.put('/teachers/:id', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedClasses, ...otherUpdates } = req.body;
        
        const teacher = await User.findByIdAndUpdate(
            id,
            otherUpdates,
            { new: true, runValidators: true }
        );
        
        if (!teacher) {
            return res.status(404).json({ success: false, error: 'Teacher not found' });
        }
        
        // ✅ Update class assignments if provided
        if (assignedClasses) {
            // Remove teacher from old classes
            await Class.updateMany(
                { teacherIds: id },
                { $pull: { teacherIds: id } }
            );
            
            // Add teacher to new classes
            for (const classId of assignedClasses) {
                await Class.findByIdAndUpdate(classId, {
                    $addToSet: { teacherIds: id }
                });
            }
        }
        
        res.json({ success: true, message: 'Teacher updated successfully!', data: teacher });
    } catch (error) {
        console.error('❌ Error updating teacher:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// ✅ Delete teacher
router.delete('/teachers/:id', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await User.findByIdAndDelete(id);
        
        if (!teacher) {
            return res.status(404).json({ success: false, error: 'Teacher not found' });
        }
        
        // ✅ Remove teacher from all classes
        await Class.updateMany(
            { teacherIds: id },
            { $pull: { teacherIds: id } }
        );
        
        res.json({ success: true, message: 'Teacher deleted successfully!' });
    } catch (error) {
        console.error('❌ Error deleting teacher:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// ============================================
// 📌 REGISTRAR ROUTES - Parent Management
// ============================================

// ✅ Get all parents
router.get('/parents', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const parents = await User.find({ role: 'parent' })
            .select('-password')
            .populate('children', 'name email class age')
            .sort({ name: 1 });
            
        res.json({ success: true, count: parents.length, data: parents });
    } catch (error) {
        console.error('❌ Error fetching parents:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// ✅ Create parent
router.post('/parents', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        const existingParent = await User.findOne({ email });
        if (existingParent) {
            return res.status(400).json({
                success: false,
                error: 'Parent email already exists. Please use a different email.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'parent123', salt);

        const parent = new User({
            name,
            email,
            password: hashedPassword,
            role: 'parent',
            phone,
            address,
            children: [],
        });

        await parent.save();

        const parentResponse = parent.toObject();
        delete parentResponse.password;

        res.status(201).json({
            success: true,
            message: 'Parent created successfully!',
            data: parentResponse
        });
    } catch (error) {
        console.error('❌ Error creating parent:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Email already exists. Please use a different email.'
            });
        }
        
        res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
    }
});

// ✅ Link student to parent
router.put('/parents/:parentId/link/:studentId', auth, roleCheck('admin', 'registrar'), async (req, res) => {
    try {
        const { parentId, studentId } = req.params;

        const parent = await User.findById(parentId);
        if (!parent || parent.role !== 'parent') {
            return res.status(404).json({ success: false, error: 'Parent not found' });
        }

        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        if (parent.children.includes(studentId)) {
            return res.status(400).json({
                success: false,
                error: 'Student is already linked to this parent'
            });
        }

        await User.findByIdAndUpdate(parentId, {
            $push: { children: studentId }
        });

        await User.findByIdAndUpdate(studentId, {
            parentId: parentId
        });

        res.json({
            success: true,
            message: 'Student linked to parent successfully!',
            data: {
                parent: { id: parent._id, name: parent.name },
                student: { id: student._id, name: student.name }
            }
        });
    } catch (error) {
        console.error('❌ Error linking parent:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;