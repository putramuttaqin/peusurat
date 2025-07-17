const db = require('../src/config/db');

// Show all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables);

// Show row count in surat table
const rows = db.prepare('SELECT COUNT(*) AS count FROM surat').get();
console.log(`Surat table contains ${rows.count} rows.`);

console.log('Dummy row inserted');
