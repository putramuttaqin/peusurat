const path = require('path');
const express = require('express');
const cors = require('cors');
const { app, security, storage } = require('./config/server-config');
const documentRoutes = require('./routes/permohonan');

const server = express();

// Middleware
server.use(cors({ origin: security.cors.origin }));
server.use(express.json());

// Routes
server.use('/api/documents', documentRoutes);

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