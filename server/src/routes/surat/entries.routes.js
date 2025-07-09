const express = require('express');
const router = express.Router();
const { readAllDocuments } = require('./utils/csvUtils');

router.get('/', async (req, res) => {
  try {
    const documents = await readAllDocuments();
    res.json({ documents });
  } catch (err) {
    console.error('CSV error:', err);
    res.status(500).json({ error: 'CSV processing failed' });
  }
});

module.exports = router;