// server/src/middleware/auth.js
exports.checkAdmin = (req, res, next) => {
  const isAdmin = req.signedCookies?.isAdmin === 'true';
  if (isAdmin) return next();

  res.status(403).json({ error: 'Admin access required' });
};