// migrate-to-supabase.js
const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

const SUBJECTS_DB_PATH = path.join(__dirname, 'backend', 'subjects.db');
const TOPICS_DB_PATH = path.join(__dirname, 'backend', 'quizTopics.db');
const QUESTIONS_DB_PATH = path.join(__dirname, 'backend', 'quizData.db');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('Connected to Supabase project.');

function readFromSqlite(dbPath, tableName) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(err);
    });
    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function migrateSubjects() {
    console.log('\n--- Migrating Subjects ---');
    const subjects = await readFromSqlite(SUBJECTS_DB_PATH, 'subjects');
    const processedSubjects = subjects.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        accentColor: s.accentColor,
        iconName: s.iconName,
        displayOrder: s.displayOrder,
        subjectKey: s.subjectKey,
    }));
    const { data, error } = await supabase.from('subjects').upsert(processedSubjects);
    if (error) throw error;
    console.log(`Successfully migrated ${subjects.length} subjects.`);
}

async function migrateTopics() {
    console.log('\n--- Migrating Topics ---');
    const topics = await readFromSqlite(TOPICS_DB_PATH, 'quiz_topics');
    const processedTopics = topics.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        class: t.class,
        genre: t.genre,
        subject_id: t.subject, // Renamed column
    }));
    const { data, error } = await supabase.from('quiz_topics').upsert(processedTopics);
    if (error) throw error;
    console.log(`Successfully migrated ${topics.length} topics.`);
}

async function migrateQuestions() {
    console.log('\n--- Migrating Questions ---');
    const questions = await readFromSqlite(QUESTIONS_DB_PATH, 'questions');
    const processedQuestions = questions.map(q => ({
        id: q.id,
        topicId: q.topicId,
        text: q.text,
        options: JSON.parse(q.options), // Parse string back to JSON
        correctOptionId: q.correctOptionId,
        explanation: q.explanation,
        difficulty: q.difficulty,
    }));
    const { data, error } = await supabase.from('questions').upsert(processedQuestions);
    if (error) throw error;
    console.log(`Successfully migrated ${questions.length} questions.`);
}

async function migrate() {
  try {
    console.log("--- Starting Data Migration from SQLite to Supabase ---");
    console.log("This script assumes you have already run the schema creation SQL in your Supabase project.");
    
    await migrateSubjects();
    await migrateTopics();
    await migrateQuestions();

    console.log("\n--- Migration Finished Successfully! ---");
    console.log("Your static quiz data should now be in your Supabase tables.");

  } catch (error) {
    console.error("\n--- A fatal error occurred during migration ---");
    console.error("Error Message:", error.message);
    process.exit(1);
  }
}

migrate();