const express = require('express');
const router = express.Router();
const submissionRoutes = require('./submission.routes');
const entriesRoutes = require('./entries.routes');

// Mount all routes
router.use('/submit', submissionRoutes);
router.use('/entries', entriesRoutes);

module.exports = router;