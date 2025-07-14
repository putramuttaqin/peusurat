// server/src/middleware/auth.js
const crypto = require('crypto');

const sessions = {}; // Should match your auth.routes.js sessions store

// server/src/middleware/auth.js
exports.checkAdmin = (req, res, next) => {
  console.log('Session check:', req.session); // For debugging
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
};