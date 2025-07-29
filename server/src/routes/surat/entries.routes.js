const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { logAndRun, logAndGet, logAndAll } = require('../../config/db');
const { requireAuth } = require('../../middleware/auth');
const { STATUS, USER_ROLES } = require('../../constants/enum');
const { getNoUrut, replaceNoUrut } = require('../../utils/surat');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// GET /api/surat/entries
router.get('/', requireAuth, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      status,
      jenisSurat,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 20;
    const offset = (pageInt - 1) * limitInt;

    const params = [];
    let paramIndex = 1;
    let where = 'WHERE 1=1';

    if (startDate) {
      where += ` AND created_at >= $${paramIndex++}`;
      params.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      where += ` AND created_at <= $${paramIndex++}`;
      params.push(`${endDate} 23:59:59`);
    }

    if (!isNaN(parseInt(status))) {
      where += ` AND status = $${paramIndex++}`;
      params.push(parseInt(status));
    }

    if (!isNaN(parseInt(jenisSurat))) {
      where += ` AND jenis_surat_id = $${paramIndex++}`;
      params.push(parseInt(jenisSurat) + 1);
    }

    // Restrict normal user to their own entries
    console.log(JSON.stringify(req.user));
    if (req.user.role !== 2) {
      where += ` AND user_id = $${paramIndex++}`;
      params.push(parseInt(req.user.id));
    }

    let searchSql = '';
    if (search) {
      searchSql = `
        AND (
          perihal_surat ILIKE $${paramIndex} OR
          users.name ILIKE $${paramIndex + 1} OR
          nomor_surat ILIKE $${paramIndex + 2}
        )
      `;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 3;
    }

    // Total count
    const totalRes = await logAndGet(
      `SELECT COUNT(*) as count FROM surat LEFT JOIN users ON surat.user_id = users.id ${where} ${searchSql}`,
      params
    );
    const total = parseInt(totalRes?.count || 0);

    // Get paginated documents
    const limitIndex = paramIndex++;
    const offsetIndex = paramIndex++;
    params.push(limitInt, offset);

    const documents = await logAndAll(
      `
      SELECT
        surat.id,
        surat.created_at,
        surat.user_id,
        users.name AS pemohon,
        sifat_surat,
        perihal_surat,
        jenis_surat_id,
        status,
        nomor_surat,
        tanggal_surat
      FROM surat
      LEFT JOIN users ON surat.user_id = users.id
      ${where} ${searchSql}
      ORDER BY surat.created_at DESC
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
      `,
      params
    );

    res.json({ documents, total, page: pageInt, limit: limitInt });

  } catch (err) {
    console.error('Error in GET /api/surat/entries:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/surat/entries/:id
router.patch('/:id', limiter, requireAuth, async (req, res) => {
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
      // Step 1: Get current counter from jenis_surat table
      const jenisSurat = await logAndGet('SELECT counter FROM jenis_surat WHERE id = $1', [surat.jenis_surat_id]);
      const lastNumber = parseInt(jenisSurat?.counter || 0);

      // Step 2: Build nomor_surat and increment status
      updatedNomor = replaceNoUrut(updatedNomor, lastNumber + 1);
      updatedStatus = parseInt(STATUS.APPROVED);

      // Step 3: Update counter in jenis_surat
      await logAndRun('UPDATE jenis_surat SET counter = $1 WHERE id = $2', [lastNumber + 1, surat.jenis_surat_id]);
    } else if (action === 2) {
      updatedStatus = parseInt(STATUS.REJECTED);
    }

    await logAndRun(
      'UPDATE surat SET nomor_surat = $1, status = $2 WHERE id = $3',
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
