const bcrypt = require('bcrypt');
const { pool } = require('../src/config/db'); // adjust path as needed

async function createAdmin() {
  const hashed = await bcrypt.hash('asd', 10);
  await pool.query(
    'INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4)',
    ['Admin', 'asd', hashed, 1]
  );
  console.log('✅ Admin user created.');
  await pool.end();
}

createAdmin().catch(err => {
  console.error('❌ Error creating admin:', err);
});
