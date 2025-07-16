const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT ? Number(process.env.PORT) : 3001,
    name: 'SINOMOR Document System',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  storage: {
    documents: {
      format: 'csv',
      directory: path.resolve(process.env.STORAGE_DIRECTORY || path.join(__dirname, '../../data')),
      filename: process.env.STORAGE_FILENAME || 'permohonan-surat.csv',
      maxEntries: parseInt(process.env.STORAGE_MAX_ENTRIES) || 10000,
      registersFile: 'registers.json'
    }
  },
  security: {
    session: {
      secret: process.env.SESSION_SECRET || 'default-session-secret',
      name: process.env.SESSION_COOKIE_NAME || 'sinomor.sid',
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: process.env.CORS_CREDENTIALS === 'true'
    },
    admin: {
      username: process.env.ADMIN_USER || 'admin',
      password: process.env.ADMIN_PASS || 'password123'
    },
    redis: {
      url: process.env.REDIS_URL || null
    }
  },
  features: {
    automaticNumbering: process.env.AUTO_NUMBERING === 'true',
    requireAuth: process.env.REQUIRE_AUTH !== 'false'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    session: process.env.LOG_SESSION === 'true'
  }
};