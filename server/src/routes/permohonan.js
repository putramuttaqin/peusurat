const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { storage } = require('../config/server-config');

const DOCUMENTS_CSV = path.join(storage.documents.directory, storage.documents.filename);

// 1. ENSURE HEADER EXISTS ======================================
const initCsvFile = () => {
  try {
    if (!fs.existsSync(storage.documents.directory)) {
      fs.mkdirSync(storage.documents.directory, { recursive: true });
      console.log(`Created directory: ${storage.documents.directory}`);
    }

    // Check if file is empty or doesn't exist
    const needsHeader = !fs.existsSync(DOCUMENTS_CSV) ||
      fs.statSync(DOCUMENTS_CSV).size === 0;

    if (needsHeader) {
      const header = [
        '\uFEFF', // UTF-8 BOM
        'Timestamp,Perihal Surat,Ruang Pemohon,Pemohon,Tanggal Surat,Nomor Surat\n'
      ].join('');
      fs.writeFileSync(DOCUMENTS_CSV, header);
      console.log('Initialized CSV with headers');
    }
  } catch (err) {
    console.error('Failed to initialize CSV:', err);
    throw err;
  }
};

// 2. RECORD FORMATTING ========================================
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

// 3. RECORD WRITING ===========================================
const appendRecord = async (record) => {
  const line = [
    escapeCsv(formatTimestamp()),
    escapeCsv(record.perihalSurat),
    escapeCsv(record.ruangPemohon),
    escapeCsv(record.pemohon),
    escapeCsv(record.tanggalSurat),
    escapeCsv(record.nomorSurat)
  ].join(',') + '\n';

  await fs.promises.appendFile(DOCUMENTS_CSV, line);
};

// 4. INITIALIZE ON STARTUP ====================================
initCsvFile();

// 5. API ENDPOINTS ============================================
router.post('/submit', async (req, res) => {
  try {
    await appendRecord({
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

router.get('/entries', (req, res) => {
  const results = [];
  
  fs.createReadStream(DOCUMENTS_CSV)
    .pipe(csv({
      headers: [
        'Timestamp', 
        'Perihal Surat', 
        'Ruang Pemohon', 
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