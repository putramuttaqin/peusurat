// server/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { security } = require('../config/server-config');


// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = security.admin.username;
  const ADMIN_PASS = security.admin.password;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Login failed' });
      }
      res.json({ success: true });
    });
  } else {
    res.status(401).json({ success: false });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid').json({ success: true }); // 'connect.sid' is default cookie name
  });
});

// Check admin status
router.get('/check-admin', (req, res) => {
  if (req.session.isAdmin) {
    res.json({ isAdmin: true });
  } else {
    res.status(403).json({ isAdmin: false });
  }
});

module.exports = router;