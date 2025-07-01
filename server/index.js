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

// GET /last-number → get last used nomorSurat number
app.get('/last-number', (req, res) => {
  if (!fs.existsSync(CSV_PATH)) {
    return res.json({ lastNumber: 100 });
  }

  const results = [];

  fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      if (results.length === 0) {
        return res.json({ lastNumber: 100 });
      }

      const lastEntry = results[results.length - 1];
      const nomorSurat = lastEntry['Nomor Surat'];
      const lastNumber = parseInt(nomorSurat?.split('-').pop(), 10);

      res.json({ lastNumber: isNaN(lastNumber) ? 100 : lastNumber });
    })
    .on('error', (err) => {
      console.error('Error reading CSV:', err);
      res.status(500).json({ error: 'Failed to read CSV' });
    });
});

// GET /download → download CSV file
app.get('/download', (req, res) => {
  res.download(CSV_PATH, 'nomor-surat.csv');
});

app.listen(PORT, () => {
  console.log(`✅ Server ready at http://localhost:${PORT}`);
});
