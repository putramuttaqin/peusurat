const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session'); // ✅ new
const { app: config, security } = require('./config/server-config');

// Initialize Express
const app = express();

console.log('[BOOT] Starting server...');
console.log('[ENV] PORT:', config.port);
console.log('[ENV] ENV:', config.env);

// ✅ Trust only the first proxy (for Railway)
if (config.env === 'production') {
  app.set('trust proxy', 1);
}

// ✅ Cookie-session config
app.use(cookieSession({
  name: security.session.name || 'sinomor.sid',
  secret: security.session.secret,
  maxAge: security.session.maxAge,
  sameSite: config.env === 'production' ? 'none' : 'lax',
  secure: config.env === 'production',
  httpOnly: true
}));

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: security.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Handle OPTIONS preflight
app.options(/.*/, cors());

// Routes
const authRoutes = require('./routes/auth.routes');
const suratRoutes = require('./routes/surat/index');
app.use('/api/auth', authRoutes);
app.use('/api/surat', suratRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    session: req.session || 'none'
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
app.listen(config.port, () => {
  console.log(`
  ${config.name} running in ${config.env} mode
  ➜ Port: ${config.port}
  ➜ Frontend: ${config.frontendUrl}
  `);
});

module.exports = app;
