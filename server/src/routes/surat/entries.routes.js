// server/src/routes/surat/entries.routes.js

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { logAndRun, logAndGet, logAndAll } = require('../../config/db');
const { checkAdmin } = require('../../middleware/auth');
const { STATUS } = require('../../constants/enum');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// GET /api/surat/entries
router.get('/', (req, res) => {
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
    let where = 'WHERE 1=1';

    if (startDate) {
      where += ' AND created_at >= ?';
      params.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      where += ' AND created_at <= ?';
      params.push(`${endDate} 23:59:59`);
    }
    if (status) {
      where += ' AND status = ?';
      params.push(parseInt(status));
    }
    if (jenisSurat) {
      where += ' AND jenis_surat = ?';
      params.push(parseInt(jenisSurat));
    }
    if (ruang) {
      where += ' AND ruang = ?';
      params.push(parseInt(ruang));
    }

    let searchSql = '';
    if (search) {
      searchSql = `
        AND (
          perihal_surat LIKE ? OR
          pemohon LIKE ? OR
          nomor_surat LIKE ?
        )
      `;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const offset = (page - 1) * limit;

    const total = logAndGet(`SELECT COUNT(*) as count FROM surat ${where} ${searchSql}`, params).count;

    const documents = logAndAll(`
      SELECT * FROM surat
      ${where} ${searchSql}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    res.json({ documents, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Error in GET /api/surat/entries:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/surat/entries/:id
router.patch('/:id', limiter, checkAdmin, (req, res) => {
  try {
    console.log(`Params: ${req.params.id}`);
    console.log(`Body: ${req.body}`);

    const id = parseInt(req.params.id);
    const { action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const surat = logAndGet('SELECT * FROM surat WHERE id = ?', [id]);
    if (!surat) {
      return res.status(404).json({ error: 'Document not found' });
    }

    let updatedNomor = surat.nomor_surat;
    let updatedStatus = surat.status;

    if (action === 'approve') {
      updatedNomor = surat.nomor_surat.replace('xyz', surat.id);
      updatedStatus = parseInt(STATUS.APPROVED);
    } else if (action === 'reject') {
      updatedStatus = parseInt(STATUS.REJECTED);
    }

    logAndRun(
      `UPDATE surat SET nomor_surat = ?, status = ? WHERE id = ?`,
      [updatedNomor, updatedStatus, id]
    );

    const updated = logAndGet('SELECT * FROM surat WHERE id = ?', [id]);

    res.json({ success: true, updatedDocument: updated });
  } catch (err) {
    console.error('Error in PATCH /api/surat/entries/:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
