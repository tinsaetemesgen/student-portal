// middleware/roleCheck.js - Check if user has required role
const roleCheck = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Please log in first.',
      });
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. ${req.user.role}s do not have permission.`,
      });
    }

    next();
  };
};

module.exports = roleCheck;