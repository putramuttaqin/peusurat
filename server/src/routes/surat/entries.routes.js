const express = require('express');
const router = express.Router();
const { checkAdmin } = require('../utils/authUtils');
const { readAllDocuments } = require('../utils/csvUtils');

// Protected route
router.get('/', checkAdmin, async (req, res) => {
  try {
    const documents = await readAllDocuments();
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;