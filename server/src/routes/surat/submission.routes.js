// server/src/routes/surat/submission.routes.js

const express = require('express');
const router = express.Router();
const { logAndRun } = require('../../config/db');
const { STATUS } = require('../../constants/enum');

router.post('/', (req, res) => {
  try {
    const {
      jenisSurat = '',
      perihalSurat = '',
      ruangPemohon = '',
      pemohon = '',
      tanggalSurat = '',
      nomorSurat
    } = req.body;

    const sql = `
      INSERT INTO surat (
        jenis_surat,
        perihal_surat,
        ruang,
        pemohon,
        tanggal_surat,
        nomor_surat,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      parseInt(jenisSurat) || 0,
      perihalSurat,
      parseInt(ruangPemohon) || 0,
      pemohon,
      tanggalSurat,
      nomorSurat || `TEMP-${Date.now()}`,
      parseInt(STATUS.PENDING)
    ];

    logAndRun(sql, params);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Submission failed:', err);
    res.status(500).json({ error: 'Failed to save document' });
  }
});

module.exports = router;
