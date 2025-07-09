const express = require('express');
const router = express.Router();
const { DOCUMENTS_CSV } = require('./utils/csvUtils');

router.get('/download', (req, res) => {
  if (!fs.existsSync(DOCUMENTS_CSV)) {
    return res.status(404).json({ error: 'No documents found' });
  }
  res.download(DOCUMENTS_CSV, `permohonan-${new Date().toISOString().slice(0, 10)}.csv`);
});

module.exports = router;