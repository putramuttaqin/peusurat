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
        'ID,Timestamp,Jenis Surat,Perihal Surat,Ruang,Pemohon,Tanggal Surat,Nomor Surat,Status\n'
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

// 2. Get next available ID (row number)
const getNextId = () => {
  if (!fs.existsSync(DOCUMENTS_CSV)) return 2; // First data row

  const lineCount = fs.readFileSync(DOCUMENTS_CSV, 'utf8')
    .split('\n')
    .filter(line => line.trim()).length;

  return lineCount; // Header = 1, next row = 2
};

// 3. APPEND RECORD (NEW IMPLEMENTATION) =======================
const appendRecord = async (record) => {
  const line = [
    escapeCsv(getNextId()),
    escapeCsv(formatTimestamp()),
    escapeCsv(record.jenisSurat),
    escapeCsv(record.perihalSurat),
    escapeCsv(record.ruangPemohon),
    escapeCsv(record.pemohon),
    escapeCsv(record.tanggalSurat),
    escapeCsv(record.nomorSurat),
    escapeCsv(record.status)
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
      nomorSurat: req.body.nomorSurat || `TEMP-${Date.now()}`,
      status: 'proposed'
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
        'ID',
        'Timestamp',
        'Jenis Surat',
        'Perihal Surat',
        'Ruang',
        'Pemohon',
        'Tanggal Surat',
        'Nomor Surat',
        'Status'
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

// 5. APPROVE DOCUMENT =========================================
router.post('/approve/:id', async (req, res) => {
  try {
    const docId = req.params.id;
    const REGISTERS_JSON = path.join(storage.documents.directory, 'registers.json');

    // 1. Load register counters
    let registers = {};
    if (fs.existsSync(REGISTERS_JSON)) {
      registers = JSON.parse(fs.readFileSync(REGISTERS_JSON, 'utf8'));
    } else {
      // Initialize if file doesn't exist
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

    // 2. Read CSV and find document
    const rows = [];
    let targetRow = null;
    let header = null;

    await new Promise((resolve, reject) => {
      fs.createReadStream(DOCUMENTS_CSV)
        .pipe(csv({
          headers: [
            'ID',
            'Timestamp',
            'Jenis Surat',
            'Perihal Surat',
            'Ruang',
            'Pemohon',
            'Tanggal Surat',
            'Nomor Surat',
            'Status'
          ],
          skipLines: 1
        }))
        .on('data', (row) => {
          if (row.ID === docId) {
            targetRow = row;
          }
          rows.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (!targetRow) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // 3. Update document number and status
    const jenisSurat = targetRow['Jenis Surat'];
    if (!registers[jenisSurat]) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    const currentNumber = registers[jenisSurat];
    targetRow['Nomor Surat'] = targetRow['Nomor Surat'].replace('xyz', currentNumber);
    targetRow['Status'] = 'approved';

    // 4. Increment counter
    registers[jenisSurat] = currentNumber + 1;

    // 5. Save updated registers
    fs.writeFileSync(REGISTERS_JSON, JSON.stringify(registers, null, 2));

    // 6. Rebuild CSV with updated row
    const headerLine = 'ID,Timestamp,Jenis Surat,Perihal Surat,Ruang,Pemohon,Tanggal Surat,Nomor Surat,Status\n';
    const updatedRows = rows.map(row => {
      if (row.ID === docId) {
        return targetRow;
      }
      return row;
    });

    const csvContent = headerLine + updatedRows.map(row =>
      Object.values(row).map(field => escapeCsv(field)).join(',')
    ).join('\n');

    fs.writeFileSync(DOCUMENTS_CSV, '\uFEFF' + csvContent, 'utf8');

    res.status(200).json({
      success: true,
      newNumber: currentNumber,
      updatedDocument: targetRow
    });

  } catch (err) {
    console.error('Approval failed:', err);
    res.status(500).json({ error: 'Failed to approve document' });
  }
});

router.get('/download', (req, res) => {
  if (!fs.existsSync(DOCUMENTS_CSV)) {
    return res.status(404).json({ error: 'No documents found' });
  }
  res.download(DOCUMENTS_CSV, `permohonan-${new Date().toISOString().slice(0, 10)}.csv`);
});

module.exports = router;