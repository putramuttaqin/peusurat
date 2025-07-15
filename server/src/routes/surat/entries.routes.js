const fs = require('fs');
const express = require('express');
const router = express.Router();
const path = require('path');
const rateLimit = require('express-rate-limit');
const { checkAdmin } = require('../../middleware/auth');
const { updateDocuments, readAllDocuments, DOCUMENTS_CSV } = require('../utils/csvUtils');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
const STATUS = {
  PENDING: '0',
  APPROVED: '1',
  REJECTED: '2'
};

router.get('/', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      status,
      jenisSurat,
      ruang,
      page = parseInt(req.query.page) || 1,
      limit = parseInt(req.query.limit) || 20
    } = req.query;

    const documents = await readAllDocuments();

    // Filter logic
    let filtered = documents.filter((doc) => {
      const docDate = new Date(doc['Tanggal Surat']);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      return (
        (!start || docDate >= start) &&
        (!end || docDate <= end) &&
        (!status || doc.Status === status) &&
        (!jenisSurat || doc['Jenis Surat'] === jenisSurat) &&
        (!ruang || doc.Ruang === ruang)
      );
    });

    // Pagination logic
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginated = filtered.slice(startIndex, endIndex);

    console.log('Sending response:', {
      filters: { startDate, endDate, status, jenisSurat, ruang },
      total: filtered.length,
      page,
      limit,
      resultCount: paginated.length
    });

    res.json({
      documents: paginated,
      total: filtered.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Error in GET /api/surat/entries:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin-only approval
router.patch('/:id', limiter, checkAdmin, async (req, res) => {
  try {
    const docId = req.params.id;
    const { action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const REGISTERS_JSON = path.join(path.dirname(DOCUMENTS_CSV), 'registers.json');

    // Load register counters
    let registers = {};
    if (fs.existsSync(REGISTERS_JSON)) {
      registers = JSON.parse(fs.readFileSync(REGISTERS_JSON, 'utf8'));
    } else {
      registers = {
        "BUKU KELUAR UMUM": 1,
        "SK KAKANWIL": 1,
        "BUKU KELUAR YANKUM": 1,
        "BUKU MASUK UMUM": 1,
        "BUKU SURAT PERINTAH": 1,
        "BUKU CUTI": 1,
        "BUKU KELUAR PLH/PLT": 1,
        "BUKU KELUAR P2L": 1,
        "BUKU MASUK P2L": 1,
        "BUKU MASUK YANKUM": 1
      };
    }

    // Process approval
    const documents = await readAllDocuments();
    const targetDoc = documents.find(doc => doc.ID === docId);

    if (!targetDoc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const jenisSurat = targetDoc['Jenis Surat'];
    if (!registers[jenisSurat]) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    // Update document
    if (action === "approve") {
      const currentNumber = registers[jenisSurat];
      targetDoc['Nomor Surat'] = targetDoc['Nomor Surat'].replace('xyz', currentNumber);
      targetDoc['Status'] = STATUS.APPROVED;
      registers[jenisSurat] = currentNumber + 1;
      fs.writeFileSync(REGISTERS_JSON, JSON.stringify(registers, null, 2));
    } else if (action === "reject") {
      targetDoc['Status'] = STATUS.REJECTED;
    } else {
      return res.status(422).json({ error: `Invalid State ${action}` });
    }

    // Save changes (using utility)
    await updateDocuments(documents); // Replaces manual CSV writing

    const responseData = {
      success: true,
      updatedDocument: targetDoc
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error('state change error:', err); // Consistent logging
    if (err.message === 'Admin access required') {
      res.status(403).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;