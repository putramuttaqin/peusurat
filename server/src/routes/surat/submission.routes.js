const express = require('express');
const router = express.Router();
const { logAndRun } = require('../../config/db');
const { requireAuth } = require('../../middleware/auth');
const { JENIS_SURAT_OPTIONS, STATUS } = require('../../constants/enum');

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      userId = '',
      jenisSurat = '',
      perihalSurat = '',
      tanggalSurat = '',
      sifatSurat = '',
      nomorSurat
    } = req.body;

    const sql = `
      INSERT INTO surat (
        user_id,
        jenis_surat_id,
        sifat_surat,
        perihal_surat,
        tanggal_surat,
        nomor_surat,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const params = [
      userId,
      JENIS_SURAT_OPTIONS.indexOf(jenisSurat)+1 || 1,
      sifatSurat,
      perihalSurat,
      tanggalSurat,
      nomorSurat,
      parseInt(STATUS.PENDING)
    ];

    await logAndRun(sql, params);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Submission failed:', err);
    res.status(500).json({ error: 'Failed to save document' });
  }
});

module.exports = router;
