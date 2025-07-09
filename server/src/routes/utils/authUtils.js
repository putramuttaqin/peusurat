// Middleware to check admin status
const checkAdmin = (req, res, next) => {
  const token = req.cookies.sessionToken;
  if (sessions[token]?.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

module.exports = { checkAdmin };
