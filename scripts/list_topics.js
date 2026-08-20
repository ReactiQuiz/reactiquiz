// scripts/list_topics.js
const fs = require('fs');
const path = require('path');

const possiblePaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../api/.env'),
  path.resolve(__dirname, '../web/.env')
];

for (const envPath of possiblePaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          const key = trimmed.substring(0, idx).trim();
          let val = trimmed.substring(idx + 1).trim();
          val = val.replace(/^["']|["']$/g, '').trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
}

const { turso } = require('../api/_utils/tursoClient');

(async () => {
  try {
    const r = await turso.execute('SELECT id, name, subject_id FROM quiz_topics');
    console.log('Found', r.rows.length, 'topics:');
    console.log(JSON.stringify(r.rows, null, 2));
  } catch (e) {
    console.error('Query error:', e);
  }
})();
