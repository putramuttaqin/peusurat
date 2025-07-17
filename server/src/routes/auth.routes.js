const express = require('express');
const router = express.Router();
const { security } = require('../config/server-config');

// POST /api/auth/session → Login
router.post('/session', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = security.admin.username;
  const ADMIN_PASS = security.admin.password;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.cookie('isAdmin', 'true', {
      httpOnly: true,
      signed: true,
      secure: security.env === 'production',
      sameSite: security.env === 'production' ? 'none' : 'lax',
      maxAge: security.session.maxAge, // e.g., 1 day
    });
    return res.json({ success: true });
  }

  res.status(401).json({ success: false });
});

// DELETE /api/auth/session → Logout
router.delete('/session', (req, res) => {
  res.clearCookie('isAdmin');
  res.json({ success: true });
});

// GET /api/auth/me → Check if admin
router.get('/me', (req, res) => {
  const isAdmin = req.signedCookies?.isAdmin === 'true';
  res.json({ isAdmin });
});

module.exports = router;
