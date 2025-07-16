const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { app: config, security, storage } = require('./config/server-config');

// Initialize Express
const app = express();

// Session configuration
const sessionConfig = {
  secret: security.session.secret,
  name: security.session.name,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.env === 'production',
    httpOnly: true,
    maxAge: security.session.maxAge,
    sameSite: config.env === 'production' ? 'none' : 'lax'
  }
};

console.log('[BOOT] Starting server...');
console.log('[ENV] PORT:', process.env.PORT);
console.log('[ENV] ENV:', config.env);
console.log('[ENV] Redis URL:', security.redis?.url);

// Redis
try {
  if (config.env === 'production' && security.redis.url) {
    const RedisStore = require('connect-redis').default;
    const Redis = require('ioredis');
    const redisClient = new Redis(security.redis.url);
    sessionConfig.store = new RedisStore({ client: redisClient });
  }
} catch (err) {
  console.error('Redis session store setup failed:', err);
}

// ✅ Add this line before any middleware that relies on IP
app.set('trust proxy', true);

// Middleware
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(cors({
  origin: security.cors.origin,
  credentials: true, // Must be literal true, not just truthy
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Explicitly handle OPTIONS requests
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
    session: req.sessionID ? 'active' : 'none'
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
  ➜ Storage: ${path.join(storage.documents.directory, storage.documents.filename)}
  `);
});

module.exports = app;