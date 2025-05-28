// backend/jsonToDBConverter.js
const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // For .env in project root

const projectRoot = path.resolve(__dirname, '../'); // Assuming this script is in backend/
const DEFAULT_DB_NAME = 'quiz_data.db'; // New DB for questions, or could be same as results
const DEFAULT_DB_PATH = path.join(__dirname, DEFAULT_DB_NAME);

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


async function convertJsonToDb() {
  console.log('--- JSON to SQLite Question Converter ---');

  const jsonFilePathInput = await question(`Enter path to JSON question file (e.g., ./questions/physics.json): `);
  const jsonFilePath = path.resolve(__dirname, jsonFilePathInput); // Resolve relative to backend dir

  const dbFilePathInput = await question(`Enter path for SQLite DB file (default: ./quiz_data.db in backend): `) || DEFAULT_DB_PATH;
  const dbFilePath = path.resolve(__dirname, dbFilePathInput);
  
  console.log(`\nJSON Source: ${jsonFilePath}`);
  console.log(`SQLite Target: ${dbFilePath}\n`);

  const confirm = await question('Proceed with conversion? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes') {
    console.log('Conversion aborted.');
    readline.close();
    return;
  }

  const db = new sqlite3.Database(dbFilePath, (err) => {
    if (err) {
      console.error('[DB_ERROR] Could not connect to/create database:', err.message);
      readline.close();
      process.exit(1);
    }
    console.log('[DB_INFO] Connected to SQLite database:', dbFilePath);
  });

  const { run: dbRun, get: dbGet } = promisifyDb(db);

  try {
    // 1. Create questions table if it doesn't exist
    await dbRun(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,          -- Original ID from JSON
        topicId TEXT NOT NULL,        -- subject column removed
        text TEXT NOT NULL,
        options TEXT NOT NULL,        -- Store as JSON string
        correctOptionId TEXT NOT NULL,
        explanation TEXT,
        difficulty INTEGER
      )
    `);
    console.log('[DB_INFO] "questions" table ensured.');

    // 2. Read JSON data
    let questionsArray = [];
    try {
      const fileContent = await fs.readFile(jsonFilePath, 'utf8');
      questionsArray = JSON.parse(fileContent);
      if (!Array.isArray(questionsArray)) {
        console.error('[JSON_ERROR] The provided JSON file does not contain an array of questions.');
        return;
      }
    } catch (err) {
      console.error(`[JSON_ERROR] Failed to read or parse JSON file "${jsonFilePath}":`, err.message);
      return;
    }

    if (questionsArray.length === 0) {
      console.log('[INFO] JSON file is empty. Nothing to import.');
      return;
    }
    console.log(`[INFO] Found ${questionsArray.length} questions in JSON file.`);

    // 3. Insert/Append data into SQLite
    const insertSql = `
      INSERT OR IGNORE INTO questions 
      (id, topicId, text, options, correctOptionId, explanation, difficulty) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    // Use INSERT OR REPLACE if you want to update existing questions with the same ID
    // const insertSql = `INSERT OR REPLACE INTO questions ...`; 
    
    let insertedCount = 0;
    let skippedCount = 0;

    for (const q of questionsArray) {
      if (!q.id || !q.topicId || !q.text || !q.options || !q.correctOptionId) {
        console.warn(`[SKIP] Skipping question due to missing required fields: ${JSON.stringify(q).substring(0,100)}...`);
        skippedCount++;
        continue;
      }

      // Check if question ID already exists to decide if it's an update or new insert for logging
      const existing = await dbGet('SELECT id FROM questions WHERE id = ?', [q.id]);

      const params = [
        q.id,
        q.topicId,
        q.text,
        JSON.stringify(q.options || []),
        q.correctOptionId,
        q.explanation || null,
        q.difficulty || null
      ];

      try {
        const result = await dbRun(insertSql, params);
        if (result.changes > 0) {
          insertedCount++;
          if (existing) {
            // console.log(`[UPDATE] Question ID ${q.id} updated.`); // If using INSERT OR REPLACE
          } else {
            // console.log(`[INSERT] Question ID ${q.id} inserted.`);
          }
        } else if(existing) {
          // console.log(`[SKIP] Question ID ${q.id} already exists (used INSERT OR IGNORE).`);
          skippedCount++;
        } else {
            // This case should ideally not happen with INSERT OR IGNORE if there's no error
            console.warn(`[WARN] No changes for question ID ${q.id}, and it wasn't found prior.`)
        }
      } catch (err) {
        console.error(`[DB_ERROR] Failed to insert/replace question ID ${q.id}:`, err.message);
      }
    }

    console.log(`\n--- Migration Summary ---`);
    console.log(`Total questions in JSON: ${questionsArray.length}`);
    console.log(`Successfully inserted/updated: ${insertedCount}`);
    console.log(`Skipped (missing fields or already exists with IGNORE): ${skippedCount}`);
    console.log(`-------------------------`);


  } catch (error) {
    console.error('[ERROR] An error occurred during conversion:', error);
  } finally {
    db.close((err) => {
      if (err) console.error('[DB_ERROR] Error closing database:', err.message);
      else console.log('[DB_INFO] Database connection closed.');
      readline.close();
    });
  }
}

convertJsonToDb();