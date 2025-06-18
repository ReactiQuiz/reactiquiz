// backend/jsonToSubjectsDB.js
const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const projectRoot = path.resolve(__dirname, '../');
const DEFAULT_SUBJECTS_JSON_PATH = path.join(__dirname, 'subjects.json');
const SUBJECTS_DB_PATH = process.env.SUBJECTS_DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.SUBJECTS_DATABASE_FILE_PATH.startsWith('./') ? process.env.SUBJECTS_DATABASE_FILE_PATH.substring(2) : process.env.SUBJECTS_DATABASE_FILE_PATH)
  : path.join(__dirname, 'subjects.db');

const question = (query) => new Promise(resolve => readline.question(query, resolve));

// Promisify db methods
const promisifyDb = (db) => {
  return {
    run: (sql, params = []) => new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    })
  };
};

async function migrateSubjectsJsonToDb() {
  console.log('--- Subjects JSON to SQLite Migration Tool ---');

  const jsonFilePathInput = await question(`Enter path to your JSON subjects file (default: ./subjects.json in backend): `) || DEFAULT_SUBJECTS_JSON_PATH;
  const jsonFilePath = path.resolve(__dirname, jsonFilePathInput);

  console.log(`\nJSON Source: ${jsonFilePath}`);
  console.log(`SQLite Target: ${SUBJECTS_DB_PATH}\n`);

  const confirm = await question('This script will read the JSON file and insert/update data into the subjects table. Proceed? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes') {
    console.log('Migration aborted by user.');
    readline.close();
    return;
  }

  const db = new sqlite3.Database(SUBJECTS_DB_PATH, (err) => {
    if (err) {
      console.error('[DB_ERROR] Could not connect to/create subjects database:', err.message);
      readline.close();
      process.exit(1);
    }
    console.log('[DB_INFO] Connected to SQLite subjects database:', SUBJECTS_DB_PATH);
  });

  const { run: dbRun } = promisifyDb(db);

  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        accentColor TEXT NOT NULL,
        iconName TEXT,
        displayOrder INTEGER UNIQUE,
        subjectKey TEXT NOT NULL
      )
    `);
    console.log('[DB_INFO] "subjects" table ensured.');

    let subjectsArray = [];
    try {
      const fileContent = await fs.readFile(jsonFilePath, 'utf8');
      subjectsArray = JSON.parse(fileContent);
      if (!Array.isArray(subjectsArray)) {
        console.error('[JSON_ERROR] The provided JSON file does not contain an array of subjects.');
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

    if (subjectsArray.length === 0) {
      console.log('[INFO] JSON file is empty. Nothing to import.');
      readline.close();
      db.close();
      return;
    }
    console.log(`[INFO] Found ${subjectsArray.length} subjects in JSON file.`);

    const insertSql = `
      INSERT OR REPLACE INTO subjects
      (id, name, description, accentColor, iconName, displayOrder, subjectKey)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    let insertedOrReplacedCount = 0;
    let skippedCount = 0;

    for (const subject of subjectsArray) {
      if (!subject.id || !subject.name || !subject.accentColor || !subject.displayOrder || !subject.subjectKey) {
        console.warn(`[SKIP] Skipping subject due to missing required fields (id, name, accentColor, displayOrder, subjectKey): ${JSON.stringify(subject).substring(0,100)}...`);
        skippedCount++;
        continue;
      }

      const params = [
        subject.id,
        subject.name,
        subject.description || null,
        subject.accentColor,
        subject.iconName || null,
        subject.displayOrder,
        subject.subjectKey
      ];

      try {
        const result = await dbRun(insertSql, params);
        if (result.changes > 0) {
          insertedOrReplacedCount++;
        } else {
            console.log(`[INFO] No changes for subject ID ${subject.id}.`);
        }
      } catch (err) {
        console.error(`[DB_ERROR] Failed to insert/replace subject ID ${subject.id}:`, err.message);
      }
    }

    console.log("\n--- Migration Summary ---");
    console.log(`Total subjects in JSON file: ${subjectsArray.length}`);
    console.log(`Successfully inserted/replaced in DB: ${insertedOrReplacedCount}`);
    console.log(`Skipped (due to missing fields): ${skippedCount}`);
    console.log("-------------------------");

  } catch (error) {
    console.error('[ERROR] A critical error occurred during migration:', error);
  } finally {
    db.close((err) => {
      if (err) console.error('[DB_ERROR] Error closing database:', err.message);
      else console.log('[DB_INFO] Database connection closed.');
      readline.close();
    });
  }
}

migrateSubjectsJsonToDb();