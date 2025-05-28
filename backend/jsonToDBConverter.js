const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const projectRoot = path.resolve(__dirname, '../');
const DEFAULT_DB_NAME = 'quiz_data.db';
const DEFAULT_DB_PATH = path.join(__dirname, DEFAULT_DB_NAME);

const question = (query) => new Promise(resolve => readline.question(query, resolve));

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
  console.log("\n\t\t\t\t\t--- JSON to SQLite Converter ---\n");

  const jsonFilePathInput = await question(`[ASK][JSON] Enter path to JSON question file (relative to this file) : `);
  const jsonFilePath = path.resolve(__dirname, jsonFilePathInput);  

  const dbFilePathInput = await question(`[ASK][DB] Enter path for SQLite DB file (default: ./quiz_data.db)    : `) || DEFAULT_DB_PATH;
  const dbFilePath = path.resolve(__dirname, dbFilePathInput);

  console.log("\n");
  console.log(`[CONFORM][JSON] JSON Source: ${jsonFilePath}`);
  console.log(`[CONFORM][DB] SQLite Target: ${dbFilePath}\n`);

  const confirm = await question('Proceed with conversion? (Yes[y]/No[n]): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('Conversion aborted.');
    readline.close();
    return;
  } else {
    console.log("\n");
  }

  const db = new sqlite3.Database(dbFilePath, (err) => {
    if (err) {
      console.error('[ERROR][DB] Could not connect to/create database:', err.message);
      readline.close();
      process.exit(1);
    }
    console.log('[INFO][DB] Connected to SQLite database:', dbFilePath);
  });

  const { run: dbRun, get: dbGet } = promisifyDb(db);

  try {
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
    console.log('[INFO][DB] Questions[questions] table ensured.');

    let questionsArray = [];
    try {
      const fileContent = await fs.readFile(jsonFilePath, 'utf8');
      questionsArray = JSON.parse(fileContent);
      if (!Array.isArray(questionsArray)) {
        console.error('[ERROR][JSON] The provided JSON file does not contain an array of questions.');
        return;
      }
    } catch (err) {
      console.error(`[ERROR][JSON] Failed to read or parse JSON file "${jsonFilePath}":`, err.message);
      return;
    }

    if (questionsArray.length === 0) {
      console.log('[INFO][JSON] JSON file is empty. Nothing to import.');
      return;
    }
    console.log(`[INFO] Found ${questionsArray.length} questions in JSON file.`);

    const insertSql = `
      INSERT OR IGNORE INTO questions 
      (id, topicId, text, options, correctOptionId, explanation, difficulty) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    let insertedCount = 0;
    let skippedCount = 0;

    for (const q of questionsArray) {
      if (!q.id || !q.topicId || !q.text || !q.options || !q.correctOptionId) {
        console.warn(`[WARN][JSON] Skipping question due to missing required fields: ${JSON.stringify(q).substring(0, 100)}...`);
        skippedCount++;
        continue;
      }

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
        } else if (existing) {
          skippedCount++;
        } else {
          console.warn(`[WARN] No changes for question ID ${q.id}, and it wasn't found prior.`)
        }
      } catch (err) {
        console.error(`[DB_ERROR] Failed to insert/replace question ID ${q.id}:`, err.message);
      }
    }

    console.log("\n");
    console.log(`|====================== Migration Summary ======================|`);
    console.log(`|Successfully inserted/updated                            : ${insertedCount}\t|`);
    console.log(`|Skipped (data already exists or missing fields)          : ${skippedCount}\t|`);
    console.log(`|---------------------------------------------------------+-----|`);
    console.log(`|Total questions in JSON                                  : ${questionsArray.length}\t|`);
    console.log(`|===============================================================|`);
    console.log("\n");

  } catch (error) {
    console.error('[ERROR][DB] An error occurred during conversion:', error);
  } finally {
    db.close((err) => {
      if (err) console.error('[ERROR][DB] Error closing database:', err.message);
      else console.log('\n[INFO][DB] Database connection closed.');
      readline.close();
    });
  }
}

convertJsonToDb();