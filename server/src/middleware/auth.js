// server/src/middleware/auth.js
const crypto = require('crypto');

const sessions = {}; // Should match your auth.routes.js sessions store

exports.checkAdmin = (req, res, next) => {
  const token = req.cookies.sessionToken;
  if (sessions[token]?.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};