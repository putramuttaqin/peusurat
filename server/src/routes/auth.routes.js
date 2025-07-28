const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { app, security } = require('../config/server-config');
const { logAndGet } = require('../config/db'); // use your helper
const jwt = require('jsonwebtoken');

router.post('/session', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await logAndGet(
      'SELECT id, name, username, password, role FROM users WHERE username = $1',
      [username]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Username tidak ditemukan' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      security.jwt.secret, // make sure to define this in your config
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: app.env === 'production',
      sameSite: app.env === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

// DELETE /api/auth/session → Logout
router.delete('/session', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// GET /api/auth/me → Check if admin
router.get('/me', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ isAdmin: false });
  }

  try {
    const user = jwt.verify(token, security.jwt.secret);
    return res.json({ isAdmin: user.role === 1, user });
  } catch {
    return res.json({ isAdmin: false });
  }
});

module.exports = router;
