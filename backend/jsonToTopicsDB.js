// backend/jsonToTopicsDB.js
const fs = require('fs').promises; // Using promises version of fs
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const projectRoot = path.resolve(__dirname, '../');
const DEFAULT_TOPICS_JSON_PATH = path.join(__dirname, 'topics.json'); // Updated default
const TOPICS_DB_PATH = process.env.TOPICS_DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.TOPICS_DATABASE_FILE_PATH.startsWith('./') ? process.env.TOPICS_DATABASE_FILE_PATH.substring(2) : process.env.TOPICS_DATABASE_FILE_PATH)
  : path.join(__dirname, 'quizTopics.db'); // Corrected DB name if it was quiz_topics.db previously

const question = (query) => new Promise(resolve => readline.question(query, resolve));

// Promisify db methods
const promisifyDb = (db) => {
  return {
    run: (sql, params = []) => new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    }),
    get: (sql, params = []) => new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    })
  };
};

async function migrateTopicsJsonToDb() {
  console.log('--- Topics JSON to SQLite Migration Tool ---');

  const jsonFilePathInput = await question(`Enter path to your JSON topics file (default: ./topics.json in backend): `) || DEFAULT_TOPICS_JSON_PATH;
  const jsonFilePath = path.resolve(__dirname, jsonFilePathInput);

  console.log(`\nJSON Source: ${jsonFilePath}`);
  console.log(`SQLite Target: ${TOPICS_DB_PATH}\n`);

  const confirm = await question('This script will read the JSON file and insert/update data into the quiz_topics table. Proceed? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes') {
    console.log('Migration aborted by user.');
    readline.close();
    return;
  }

  const db = new sqlite3.Database(TOPICS_DB_PATH, (err) => {
    if (err) {
      console.error('[DB_ERROR] Could not connect to/create topics database:', err.message);
      readline.close();
      process.exit(1);
    }
    console.log('[DB_INFO] Connected to SQLite topics database:', TOPICS_DB_PATH);
  });

  const { run: dbRun } = promisifyDb(db); // Removed dbGet as it's not used here

  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS quiz_topics (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        class TEXT,
        genre TEXT,
        subject TEXT NOT NULL
      )
    `);
    console.log('[DB_INFO] "quiz_topics" table ensured.');

    let topicsArray = [];
    try {
      const fileContent = await fs.readFile(jsonFilePath, 'utf8');
      topicsArray = JSON.parse(fileContent);
      if (!Array.isArray(topicsArray)) {
        console.error('[JSON_ERROR] The provided JSON file does not contain an array of topics.');
        readline.close();
        db.close();
        return;
      }
    } catch (err) {
      console.error(`[JSON_ERROR] Failed to read or parse JSON file "${jsonFilePath}":`, err.message);
      readline.close();
      db.close();
      return;
    }

    if (topicsArray.length === 0) {
      console.log('[INFO] JSON file is empty. Nothing to import.');
      readline.close();
      db.close();
      return;
    }
    console.log(`[INFO] Found ${topicsArray.length} topics in JSON file.`);

    const insertSql = `
      INSERT OR REPLACE INTO quiz_topics 
      (id, name, description, class, genre, subject) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    let insertedOrReplacedCount = 0;
    let skippedCount = 0;

    for (const topic of topicsArray) {
      if (!topic.id || !topic.name || !topic.subject) {
        console.warn(`[SKIP] Skipping topic due to missing id, name, or subject: ${JSON.stringify(topic).substring(0,100)}...`);
        skippedCount++;
        continue;
      }

      const params = [
        topic.id,
        topic.name,
        topic.description || null,
        topic.class || null,
        topic.genre || null,
        topic.subject.toLowerCase() 
      ];

      try {
        const result = await dbRun(insertSql, params);
        if (result.changes > 0) {
          insertedOrReplacedCount++;
        } else {
            console.log(`[INFO] No changes for topic ID ${topic.id} (might already exist and data is identical if using INSERT OR IGNORE).`);
        }
      } catch (err) {
        console.error(`[DB_ERROR] Failed to insert/replace topic ID ${topic.id} for subject ${topic.subject}:`, err.message);
      }
    }

    console.log("\n--- Migration Summary ---");
    console.log(`Total topics in JSON file: ${topicsArray.length}`);
    console.log(`Successfully inserted/replaced in DB: ${insertedOrReplacedCount}`);
    console.log(`Skipped (due to missing fields): ${skippedCount}`);
    console.log("-------------------------");

  } catch (error) {
    console.error('[ERROR] An critical error occurred during migration:', error);
  } finally {
    db.close((err) => {
      if (err) console.error('[DB_ERROR] Error closing database:', err.message);
      else console.log('[DB_INFO] Database connection closed.');
      readline.close();
    });
  }
}

migrateTopicsJsonToDb();