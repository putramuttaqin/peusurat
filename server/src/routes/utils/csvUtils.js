const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { storage } = require('../../config/server-config');
const { formatTimestamp, escapeCsv } = require('./formatUtils');

const DOCUMENTS_CSV = path.join(storage.documents.directory, storage.documents.filename);

// Initialize CSV file
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

// Get next available ID
const getNextId = () => {
  if (!fs.existsSync(DOCUMENTS_CSV)) return 2;

  const lineCount = fs.readFileSync(DOCUMENTS_CSV, 'utf8')
    .split('\n')
    .filter(line => line.trim()).length;

  return lineCount;
};

// Append record to CSV
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

const updateDocuments = async (documents) => {
  const header = 'ID,Timestamp,Jenis Surat,Perihal Surat,Ruang,Pemohon,Tanggal Surat,Nomor Surat,Status\n';
  const csvContent = header + documents.map(doc => 
    Object.values(doc).map(field => escapeCsv(field)).join(',')
  ).join('\n');

  await fs.promises.writeFile(DOCUMENTS_CSV, '\uFEFF' + csvContent, 'utf8');
};

// Read all documents from CSV
const readAllDocuments = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(DOCUMENTS_CSV)
      .pipe(csv({
        headers: [
          'ID', 'Timestamp', 'Jenis Surat', 'Perihal Surat',
          'Ruang', 'Pemohon', 'Tanggal Surat', 'Nomor Surat', 'Status'
        ],
        skipLines: 1,
        strict: false
      }))
      .on('data', (data) => {
        if (data.Timestamp) results.push(data);
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

module.exports = {
  DOCUMENTS_CSV,
  initCsvFile,
  getNextId,
  appendRecord,
  readAllDocuments,
  updateDocuments
};