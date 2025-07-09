const express = require('express');
const router = express.Router();
const submissionRoutes = require('./submission.routes');
const entriesRoutes = require('./entries.routes');
const approvalRoutes = require('./approval.routes');
const downloadRoutes = require('./download.routes');
const { initCsvFile } = require('./utils/csvUtils');

// Initialize CSV file on startup
initCsvFile();

// Mount all routes
router.use('/submit', submissionRoutes);
router.use('/entries', entriesRoutes);
router.use('/approve', approvalRoutes);
router.use('/download', downloadRoutes);

module.exports = router;