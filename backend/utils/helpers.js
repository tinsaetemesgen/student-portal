// utils/helpers.js - Shared helpers used across routes

// Class level from a numeric grade: primary (1-4), middle (5-8), secondary (9-12)
const getClassLevel = (grade) => {
  const num = parseInt(grade, 10);
  if (isNaN(num)) return 'secondary';
  if (num <= 4) return 'primary';
  if (num <= 8) return 'middle';
  return 'secondary';
};

// Human readable file size, e.g. "2.30 MB"
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

// Categorize an uploaded file by extension.
const getFileType = (filename = '') => {
  const ext = filename.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc') return 'doc';
  if (ext === 'docx') return 'docx';
  if (ext === 'xls') return 'xls';
  if (ext === 'xlsx') return 'xlsx';
  if (ext === 'ppt') return 'ppt';
  if (ext === 'pptx') return 'pptx';
  return ext || 'file';
};

// Expiry text shown in announcement cards.
const getTimeRemaining = (expiresAt) => {
  if (!expiresAt) return 'No expiry';
  const end = new Date(expiresAt).getTime();
  if (isNaN(end)) return 'No expiry';

  const diff = end - Date.now();
  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${Math.max(minutes, 1)}m remaining`;
};

module.exports = {
  getClassLevel,
  formatBytes,
  getFileType,
  getTimeRemaining,
};
