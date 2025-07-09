const express = require('express');
const router = express.Router();
const { appendRecord } = require('./utils/csvUtils');

router.post('/', async (req, res) => {
  try {
    await appendRecord({
      jenisSurat: req.body.jenisSurat || '',
      perihalSurat: req.body.perihalSurat || '',
      ruangPemohon: req.body.ruangPemohon || '',
      pemohon: req.body.pemohon || '',
      tanggalSurat: req.body.tanggalSurat || '',
      nomorSurat: req.body.nomorSurat || `TEMP-${Date.now()}`,
      status: 'proposed'
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Submission failed:', err);
    res.status(500).json({ error: 'Failed to save document' });
  }
});

module.exports = router;