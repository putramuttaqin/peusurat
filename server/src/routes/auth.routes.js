// server/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const sessions = {}; // Temporary session store

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'password123';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = crypto.randomBytes(16).toString('hex');
    sessions[token] = { isAdmin: true };

    res.cookie('sessionToken', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }).json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  const token = req.cookies.sessionToken;
  delete sessions[token];
  res.clearCookie('sessionToken').json({ success: true });
});

router.get('/check-admin', (req, res) => {
  const token = req.cookies.sessionToken;
  if (sessions[token]?.isAdmin) {
    res.json({ isAdmin: true });
  } else {
    res.status(403).json({ isAdmin: false });
  }
});

// Export the router directly
module.exports = router;