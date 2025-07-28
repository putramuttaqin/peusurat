const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { app, security } = require('../config/server-config');
const { logAndGet } = require('../config/db'); // use your helper

router.post('/session', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await logAndGet('SELECT id, password, role FROM users WHERE username = $1', [username]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Username tidak ditemukan' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    // Set signed cookie based on role (1 = admin)
    res.cookie('isAdmin', user.role === 1 ? 'true' : 'false', {
      httpOnly: true,
      signed: true,
      secure: app.env === 'production',
      sameSite: app.env === 'production' ? 'none' : 'lax',
      maxAge: security.session.maxAge,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
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
