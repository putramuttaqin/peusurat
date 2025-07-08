const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { storage } = require('../config/server-config');

const DOCUMENTS_CSV = path.join(storage.documents.directory, storage.documents.filename);

// 1. INITIALIZATION ===========================================
const initCsvFile = () => {
  try {
    if (!fs.existsSync(storage.documents.directory)) {
      fs.mkdirSync(storage.documents.directory, { recursive: true });
    }

    if (!fs.existsSync(DOCUMENTS_CSV) || fs.statSync(DOCUMENTS_CSV).size === 0) {
      const header = [
        '\uFEFF', // UTF-8 BOM
        'Timestamp,Jenis Surat,Perihal Surat,Ruang,Pemohon,Tanggal Surat,Nomor Surat\n'
      ].join('');
      fs.writeFileSync(DOCUMENTS_CSV, header);
    }
  } catch (err) {
    console.error('CSV initialization failed:', err);
    throw err;
  }
};

// 2. FORMATTING HELPERS =======================================
const formatTimestamp = () => {
  const now = new Date();
  const pad = num => num.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const escapeCsv = (value) => {
  if (value == null) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

// 3. APPEND RECORD (NEW IMPLEMENTATION) =======================
const appendRecord = async (record) => {
  const line = [
    escapeCsv(formatTimestamp()),
    escapeCsv(record.jenisSurat),
    escapeCsv(record.perihalSurat),
    escapeCsv(record.ruangPemohon),
    escapeCsv(record.pemohon),
    escapeCsv(record.tanggalSurat),
    escapeCsv(record.nomorSurat)
  ].join(',') + '\n';

  await fs.promises.appendFile(DOCUMENTS_CSV, line);
};

// Initialize on startup
initCsvFile();

// 4. API ENDPOINTS ============================================
router.post('/submit', async (req, res) => {
  try {
    await appendRecord({
      jenisSurat: req.body.jenisSurat || '',
      perihalSurat: req.body.perihalSurat || '',
      ruangPemohon: req.body.ruangPemohon || '',
      pemohon: req.body.pemohon || '',
      tanggalSurat: req.body.tanggalSurat || '',
      nomorSurat: req.body.nomorSurat || `TEMP-${Date.now()}`
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Submission failed:', err);
    res.status(500).json({ error: 'Failed to save document' });
  }
});

// ... keep the existing /entries and /download endpoints exactly the same ...
router.get('/entries', (req, res) => {
  const results = [];

  fs.createReadStream(DOCUMENTS_CSV)
    .pipe(csv({
      headers: [
        'Timestamp',
        'Jenis Surat',
        'Perihal Surat',
        'Ruang',
        'Pemohon',
        'Tanggal Surat',
        'Nomor Surat'
      ],
      skipLines: 1, // Skip header
      strict: false // Tolerate formatting issues
    }))
    .on('data', (data) => {
      // Ensure all fields exist
      if (data.Timestamp) {
        results.push(data);
      }
    })
    .on('end', () => res.json({ documents: results }))
    .on('error', (err) => {
      console.error('CSV error:', err);
      res.status(500).json({ error: 'CSV processing failed' });
    });
});

router.get('/download', (req, res) => {
  if (!fs.existsSync(DOCUMENTS_CSV)) {
    return res.status(404).json({ error: 'No documents found' });
  }
  res.download(DOCUMENTS_CSV, `permohonan-${new Date().toISOString().slice(0, 10)}.csv`);
});

module.exports = router;