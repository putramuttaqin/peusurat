const express = require('express');
const cors = require('cors');
const path = require('path');
const { app, security, storage } = require('./config/server-config');
const authRoutes = require('./routes/auth.routes');
const documentRoutes = require('./routes/surat/index'); // Explicitly point to index.js

const server = express();
const cookieParser = require('cookie-parser');
server.use(cookieParser());

// Allow requests from your frontend origin
const corsOptions = {
  origin: 'http://localhost:3000', // Change to your frontend URL
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
server.use(cors(corsOptions));
server.use(express.json());

// Routes
server.use('/api/surat', documentRoutes);
server.use('/api/auth', authRoutes);

// Health Check
server.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: app.name,
    environment: app.env
  });
});

// Error Handling
server.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  res.status(500).json({ error: 'Internal server error' });
});

server.listen(app.port, () => {
  console.log(`
  ${app.name} running in ${app.env} mode
  ➜ API: http://localhost:${app.port}/api/documents
  ➜ Storage: ${path.join(storage.documents.directory, storage.documents.filename)}
  `);
});