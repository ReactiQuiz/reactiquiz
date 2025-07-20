// migrate-to-supabase.js
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// Ensure these point to your old /backend directory
const SUBJECTS_DB_PATH = path.join(__dirname, 'backend', 'subjects.db');
const TOPICS_DB_PATH = path.join(__dirname, 'backend', 'quizTopics.db');
const QUESTIONS_DB_PATH = path.join(__dirname, 'backend', 'quizData.db');

// Use your NEW project's keys from your .env file
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("FATAL: Supabase URL or Service Key missing. Check your .env file.");
  process.exit(1);
}

// This client initialization is correct.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function readFromSqlite(dbPath, tableName) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(err);
    });
    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
      db.close();
      err ? reject(err) : resolve(rows);
    });
  });
}

async function migrateData(tableName, processedData) {
    // Using { count: 'exact' } can help in debugging if some rows are ignored.
    const { error, count } = await supabase.from(tableName).upsert(processedData, { count: 'exact' });
    if (error) throw error;
    console.log(`✅ Successfully migrated ${count} records to "${tableName}".`);
}

async function migrate() {
  try {
    console.log("--- Starting Data Migration from SQLite to Supabase ---");
    console.log("Connecting with service key...");

    // 1. Migrate Subjects
    console.log("\nMigrating subjects...");
    const subjects = await readFromSqlite(SUBJECTS_DB_PATH, 'subjects');
    const processedSubjects = subjects.map(s => ({
        id: s.id, name: s.name, description: s.description,
        accentColor: s.accentColor, iconName: s.iconName,
        displayOrder: s.displayOrder, subjectKey: s.subjectKey,
    }));
    await migrateData('subjects', processedSubjects);

    // 2. Migrate Topics
    console.log("Migrating topics...");
    const topics = await readFromSqlite(TOPICS_DB_PATH, 'quiz_topics');
    const processedTopics = topics.map(t => ({
        id: t.id, name: t.name, description: t.description,
        class: t.class, genre: t.genre, subject_id: t.subject,
    }));
    await migrateData('quiz_topics', processedTopics);

    // 3. Migrate Questions
    console.log("Migrating questions...");
    const questions = await readFromSqlite(QUESTIONS_DB_PATH, 'questions');
    const processedQuestions = questions.map(q => ({
        id: q.id, topicId: q.topicId, text: q.text,
        options: JSON.parse(q.options || '[]'), correctOptionId: q.correctOptionId,
        explanation: q.explanation, difficulty: q.difficulty,
    }));
    await migrateData('questions', processedQuestions);

    console.log("\n--- ✅ Migration Finished Successfully! ---");

  } catch (error) {
    console.error("\n--- ❌ A fatal error occurred during migration ---");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    console.error("Error Details:", error.details);
    console.error("Error Hint:", error.hint);
    process.exit(1);
  }
}

migrate();