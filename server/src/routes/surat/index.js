const express = require('express');
const router = express.Router();
const submissionRoutes = require('./submission.routes');
const entriesRoutes = require('./entries.routes');
const { initCsvFile } = require('../utils/csvUtils');

// Initialize CSV file on startup
initCsvFile();

// Mount all routes
router.use('/submit', submissionRoutes);
router.use('/entries', entriesRoutes);

module.exports = router;