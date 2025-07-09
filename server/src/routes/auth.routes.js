const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Simple in-memory store (replace with Redis in production)
const sessions = {};

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'password123';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Create session token
    const token = crypto.randomBytes(16).toString('hex');
    sessions[token] = { isAdmin: true };
    
    // Set HTTP-only cookie
    res.cookie('sessionToken', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }).json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

router.post('/logout', (req, res) => {
  const token = req.cookies.sessionToken;
  delete sessions[token];
  res.clearCookie('sessionToken').json({ success: true });
});

module.exports = { router };