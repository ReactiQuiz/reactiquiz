// backend/db.js
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { logDb, logError } = require('./utils/logger'); // Use our custom logger

const projectRoot = path.resolve(__dirname, '../');

const DB_PATHS = {
    results: process.env.DATABASE_FILE_PATH ? path.resolve(projectRoot, process.env.DATABASE_FILE_PATH) : path.join(__dirname, 'quizResults.db'),
    questions: process.env.QUESTIONS_DATABASE_FILE_PATH ? path.resolve(projectRoot, process.env.QUESTIONS_DATABASE_FILE_PATH) : path.join(__dirname, 'quizData.db'),
    topics: process.env.TOPICS_DATABASE_FILE_PATH ? path.resolve(projectRoot, process.env.TOPICS_DATABASE_FILE_PATH) : path.join(__dirname, 'quizTopics.db'),
    users: process.env.USERS_DATABASE_FILE_PATH ? path.resolve(projectRoot, process.env.USERS_DATABASE_FILE_PATH) : path.join(__dirname, 'users.db'),
    friends: process.env.FRIENDS_DATABASE_FILE_PATH ? path.resolve(projectRoot, process.env.FRIENDS_DATABASE_FILE_PATH) : path.join(__dirname, 'friends.db'),
    challenges: process.env.CHALLENGES_DATABASE_FILE_PATH ? path.resolve(projectRoot, process.env.CHALLENGES_DATABASE_FILE_PATH) : path.join(__dirname, 'challenges.db'),
    subjects: process.env.SUBJECTS_DATABASE_FILE_PATH ? path.resolve(projectRoot, process.env.SUBJECTS_DATABASE_FILE_PATH) : path.join(__dirname, 'subjects.db'),
};

function connect(dbPath, mode, dbNameLog, attachDbs = []) {
    logDb('CONNECT', `Attempting for: ${dbNameLog}`, `Path: ${path.basename(dbPath)}`);
    const db = new sqlite3.Database(dbPath, mode, (err) => {
        if (err) {
            logError('FAILED', `Could not connect to ${dbNameLog} DB`, err.message);
            process.exit(1);
        }
        logDb('SUCCESS', `Connected to ${dbNameLog} DB.`);

        attachDbs.forEach(attachInfo => {
            const attachPath = attachInfo.path.replace(/\\/g, '/');
            db.run(`ATTACH DATABASE '${attachPath}' AS ${attachInfo.alias};`, (attachErr) => {
                if (attachErr) {
                    logError('FAILED', `Attach ${attachInfo.alias} to ${dbNameLog}`, attachErr.message);
                } else {
                    logDb('ATTACHED', `Attached ${attachInfo.alias} to ${dbNameLog} DB.`);
                }
            });
        });
    });
    return db;
}

const resultsDb = connect(DB_PATHS.results, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 'Results');
const usersDb = connect(DB_PATHS.users, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 'Users');
const challengesDb = connect(DB_PATHS.challenges, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 'Challenges');
const topicsDb = connect(DB_PATHS.topics, sqlite3.OPEN_READONLY, 'Topics');
const subjectsDb = connect(DB_PATHS.subjects, sqlite3.OPEN_READONLY, 'Subjects');

const questionsDb = connect(
    DB_PATHS.questions,
    sqlite3.OPEN_READONLY,
    'Questions',
    [{ path: DB_PATHS.topics, alias: 'topics_db' }]
);

const friendsDb = connect(
    DB_PATHS.friends,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    'Friends',
    [{ path: DB_PATHS.users, alias: 'users_db' }]
);

module.exports = {
    resultsDb,
    questionsDb,
    topicsDb,
    usersDb,
    friendsDb,
    challengesDb,
    subjectsDb,
    DB_PATHS,
};