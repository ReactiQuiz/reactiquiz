// migrate-to-supabase.js (with data cleaning and subjects migration)

const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

// --- Configuration ---
const SUBJECTS_DB_PATH = path.join(__dirname, 'backend', 'subjects.db'); // Path to your local SQLite subjects DB
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
      if (err) {
        console.error(`Error opening SQLite DB at ${dbPath}:`, err.message);
        return reject(err);
      }
    });
    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
      if (err) {
        console.error(`Error reading from table ${tableName} in ${dbPath}:`, err.message);
        reject(err);
      } else {
        resolve(rows);
      }
      db.close((closeErr) => {
        if (closeErr) {
          console.error(`Error closing SQLite DB ${dbPath}:`, closeErr.message);
        }
      });
    });
  });
}

async function insertIntoSupabase(tableName, data, chunkSize = 10) {
  if (!data || data.length === 0) {
    console.log(`No data to insert into ${tableName}. Skipping.`);
    return;
  }
  // Insert in chunks to avoid overwhelming the API
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    console.log(`Inserting chunk ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(data.length / chunkSize)} into ${tableName}...`);
    const { error } = await supabase.from(tableName).insert(chunk);
    if (error) {
      console.error(`Error inserting chunk into ${tableName}:`, error.message);
      // Log the chunk that failed for easier debugging
      console.error("Failed chunk data (first item):", chunk.length > 0 ? chunk[0] : "Chunk was empty");
      if (error.details) console.error("Error details:", error.details);
      if (error.hint) console.error("Error hint:", error.hint);
      throw error;
    }
  }
  console.log(`Successfully inserted ${data.length} rows into Supabase table: ${tableName}`);
}

async function clearSupabaseTable(tableName) {
    console.log(`Clearing existing data from Supabase table: ${tableName}...`);
    const { error } = await supabase.from(tableName).delete().neq('id', 'a-value-that-will-never-exist'); // Deletes all rows
    if (error) {
        console.error(`Error clearing table ${tableName}:`, error.message);
        throw error;
    }
    console.log(`Table ${tableName} cleared.`);
}


// --- Main Migration Logic ---

async function migrate() {
  try {
    console.log("--- Starting Data Migration to Supabase ---");

    // Clear existing data to prevent duplicates on re-run
    console.log("\nClearing existing data from Supabase tables...");
    await clearSupabaseTable('questions');
    await clearSupabaseTable('quiz_topics');
    await clearSupabaseTable('subjects'); // Clear subjects table
    console.log("Existing data cleared from relevant Supabase tables.");

    // 1. Migrate Subjects
    console.log(`\n--- Migrating Subjects ---`);
    console.log(`Reading subjects from ${SUBJECTS_DB_PATH}...`);
    const subjects = await readFromSqlite(SUBJECTS_DB_PATH, 'subjects');
    if (subjects.length > 0) {
      // Ensure data types are correct, especially for integers like displayOrder
      const processedSubjects = subjects.map(s => ({
        ...s,
        displayOrder: s.displayOrder !== null && s.displayOrder !== undefined ? parseInt(s.displayOrder, 10) : null,
      }));
      await insertIntoSupabase('subjects', processedSubjects);
    } else {
      console.log("No subjects found in local DB. Skipping subjects migration.");
    }
    
    // 2. Migrate Topics
    console.log(`\n--- Migrating Topics ---`);
    console.log(`Reading topics from ${TOPICS_DB_PATH}...`);
    const topics = await readFromSqlite(TOPICS_DB_PATH, 'quiz_topics');
    if (topics.length > 0) {
      await insertIntoSupabase('quiz_topics', topics);
    } else {
      console.log("No topics found in local DB. Skipping topics migration.");
    }
    
    // Create a Set of valid topic IDs for quick lookup (from the successfully migrated/read topics)
    const validTopicIds = new Set(topics.map(t => t.id));
    console.log(`Found ${validTopicIds.size} unique topic IDs for validation.`);


    // 3. Migrate Questions
    console.log(`\n--- Migrating Questions ---`);
    console.log(`Reading questions from ${QUESTIONS_DB_PATH}...`);
    let questions = await readFromSqlite(QUESTIONS_DB_PATH, 'questions');
    if (questions.length > 0) {
      
      const originalQuestionCount = questions.length;
      const validQuestions = questions.filter(q => {
        if (validTopicIds.has(q.topicId)) {
          return true;
        } else {
          console.warn(`[SKIPPING] Question with ID '${q.id}' (text: "${q.text.substring(0,30)}...") has an invalid topicId '${q.topicId}' that does not exist in the topics table.`);
          return false;
        }
      });
      
      if (validQuestions.length < originalQuestionCount) {
          console.log(`Filtered out ${originalQuestionCount - validQuestions.length} questions with invalid topic IDs. Migrating ${validQuestions.length} questions.`);
      } else {
          console.log(`All ${originalQuestionCount} questions have valid topic IDs.`);
      }

      const processedQuestions = validQuestions.map(q => {
        try {
          // Ensure options are stringified if they are not already
          let optionsString = q.options;
          if (typeof q.options !== 'string') {
            optionsString = JSON.stringify(q.options);
          }

          // Ensure difficulty is an integer or null
          let difficultyInt = null;
          if (q.difficulty !== null && q.difficulty !== undefined) {
              difficultyInt = parseInt(q.difficulty, 10);
              if (isNaN(difficultyInt)) {
                  console.warn(`[WARN] Question ID ${q.id} has non-integer difficulty '${q.difficulty}'. Setting to null.`);
                  difficultyInt = null;
              }
          }

          return {
            id: q.id,
            topicId: q.topicId, // Renamed from "topicId" to topicId to match typical JS conventions
            text: q.text,
            options: optionsString, // Supabase expects JSON or JSONB as string for insert via JS client typically
            correctOptionId: q.correctOptionId, // Renamed
            explanation: q.explanation,
            difficulty: difficultyInt,
          };
        } catch (e) {
          console.error(`Could not process question ID ${q.id}:`, e.message, q);
          return null; // Skip this question if processing fails
        }
      }).filter(q => q !== null); // Remove any nulls from failed processing

      if (processedQuestions.length > 0) {
        await insertIntoSupabase('questions', processedQuestions);
      } else if (validQuestions.length > 0) {
        console.log("No questions were processed successfully after filtering. Skipping questions insertion.");
      }
    } else {
      console.log("No questions found in local DB. Skipping questions migration.");
    }

    console.log("\n--- Migration Finished Successfully! ---");
    console.log("Your data should now be visible in the Supabase Table Editor.");

  } catch (error) {
    console.error("\n--- A fatal error occurred during migration ---");
    console.error("Error message:", error.message);
    if (error.details) console.error("Details:", error.details);
    if (error.stack) console.error("Stack:", error.stack);
    process.exit(1);
  }
}

migrate();