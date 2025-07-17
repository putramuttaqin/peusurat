const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, '../../data/sinomor.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS surat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jenis_surat INTEGER,
    ruang INTEGER,
    status INTEGER,
    perihal_surat TEXT,
    pemohon TEXT,
    nomor_surat TEXT,
    reason TEXT DEFAULT NULL,
    email TEXT DEFAULT NULL,
    tanggal_surat TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

module.exports = db;