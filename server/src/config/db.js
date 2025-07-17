const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/sinomor.db');
const db = new Database(dbPath);

// Init table
db.exec(`
CREATE TABLE IF NOT EXISTS surat (
  id TEXT PRIMARY KEY,
  jenis_surat SMALLINT,
  ruang SMALLINT,
  status SMALLINT,
  tanggal_surat DATE,
  nomor_surat TEXT,
  perihal_surat TEXT,
  pemohon TEXT,
  reason TEXT DEFAULT NULL,
  email TEXT DEFAULT NULL
);
`);

module.exports = db;