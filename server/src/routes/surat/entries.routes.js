const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { logAndRun, logAndGet, logAndAll } = require('../../config/db');
const { checkAdmin } = require('../../middleware/auth');
const { STATUS } = require('../../constants/enum');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// GET /api/surat/entries
router.get('/', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      status,
      jenisSurat,
      ruang,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const params = [];
    let paramIndex = 1; // PostgreSQL uses $1, $2, ...
    let where = 'WHERE 1=1';

    if (startDate) {
      where += ` AND created_at >= $${paramIndex++}`;
      params.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      where += ` AND created_at <= $${paramIndex++}`;
      params.push(`${endDate} 23:59:59`);
    }
    if (status) {
      where += ` AND status = $${paramIndex++}`;
      params.push(parseInt(status));
    }
    if (jenisSurat) {
      where += ` AND jenis_surat = $${paramIndex++}`;
      params.push(parseInt(jenisSurat));
    }
    if (ruang) {
      where += ` AND ruang = $${paramIndex++}`;
      params.push(parseInt(ruang));
    }

    let searchSql = '';
    if (search) {
      searchSql = `
        AND (
          perihal_surat ILIKE $${paramIndex} OR
          pemohon ILIKE $${paramIndex + 1} OR
          nomor_surat ILIKE $${paramIndex + 2}
        )
      `;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 3;
    }

    const offset = (page - 1) * limit;

    const totalRes = await logAndGet(
      `SELECT COUNT(*) as count FROM surat ${where} ${searchSql}`,
      params
    );
    const total = parseInt(totalRes?.count || 0);

    const documents = await logAndAll(
      `
      SELECT * FROM surat
      ${where} ${searchSql}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
      `,
      [...params, parseInt(limit), offset]
    );

    res.json({ documents, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Error in GET /api/surat/entries:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/surat/entries/:id
router.patch('/:id', limiter, checkAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { action } = req.body;

    if (![1, 2].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const surat = await logAndGet('SELECT * FROM surat WHERE id = $1', [id]);
    if (!surat) {
      return res.status(404).json({ error: 'Document not found' });
    }

    let updatedNomor = surat.nomor_surat;
    let updatedStatus = surat.status;

    if (action === 1) {
      const lastSurat = await logAndGet(
        `SELECT * FROM surat WHERE jenis_surat = $1 AND status = $2 ORDER BY id DESC LIMIT 1`,
        [surat.jenis_surat, parseInt(STATUS.APPROVED)]
      );

      const lastNumber = lastSurat ? parseInt(lastSurat.nomor_surat.split('-')[1]) : 0;
      updatedNomor = surat.nomor_surat.replace('xyz', lastNumber + 1);
      updatedStatus = parseInt(STATUS.APPROVED);
    } else if (action === 2) {
      updatedStatus = parseInt(STATUS.REJECTED);
    }

    await logAndRun(
      `UPDATE surat SET nomor_surat = $1, status = $2 WHERE id = $3`,
      [updatedNomor, updatedStatus, id]
    );

    const updated = await logAndGet('SELECT * FROM surat WHERE id = $1', [id]);

    res.json({ success: true, updatedDocument: updated });
  } catch (err) {
    console.error('Error in PATCH /api/surat/entries/:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
