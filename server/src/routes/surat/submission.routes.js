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
      nomorSurat,
      sifatSurat = 0 // default Biasa
    } = req.body;

    const sql = `
      INSERT INTO surat (
        user_id,
        jenis_surat_id,
        perihal_surat,
        tanggal_surat,
        nomor_surat,
        sifat_surat,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const params = [
      userId,
      JENIS_SURAT_OPTIONS.indexOf(jenisSurat) + 1 || 1,
      perihalSurat,
      tanggalSurat,
      nomorSurat,
      parseInt(sifatSurat), // 👈 convert to int 0 or 1
      parseInt(STATUS.PENDING)
    ];

    await logAndRun(sql, params);

    res.status(201).json({ success: true, message: 'Surat berhasil disimpan' });
  } catch (err) {
    console.error('Submission failed:', err);
    res
      .status(400)
      .json({ success: false, message: err.message || 'Gagal menyimpan data' });
  }
});

module.exports = router;
