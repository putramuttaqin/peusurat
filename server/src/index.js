const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const csv = require('csv-parser');

const app = express();
const PORT = 3001;
const CSV_PATH = path.join(__dirname, 'nomor-surat.csv');

app.use(cors());
app.use(express.json());

// Ensure CSV file exists with headers
if (!fs.existsSync(CSV_PATH)) {
  fs.writeFileSync(
    CSV_PATH,
    'Tanggal,Nomor Surat,Tanggal Surat,Divisi,Keterangan\n'
  );
}

const csvWriter = createObjectCsvWriter({
  path: CSV_PATH,
  header: [
    { id: 'tanggal', title: 'Tanggal' }, // New submission date field
    { id: 'nomorSurat', title: 'Nomor Surat' },
    { id: 'tanggalSurat', title: 'Tanggal Surat' },
    { id: 'divisi', title: 'Divisi' },
    { id: 'keterangan', title: 'Keterangan' },
  ],
  append: true,
});

// POST /submit → append one record to CSV
app.post('/submit', async (req, res) => {
  try {
    const submissionTime = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const entryWithTimestamp = {
      ...req.body,
      tanggal: submissionTime, // This is the actual submission date
    };

    await csvWriter.writeRecords([entryWithTimestamp]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /entries → return all entries as JSON
app.get('/entries', (req, res) => {
  const results = [];

  fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => res.json(results))
    .on('error', (err) => {
      console.error('Error reading CSV:', err);
      res.status(500).json({ error: 'Failed to read CSV' });
    });
});

// GET /download → download CSV file
app.get('/download', (req, res) => {
  res.download(CSV_PATH, 'nomor-surat.csv');
});

const PERMOHONAN_CSV = path.join(__dirname, 'permohonan-surat.csv');

// Ensure permohonan CSV exists
if (!fs.existsSync(PERMOHONAN_CSV)) {
  fs.writeFileSync(
    PERMOHONAN_CSV,
    'Tanggal,Jam,Perihal Surat,Ruang Pemohon,Pemohon,Tanggal Surat,Nomor Surat\n'
  );
}

const permohonanWriter = createObjectCsvWriter({
  path: PERMOHONAN_CSV,
  header: [
    { id: 'tanggal', title: 'Tanggal' },
    { id: 'jam', title: 'Jam' },
    { id: 'perihalSurat', title: 'Perihal Surat' },
    { id: 'ruangPemohon', title: 'Ruang Pemohon' },
    { id: 'pemohon', title: 'Pemohon' },
    { id: 'tanggalSurat', title: 'Tanggal Surat' },
    { id: 'nomorSurat', title: 'Nomor Surat' }
  ],
  append: true
});

// Modify the /submit-permohonan endpoint
app.post('/submit-permohonan', async (req, res) => {
  try {
    const now = new Date();
    const record = {
      tanggal: now.toLocaleDateString('en-US'), // e.g. "6/19/2025"
      jam: now.toLocaleTimeString('en-US', { hour12: false }), // e.g. "13:00:00"
      perihalSurat: req.body.perihalSurat,
      ruangPemohon: req.body.ruangPemohon,
      pemohon: req.body.pemohon,
      tanggalSurat: req.body.tanggalSurat,
      nomorSurat: req.body.nomorSurat // Store exactly as received (with xyz)
    };

    await permohonanWriter.writeRecords([record]);
    res.json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server ready at http://localhost:${PORT}`);
});
