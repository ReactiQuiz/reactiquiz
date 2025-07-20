// migrate-to-turso.js
require('dotenv').config();
const { turso } = require('./api/_utils/tursoClient');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// These paths should point to your old /backend directory where the .db files are
const SUBJECTS_DB_PATH = path.join(__dirname, 'backend', 'subjects.db');
const TOPICS_DB_PATH = path.join(__dirname, 'backend', 'quizTopics.db');
const QUESTIONS_DB_PATH = path.join(__dirname, 'backend', 'quizData.db');

function readFromSqlite(dbPath, tableName) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => { if (err) return reject(err); });
    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
      db.close();
      err ? reject(err) : resolve(rows);
    });
  });
}

async function migrate() {
  try {
    console.log("--- Starting Static Data Migration from SQLite to Turso ---");
    console.log("This will migrate subjects, topics, and questions only.");

    // 1. Migrate Subjects
    const subjects = await readFromSqlite(SUBJECTS_DB_PATH, 'subjects');
    const subjectStatements = subjects.map(s => ({
        sql: 'INSERT OR REPLACE INTO subjects (id, name, description, accentColor, iconName, displayOrder, subjectKey) VALUES (?, ?, ?, ?, ?, ?, ?);',
        args: [s.id, s.name, s.description, s.accentColor, s.iconName, s.displayOrder, s.subjectKey]
    }));
    if (subjectStatements.length > 0) await turso.batch(subjectStatements, 'write');
    console.log(`✅ Migrated ${subjects.length} subjects.`);

    // 2. Migrate Topics
    const topics = await readFromSqlite(TOPICS_DB_PATH, 'quiz_topics');
    const topicStatements = topics.map(t => ({
        sql: 'INSERT OR REPLACE INTO quiz_topics (id, name, description, class, genre, subject_id) VALUES (?, ?, ?, ?, ?, ?);',
        args: [t.id, t.name, t.description, t.class, t.genre, t.subject]
    }));
    if (topicStatements.length > 0) await turso.batch(topicStatements, 'write');
    console.log(`✅ Migrated ${topics.length} topics.`);

    // 3. Migrate Questions
    const questions = await readFromSqlite(QUESTIONS_DB_PATH, 'questions');
    const questionStatements = questions.map(q => ({
        sql: 'INSERT OR REPLACE INTO questions (id, topicId, text, options, correctOptionId, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?);',
        args: [q.id, q.topicId, q.text, q.options, q.correctOptionId, q.explanation, q.difficulty]
    }));
    if (questionStatements.length > 0) await turso.batch(questionStatements, 'write');
    console.log(`✅ Migrated ${questions.length} questions.`);

    console.log("\n--- ✅ Migration Finished Successfully! ---");
  } catch (error) {
    console.error("\n--- ❌ A fatal error occurred during migration ---", error);
    process.exit(1);
  }
}

migrate();