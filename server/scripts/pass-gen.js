// hash.js
const bcrypt = require('bcrypt');

async function hashText(text) {
  try {
    const hashed = await bcrypt.hash(text, 10);
    console.log(`🔑 Input: ${text}`);
    console.log(`✅ Hashed: ${hashed}`);
  } catch (err) {
    console.error('❌ Error hashing text:', err);
  }
}

// Get text from command line arguments
const input = process.argv[2];
if (!input) {
  console.error('⚠️ Please provide a text to hash.\nUsage: node hash.js "yourText"');
  process.exit(1);
}

hashText(input);
