// backend/jsonToQuestionsDB.js
const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const projectRoot = path.resolve(__dirname, '../');
const DEFAULT_QUESTIONS_JSON_PATH = path.join(__dirname, 'questions.json'); // Updated default
const QUESTIONS_DB_PATH = process.env.QUESTIONS_DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.QUESTIONS_DATABASE_FILE_PATH.startsWith('./') ? process.env.QUESTIONS_DATABASE_FILE_PATH.substring(2) : process.env.QUESTIONS_DATABASE_FILE_PATH)
  : path.join(__dirname, 'quizData.db'); // Correct DB name

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

async function convertJsonToQuestionsDb() {
  console.log('--- JSON to SQLite Question Converter ---');

  const jsonFilePathInput = await question(`Enter path to JSON question file (default: ./questions.json in backend): `) || DEFAULT_QUESTIONS_JSON_PATH;
  const jsonFilePath = path.resolve(__dirname, jsonFilePathInput);

  console.log(`\nJSON Source: ${jsonFilePath}`);
  console.log(`SQLite Target: ${QUESTIONS_DB_PATH}\n`);

  const confirm = await question('Proceed with conversion? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes') {
    console.log('Conversion aborted.');
    readline.close();
    return;
  }

  const db = new sqlite3.Database(QUESTIONS_DB_PATH, (err) => {
    if (err) {
      console.error('[DB_ERROR] Could not connect to/create questions database:', err.message);
      readline.close();
      process.exit(1);
    }
    console.log('[DB_INFO] Connected to SQLite questions database:', QUESTIONS_DB_PATH);
  });

  const { run: dbRun, get: dbGet } = promisifyDb(db);

  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        topicId TEXT NOT NULL,
        text TEXT NOT NULL,
        options TEXT NOT NULL,
        correctOptionId TEXT NOT NULL,
        explanation TEXT,
        difficulty INTEGER
      )
    `);
    console.log('[DB_INFO] "questions" table ensured.');

    let questionsArray = [];
    try {
      const fileContent = await fs.readFile(jsonFilePath, 'utf8');
      questionsArray = JSON.parse(fileContent);
      if (!Array.isArray(questionsArray)) {
        console.error('[JSON_ERROR] The provided JSON file does not contain an array of questions.');
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

    if (questionsArray.length === 0) {
      console.log('[INFO] JSON file is empty. Nothing to import.');
      readline.close();
      db.close();
      return;
    }
    console.log(`[INFO] Found ${questionsArray.length} questions in JSON file.`);

    // Using INSERT OR REPLACE to update existing questions or insert new ones.
    // Change to INSERT OR IGNORE if you only want to add new ones and skip existing with the same ID.
    const insertSql = `
      INSERT OR REPLACE INTO questions 
      (id, topicId, text, options, correctOptionId, explanation, difficulty) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    let insertedOrReplacedCount = 0;
    let skippedCount = 0;

    for (const q of questionsArray) {
      if (!q.id || !q.topicId || !q.text || !q.options || !q.correctOptionId) {
        console.warn(`[SKIP] Skipping question due to missing required fields: ${JSON.stringify(q).substring(0,100)}...`);
        skippedCount++;
        continue;
      }

      const params = [
        q.id,
        q.topicId,
        q.text,
        JSON.stringify(q.options || []),
        q.correctOptionId,
        q.explanation || null,
        q.difficulty != null ? parseInt(q.difficulty, 10) : null // Ensure difficulty is integer or null
      ];

      try {
        const result = await dbRun(insertSql, params);
        if (result.changes > 0) {
          insertedOrReplacedCount++;
        } else {
           console.log(`[INFO] No changes for question ID ${q.id} (might already exist and data is identical if using INSERT OR IGNORE).`);
        }
      } catch (err) {
        console.error(`[DB_ERROR] Failed to insert/replace question ID ${q.id}:`, err.message);
      }
    }

    console.log("\n--- Migration Summary ---");
    console.log(`Total questions in JSON: ${questionsArray.length}`);
    console.log(`Successfully inserted/replaced: ${insertedOrReplacedCount}`);
    console.log(`Skipped (missing fields): ${skippedCount}`);
    console.log("-------------------------");

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

convertJsonToQuestionsDb();