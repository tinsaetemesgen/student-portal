// routes/resourceRoutes.js - Shared learning resources with file upload
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');
const { getClassLevel, formatBytes, getFileType } = require('../utils/helpers');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'resources');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|docx?|xlsx?|pptx?|txt|csv|zip|mp3|mp4|jpe?g|png)$/i;
    if (allowed.test(file.originalname)) return cb(null, true);
    cb(new Error('File type not allowed. Use PDF, Word, Excel, PowerPoint, text, images or media files.'));
  },
});

const parseArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value).split(',').map((s) => s.trim()).filter(Boolean);
  }
};

// ✅ GET /api/resources/teacher/classes - Teacher's assigned classes
router.get('/teacher/classes', auth, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ success: false, error: 'Not allowed for students' });
    }

    const Class = require('../models/Class');
    const classes = await Class.find({ teacherIds: req.user.id }).select('name grade section academicYear');

    const data = classes.map((c) => {
      const obj = c.toJSON();
      obj.classLevel = getClassLevel(c.grade);
      return obj;
    });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET /api/resources/recent?limit=5 - Latest active resources
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const resources = await Resource.find({ isActive: true })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET /api/resources?classLevel&subject&search
router.get('/', auth, async (req, res) => {
  try {
    const { classLevel, subject, search } = req.query;
    const filter = { isActive: true };

    if (classLevel) filter.classLevel = classLevel;
    if (subject) filter.subject = { $regex: new RegExp(subject, 'i') };
    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
        { topic: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ POST /api/resources/upload (multipart: file + fields)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const {
      title, description, subject, topic, classLevel, grade, semester, academicYear,
    } = req.body;

    if (!title || !subject || !grade) {
      return res.status(400).json({
        success: false,
        error: 'Title, subject and grade are required',
      });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please select a file to upload' });
    }

    const sections = parseArray(req.body.sections);
    const assignedClasses = parseArray(req.body.assignedClasses);

    const resource = await Resource.create({
      title,
      description: description || '',
      subject,
      topic: topic || '',
      classLevel: classLevel || getClassLevel(grade),
      grade,
      sections,
      assignedClasses,
      semester: semester || 'Semester 1',
      academicYear: academicYear || '2024/25',
      fileUrl: `/uploads/resources/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: getFileType(req.file.originalname),
      fileSize: req.file.size,
      readableSize: formatBytes(req.file.size),
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully!',
      data: resource,
    });
  } catch (error) {
    console.error(error);
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ PUT /api/resources/:id (multipart; file optional)
router.put('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    if (req.user.role === 'teacher' && resource.uploadedBy?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit resources you uploaded',
      });
    }

    const fields = ['title', 'description', 'subject', 'topic', 'classLevel', 'grade', 'semester', 'academicYear'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) resource[f] = req.body[f];
    });
    if (req.body.sections !== undefined) resource.sections = parseArray(req.body.sections);
    if (req.body.assignedClasses !== undefined) resource.assignedClasses = parseArray(req.body.assignedClasses);

    if (req.file) {
      if (resource.fileUrl) {
        const oldPath = path.join(__dirname, '..', resource.fileUrl.replace(/^\//, ''));
        fs.unlink(oldPath, () => {});
      }
      resource.fileUrl = `/uploads/resources/${req.file.filename}`;
      resource.fileName = req.file.originalname;
      resource.fileType = getFileType(req.file.originalname);
      resource.fileSize = req.file.size;
      resource.readableSize = formatBytes(req.file.size);
    }

    await resource.save();

    res.json({
      success: true,
      message: 'Resource updated successfully!',
      data: resource,
    });
  } catch (error) {
    console.error(error);
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ GET /api/resources/:id/download - Streaming download
router.get('/:id/download', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource || !resource.fileUrl) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    const filePath = path.join(__dirname, '..', resource.fileUrl.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File missing on server' });
    }

    resource.downloadCount += 1;
    resource.viewCount += 1;
    await resource.save();

    res.download(filePath, resource.fileName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// ✅ DELETE /api/resources/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    if (req.user.role === 'teacher' && resource.uploadedBy?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete resources you uploaded',
      });
    }

    if (resource.fileUrl) {
      const filePath = path.join(__dirname, '..', resource.fileUrl.replace(/^\//, ''));
      fs.unlink(filePath, () => {});
    }

    await resource.deleteOne();

    res.json({ success: true, message: 'Resource deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
