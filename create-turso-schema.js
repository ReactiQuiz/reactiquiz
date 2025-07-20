// create-turso-schema.js
require('dotenv').config();
const { turso } = require('./api/_utils/tursoClient');

const schemaStatements = [
// Static Content Tables
`CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
  accentColor TEXT, iconName TEXT, displayOrder INTEGER UNIQUE, subjectKey TEXT NOT NULL UNIQUE
);`,
`CREATE TABLE IF NOT EXISTS quiz_topics (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
  class TEXT, genre TEXT, subject_id TEXT NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);`,
`CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY, topicId TEXT NOT NULL, text TEXT NOT NULL,
  options TEXT, correctOptionId TEXT, explanation TEXT, difficulty INTEGER,
  FOREIGN KEY (topicId) REFERENCES quiz_topics(id) ON DELETE CASCADE
);`,

// User and Dynamic Data Tables
`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  address TEXT,
  class TEXT
);`,
`CREATE TABLE IF NOT EXISTS quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  subject TEXT,
  topicId TEXT NOT NULL,
  score INTEGER,
  totalQuestions INTEGER,
  percentage REAL,
  timestamp TEXT DEFAULT (datetime('now')),
  difficulty TEXT,
  timeTaken INTEGER,
  questionsActuallyAttemptedIds TEXT,
  userAnswersSnapshot TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`,
`CREATE TABLE IF NOT EXISTS friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);`,
`CREATE TABLE IF NOT EXISTS challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  challenger_id TEXT NOT NULL,
  challenged_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  topic_name TEXT,
  difficulty TEXT,
  num_questions INTEGER,
  question_ids_json TEXT,
  challenger_score INTEGER,
  challenged_score INTEGER,
  status TEXT DEFAULT 'pending',
  winner_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (challenger_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenged_id) REFERENCES users(id) ON DELETE CASCADE
);`
];

async function createSchema() {
  try {
    console.log("Creating/updating database schema on Turso...");
    await turso.batch(schemaStatements, 'write');
    console.log("✅ Schema setup complete!");
  } catch (e) {
    console.error("❌ An error occurred while creating the schema:", e);
  }
}

createSchema();