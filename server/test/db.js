const db = require('../src/config/db');

// Show all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables);

// Show row count in surat table
const rows = db.prepare('SELECT COUNT(*) AS count FROM surat').get();
console.log(`Surat table contains ${rows.count} rows.`);

// Insert a dummy row (no need to specify id if it's auto-increment)
const insert = db.prepare(`
  INSERT INTO surat (
    jenis_surat, perihal_surat, ruang, pemohon, tanggal_surat, nomor_surat, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insert.run(
  0, // jenis_surat
  'Contoh Surat',
  1, // ruang
  'Putra',
  '2025-07-17',
  '001/SNM/2025',
  0 // status: pending
);

console.log('Dummy row inserted');
