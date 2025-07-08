const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3001,
    name: 'SINOMOR Document System'
  },
  storage: {
    documents: {
      format: 'csv',
      directory: process.env.STORAGE_DIRECTORY || path.join(__dirname, '../../data'),
      filename: process.env.STORAGE_FILENAME || 'permohonan-surat.csv',
      maxEntries: parseInt(process.env.STORAGE_MAX_ENTRIES) || 10000
    }
  },
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || '*'
    }
  },
  features: {
    automaticNumbering: process.env.AUTO_NUMBERING === 'true'
  }
};