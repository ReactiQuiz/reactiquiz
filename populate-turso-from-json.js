// populate-turso-from-json.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { turso } = require('./api/_utils/tursoClient');

const SUBJECTS_JSON_PATH = path.join(__dirname, 'subjects.json');
const TOPICS_JSON_PATH = path.join(__dirname, 'topics.json');
const QUESTIONS_JSON_PATH = path.join(__dirname, 'questions.json');

// This function is for small, critical datasets (subjects, topics)
async function processSmallDataset(statements, message) {
  console.log(`-> Migrating ${message}...`);
  if (statements.length === 0) {
    console.log(`✅ No ${message} to migrate.`);
    return;
  }
  const tx = await turso.transaction("write");
  try {
    for (const statement of statements) {
      await tx.execute(statement);
    }
    await tx.commit();
    console.log(`✅ Migrated ${statements.length} ${message}.`);
  } catch (err) {
    await tx.rollback();
    throw new Error(`Failed during ${message} migration: ${err.message}`);
  }
}

// This function is optimized for inserting thousands of records quickly.
async function processLargeDatasetWithTransactionalBatch(statements, message) {
  const chunkSize = 10000;
  if (statements.length === 0) {
    console.log(`✅ No ${message} to migrate.`);
    return;
  }
  console.log(`\n-> Migrating ${message}...`);
  for (let i = 0; i < statements.length; i += chunkSize) {
    const chunk = statements.slice(i, i + chunkSize);
    console.log(`   -> Processing chunk: ${i + 1} - ${i + chunk.length} of ${statements.length}...`);
    const tx = await turso.transaction("write");
    try {
      await tx.batch(chunk);
      await tx.commit();
    } catch (err) {
      await tx.rollback();
      console.error(`❌ Error processing chunk for ${message} starting at index ${i}.`);
      throw new Error(`Failed during ${message} migration. Please re-check your JSON data for integrity. Error: ${err.message}`);
    }
  }
  console.log(`✅ Migrated ${statements.length} ${message}.`);
}

async function migrate() {
  try {
    console.log("--- Starting Static Data Migration from JSON to Turso ---");

    // --- 1. Load all data and perform validations ---
    console.log("\n-> Reading and validating JSON files...");
    const topicsRaw = fs.readFileSync(TOPICS_JSON_PATH, 'utf-8');
    const topics = JSON.parse(topicsRaw);
    const validTopicIds = new Set(topics.map(t => t.id));
    
    const questionsRaw = fs.readFileSync(QUESTIONS_JSON_PATH, 'utf-8');
    const questions = JSON.parse(questionsRaw);

    const invalidQuestions = questions.filter(q => !validTopicIds.has(q.topicId));
    if (invalidQuestions.length > 0) {
      console.error("❌ FATAL DATA ERROR: Found questions with topicId's that do not exist in topics.json.");
      invalidQuestions.forEach(q => console.log(`  - Question ID: "${q.id}", Invalid topicId: "${q.topicId}"`));
      process.exit(1);
    }
    console.log("✅ All question topicId's are valid.");

    // --- START OF NEW FEATURE: Check for topics with zero questions ---
    console.log("\n-> Checking for topics with zero questions...");
    const topicQuestionCounts = new Map();
    for (const question of questions) {
        topicQuestionCounts.set(question.topicId, (topicQuestionCounts.get(question.topicId) || 0) + 1);
    }

    const topicsWithZeroQuestions = topics.filter(topic => !topicQuestionCounts.has(topic.id));

    if (topicsWithZeroQuestions.length > 0) {
        console.warn("\n⚠️  The following topics have 0 questions associated with them:");
        topicsWithZeroQuestions.forEach(topic => {
            console.warn(`  - Topic Name: "${topic.name}", ID: "${topic.id}"`);
        });
    } else {
        console.log("✅ All topics have at least one question associated with them.");
    }
    // --- END OF NEW FEATURE ---

    // --- 2. Migrate Subjects ---
    const subjectsRaw = fs.readFileSync(SUBJECTS_JSON_PATH, 'utf-8');
    const subjects = JSON.parse(subjectsRaw);
    const subjectKeyToIdMap = new Map(subjects.map(s => [s.subjectKey, s.id]));
    const subjectStatements = subjects.map(s => ({
        sql: 'INSERT OR REPLACE INTO subjects (id, name, description, iconName, displayOrder, subjectKey, accentColorDark, accentColorLight) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        args: [ s.id, s.name, s.description ?? '', s.iconName ?? 'DefaultIcon', s.displayOrder, s.subjectKey, s.accentColorDark, s.accentColorLight ]
    }));
    await processSmallDataset(subjectStatements, "subjects");

    // --- 3. Migrate Topics ---
    const topicStatements = topics.map(t => ({
        sql: 'INSERT OR REPLACE INTO quiz_topics (id, name, description, class, genre, subject_id) VALUES (?, ?, ?, ?, ?, ?);',
        args: [ t.id, t.name, t.description ?? '', t.class ?? '', t.genre ?? '', subjectKeyToIdMap.get(t.subject) ]
    }));
    await processSmallDataset(topicStatements, "topics");

    // --- 4. Migrate Questions ---
    const questionStatements = questions.map(q => ({
        sql: 'INSERT OR REPLACE INTO questions (id, topicId, text, options, correctOptionId, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?);',
        args: [ q.id, q.topicId, q.text, JSON.stringify(q.options), q.correctOptionId, q.explanation ?? '', q.difficulty ]
    }));
    await processLargeDatasetWithTransactionalBatch(questionStatements, "questions");

    console.log("\n--- ✅ Migration Finished Successfully! ---");
  } catch (error) {
    console.error("\n--- ❌ A fatal error occurred during migration ---");
    console.error(error.message);
    process.exit(1);
  }
}

migrate();