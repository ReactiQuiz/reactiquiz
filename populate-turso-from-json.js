// populate-turso-from-json.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { turso } = require('./api/_utils/tursoClient');

const SUBJECTS_JSON_PATH = path.join(__dirname, 'subjects.json');
const TOPICS_JSON_PATH = path.join(__dirname, 'topics.json');
const QUESTIONS_JSON_PATH = path.join(__dirname, 'questions.json');

async function processInChunks(statements, message) {
  const chunkSize = 500;
  if (statements.length === 0) {
    console.log(`✅ No ${message} to migrate.`);
    return;
  }
  for (let i = 0; i < statements.length; i += chunkSize) {
    const chunk = statements.slice(i, i + chunkSize);
    console.log(`   -> Migrating ${message}: ${i + 1} - ${i + chunk.length} of ${statements.length}...`);
    try {
      const tx = await turso.transaction("write");
      try {
        for (const statement of chunk) {
          await tx.execute(statement);
        }
        await tx.commit();
      } catch (err) {
        await tx.rollback();
        throw err;
      }
    } catch (e) {
      console.error(`❌ Error processing chunk for ${message} starting at index ${i}:`, e);
      throw new Error(`Failed during ${message} migration.`);
    }
  }
  console.log(`✅ Migrated ${statements.length} ${message}.`);
}

async function migrate() {
  try {
    console.log("--- Starting Static Data Migration from JSON to Turso ---");

    const subjectsRaw = fs.readFileSync(SUBJECTS_JSON_PATH, 'utf-8');
    const subjects = JSON.parse(subjectsRaw);
    const subjectKeyToIdMap = new Map();
    subjects.forEach(s => subjectKeyToIdMap.set(s.subjectKey, s.id));

    const subjectStatements = subjects.map(s => ({
        sql: 'INSERT OR REPLACE INTO subjects (id, name, description, iconName, displayOrder, subjectKey, accentColorDark, accentColorLight) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        args: [
            s.id, s.name, s.description ?? '', s.iconName ?? 'DefaultIcon', s.displayOrder, s.subjectKey, s.accentColorDark, s.accentColorLight
        ]
    }));
    await processInChunks(subjectStatements, "subjects");

    const topicsRaw = fs.readFileSync(TOPICS_JSON_PATH, 'utf-8');
    const topics = JSON.parse(topicsRaw);
    const topicStatements = topics.map(t => {
        const subjectId = subjectKeyToIdMap.get(t.subject);
        if (!subjectId) {
            console.warn(`⚠️  Skipping topic "${t.name}" because its subject key "${t.subject}" was not found in subjects.json.`);
            return null;
        }
        return {
            sql: 'INSERT OR REPLACE INTO quiz_topics (id, name, description, class, genre, subject_id) VALUES (?, ?, ?, ?, ?, ?);',
            args: [ t.id, t.name, t.description ?? '', t.class ?? '', t.genre ?? '', subjectId ]
        };
    }).filter(Boolean);
    await processInChunks(topicStatements, "topics");

    const questionsRaw = fs.readFileSync(QUESTIONS_JSON_PATH, 'utf-8');
    const questions = JSON.parse(questionsRaw);
    const questionStatements = questions.map(q => ({
        sql: 'INSERT OR REPLACE INTO questions (id, topicId, text, options, correctOptionId, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?);',
        args: [ q.id, q.topicId, q.text, JSON.stringify(q.options), q.correctOptionId, q.explanation ?? '', q.difficulty ]
    }));
    await processInChunks(questionStatements, "questions");

    console.log("\n--- ✅ Migration Finished Successfully! ---");
  } catch (error) {
    console.error("\n--- ❌ A fatal error occurred during migration ---", error.message);
    process.exit(1);
  }
}

migrate();