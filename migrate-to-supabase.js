// migrate-to-supabase.js (with data cleaning)

const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

// --- Configuration ---
const TOPICS_DB_PATH = path.join(__dirname, 'backend', 'quizTopics.db');
const QUESTIONS_DB_PATH = path.join(__dirname, 'backend', 'quizData.db');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- Helper Functions ---
function readFromSqlite(dbPath, tableName) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(err);
    });
    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
      if (err) reject(err); else resolve(rows);
      db.close();
    });
  });
}

async function insertIntoSupabase(tableName, data, chunkSize = 500) {
  // Insert in chunks to avoid overwhelming the API
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    console.log(`Inserting chunk ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(data.length / chunkSize)} into ${tableName}...`);
    const { error } = await supabase.from(tableName).insert(chunk);
    if (error) {
      console.error(`Error inserting chunk into ${tableName}:`, error.message);
      throw error;
    }
  }
  console.log(`Successfully inserted ${data.length} rows into Supabase table: ${tableName}`);
}

// --- Main Migration Logic ---

async function migrate() {
  try {
    console.log("--- Starting Data Migration to Supabase ---");

    // Clear existing data to prevent duplicates on re-run
    console.log("\nClearing existing questions and topics from Supabase to ensure a clean migration...");
    const { error: deleteQuestionsError } = await supabase.from('questions').delete().neq('id', 'a-value-that-does-not-exist');
    if (deleteQuestionsError) throw deleteQuestionsError;
    const { error: deleteTopicsError } = await supabase.from('quiz_topics').delete().neq('id', 'a-value-that-does-not-exist');
    if (deleteTopicsError) throw deleteTopicsError;
    console.log("Existing data cleared.");


    // 1. Migrate Topics
    console.log(`\nReading topics from ${TOPICS_DB_PATH}...`);
    const topics = await readFromSqlite(TOPICS_DB_PATH, 'quiz_topics');
    if (topics.length > 0) {
      await insertIntoSupabase('quiz_topics', topics);
    } else {
      console.log("No topics found in local DB. Skipping topics migration.");
    }
    
    // Create a Set of valid topic IDs for quick lookup
    const validTopicIds = new Set(topics.map(t => t.id));
    console.log(`Found ${validTopicIds.size} unique topic IDs.`);


    // 2. Migrate Questions
    console.log(`\nReading questions from ${QUESTIONS_DB_PATH}...`);
    let questions = await readFromSqlite(QUESTIONS_DB_PATH, 'questions');
    if (questions.length > 0) {
      
      // =========================================================
      // START OF FIX: Filter out questions with invalid topicId
      // =========================================================
      const validQuestions = questions.filter(q => {
        if (validTopicIds.has(q.topicId)) {
          return true;
        } else {
          console.warn(`[SKIPPING] Question with ID '${q.id}' has an invalid topicId '${q.topicId}' that does not exist in the topics table.`);
          return false;
        }
      });
      console.log(`Filtered out invalid questions. Migrating ${validQuestions.length} of ${questions.length} total questions.`);
      // =========================================================
      // END OF FIX
      // =========================================================

      const processedQuestions = validQuestions.map(q => {
        try {
          return {
            id: q.id,
            "topicId": q.topicId,
            text: q.text,
            options: JSON.parse(q.options),
            "correctOptionId": q.correctOptionId,
            explanation: q.explanation,
            difficulty: q.difficulty,
          };
        } catch (e) {
          console.error(`Could not parse options for question ID ${q.id}:`, q.options);
          return null;
        }
      }).filter(Boolean);

      if (processedQuestions.length > 0) {
        await insertIntoSupabase('questions', processedQuestions);
      }
    } else {
      console.log("No questions found in local DB. Skipping questions migration.");
    }

    console.log("\n--- Migration Finished Successfully! ---");
    console.log("Your data should now be visible in the Supabase Table Editor.");

  } catch (error) {
    console.error("\n--- A fatal error occurred during migration ---");
    console.error(error.message);
    process.exit(1);
  }
}

migrate();