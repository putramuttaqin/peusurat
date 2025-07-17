const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('[ENV] Loaded from file:', path.join(__dirname, '../../.env'));
module.exports = {
  app: {
    env: 'development',
    port: process.env.PORT ? Number(process.env.PORT) : 3001,
    name: 'SINOMOR Document System',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  security: {
    session: {
      secret: process.env.SESSION_SECRET || 'default-session-secret',
      name: process.env.SESSION_COOKIE_NAME || 'sinomor.sid',
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: process.env.CORS_CREDENTIALS === 'true'
    },
    admin: {
      username: process.env.ADMIN_USER || 'admin',
      password: process.env.ADMIN_PASS || 'password123'
    },
    redis: {
      url: process.env.REDIS_URL || null
    }
  }
};