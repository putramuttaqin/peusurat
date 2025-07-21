const express = require('express');
const router = express.Router();
const { logAndRun } = require('../../config/db');
const { JENIS_SURAT_OPTIONS, RUANG_OPTIONS, STATUS } = require('../../constants/enum');

router.post('/', async (req, res) => {
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const params = [
      JENIS_SURAT_OPTIONS.indexOf(jenisSurat) || 0,
      perihalSurat,
      RUANG_OPTIONS.indexOf(ruangPemohon) || 0,
      pemohon,
      tanggalSurat,
      nomorSurat || `TEMP-${Date.now()}`,
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
