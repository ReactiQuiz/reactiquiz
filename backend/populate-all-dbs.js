// backend/populate-all-dbs.js
const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const DB_DIR = __dirname;
const JSON_DIR = __dirname;

const DB_PATHS = {
    subjects: path.join(DB_DIR, 'subjects.db'),
    topics: path.join(DB_DIR, 'quizTopics.db'),
    questions: path.join(DB_DIR, 'quizData.db'),
};

const JSON_PATHS = {
    subjects: path.join(JSON_DIR, 'subjects.json'),
    topics: path.join(JSON_DIR, 'topics.json'),
    questions: path.join(JSON_DIR, 'questions.json'),
};

const question = (query) => new Promise(resolve => readline.question(query, resolve));

// Helper to connect and promisify a DB
const connectAndPromisify = (dbPath) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) return reject(err);
            console.log(`[DB] Connected to ${path.basename(dbPath)}`);
            resolve({
                run: (sql, params = []) => new Promise((res, rej) => db.run(sql, params, function (err) { err ? rej(err) : res(this); })),
                close: () => new Promise((res, rej) => db.close((err) => { err ? rej(err) : res(); }))
            });
        });
    });
};

async function populateSubjects(db) {
    console.log('\n--- Populating Subjects ---');
    await db.run(`
      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, 
        accentColor TEXT NOT NULL, iconName TEXT, displayOrder INTEGER UNIQUE, subjectKey TEXT NOT NULL
      )
    `);

    const fileContent = await fs.readFile(JSON_PATHS.subjects, 'utf8');
    const subjects = JSON.parse(fileContent);
    if (!Array.isArray(subjects)) throw new Error('Subjects JSON is not an array.');
    
    console.log(`Found ${subjects.length} subjects in JSON.`);
    const insertSql = `INSERT OR REPLACE INTO subjects (id, name, description, accentColor, iconName, displayOrder, subjectKey) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    let count = 0;
    for (const s of subjects) {
        if (!s.id || !s.name || !s.accentColor || !s.displayOrder || !s.subjectKey) {
            console.warn(`[SKIP] Skipping subject due to missing fields: ${s.name || s.id}`);
            continue;
        }
        await db.run(insertSql, [s.id, s.name, s.description, s.accentColor, s.iconName, s.displayOrder, s.subjectKey]);
        count++;
    }
    console.log(`Processed ${count} subjects.`);
}

async function populateTopics(db) {
    console.log('\n--- Populating Topics ---');
    await db.run(`
      CREATE TABLE IF NOT EXISTS quiz_topics (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, 
        class TEXT, genre TEXT, subject TEXT NOT NULL
      )
    `);

    const fileContent = await fs.readFile(JSON_PATHS.topics, 'utf8');
    const topics = JSON.parse(fileContent);
    if (!Array.isArray(topics)) throw new Error('Topics JSON is not an array.');

    console.log(`Found ${topics.length} topics in JSON.`);
    const insertSql = `INSERT OR REPLACE INTO quiz_topics (id, name, description, class, genre, subject) VALUES (?, ?, ?, ?, ?, ?)`;

    let count = 0;
    for (const t of topics) {
        if (!t.id || !t.name || !t.subject) {
            console.warn(`[SKIP] Skipping topic due to missing fields: ${t.name || t.id}`);
            continue;
        }
        await db.run(insertSql, [t.id, t.name, t.description, t.class, t.genre, t.subject.toLowerCase()]);
        count++;
    }
    console.log(`Processed ${count} topics.`);
}

async function populateQuestions(db) {
    console.log('\n--- Populating Questions ---');
    await db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY, topicId TEXT NOT NULL, text TEXT NOT NULL, 
        options TEXT NOT NULL, correctOptionId TEXT NOT NULL, explanation TEXT, difficulty INTEGER
      )
    `);

    const fileContent = await fs.readFile(JSON_PATHS.questions, 'utf8');
    const questions = JSON.parse(fileContent);
    if (!Array.isArray(questions)) throw new Error('Questions JSON is not an array.');

    console.log(`Found ${questions.length} questions in JSON.`);
    const insertSql = `INSERT OR REPLACE INTO questions (id, topicId, text, options, correctOptionId, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    let count = 0;
    for (const q of questions) {
        if (!q.id || !q.topicId || !q.text || !q.options || !q.correctOptionId) {
            console.warn(`[SKIP] Skipping question due to missing fields: ${q.id}`);
            continue;
        }
        const params = [q.id, q.topicId, q.text, JSON.stringify(q.options), q.correctOptionId, q.explanation, q.difficulty];
        await db.run(insertSql, params);
        count++;
    }
    console.log(`Processed ${count} questions.`);
}


async function main() {
    console.log('--- ReactiQuiz Bulk Database Population Tool ---');
    console.log(`This will overwrite data in the following databases:\n- ${DB_PATHS.subjects}\n- ${DB_PATHS.topics}\n- ${DB_PATHS.questions}`);
    
    const confirm = await question('Are you sure you want to proceed? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
        console.log('Operation cancelled.');
        readline.close();
        return;
    }

    let subjectsDb, topicsDb, questionsDb;
    try {
        subjectsDb = await connectAndPromisify(DB_PATHS.subjects);
        topicsDb = await connectAndPromisify(DB_PATHS.topics);
        questionsDb = await connectAndPromisify(DB_PATHS.questions);

        // Run population tasks
        await populateSubjects(subjectsDb);
        await populateTopics(topicsDb);
        await populateQuestions(questionsDb);

        console.log('\n[SUCCESS] All databases populated successfully.');

    } catch (error) {
        console.error('\n[FATAL ERROR] An error occurred during the population process:', error);
    } finally {
        // Close all DB connections
        if (subjectsDb) await subjectsDb.close();
        if (topicsDb) await topicsDb.close();
        if (questionsDb) await questionsDb.close();
        console.log('\nDatabase connections closed.');
        readline.close();
    }
}

main();