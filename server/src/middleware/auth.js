// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { security } = require('../config/server-config');

function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ success: false, message: 'Login Kadaluarsa, Mohon Login Kembali' });

  try {
    const user = jwt.verify(token, security.jwt.secret);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Mohon Login Ulang' });
  }
}

module.exports = { requireAuth };