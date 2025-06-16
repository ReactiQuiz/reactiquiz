// --- START OF FILE backend/server.js ---

// backend/server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const debug = require('debug');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const logServer = debug('reactiquiz:server');
const logApi = debug('reactiquiz:api');
const logDbResults = debug('reactiquiz:db:results');
const logDbQuestions = debug('reactiquiz:db:questions');
const logDbTopics = debug('reactiquiz:db:topics');
const logDbUsers = debug('reactiquiz:db:users');
const logDbFriends = debug('reactiquiz:db:friends');
const logDbChallenges = debug('reactiquiz:db:challenges');
const logError = debug('reactiquiz:error');

const app = express();
const port = process.env.SERVER_PORT || 3001;
const projectRoot = path.resolve(__dirname, '../');

// --- DB Paths ---
const DEFAULT_RESULTS_DB_NAME = 'quizResults.db';
const DEFAULT_QUESTIONS_DB_NAME = 'quizData.db';
const DEFAULT_TOPICS_DB_NAME = 'quizTopics.db';
const DEFAULT_USERS_DB_NAME = 'users.db';
const DEFAULT_FRIENDS_DB_NAME = 'friends.db';
const DEFAULT_CHALLENGES_DB_NAME = 'challenges.db';


const RESULTS_DB_PATH = process.env.DATABASE_FILE_PATH
    ? path.resolve(projectRoot, process.env.DATABASE_FILE_PATH.startsWith('./') ? process.env.DATABASE_FILE_PATH.substring(2) : process.env.DATABASE_FILE_PATH)
    : path.join(__dirname, DEFAULT_RESULTS_DB_NAME);
const QUESTIONS_DB_PATH = process.env.QUESTIONS_DATABASE_FILE_PATH
    ? path.resolve(projectRoot, process.env.QUESTIONS_DATABASE_FILE_PATH.startsWith('./') ? process.env.QUESTIONS_DATABASE_FILE_PATH.substring(2) : process.env.QUESTIONS_DATABASE_FILE_PATH)
    : path.join(__dirname, DEFAULT_QUESTIONS_DB_NAME);
const TOPICS_DB_PATH = process.env.TOPICS_DATABASE_FILE_PATH
    ? path.resolve(projectRoot, process.env.TOPICS_DATABASE_FILE_PATH.startsWith('./') ? process.env.TOPICS_DATABASE_FILE_PATH.substring(2) : process.env.TOPICS_DATABASE_FILE_PATH)
    : path.join(__dirname, DEFAULT_TOPICS_DB_NAME);
const USERS_DB_PATH = process.env.USERS_DATABASE_FILE_PATH 
    ? path.resolve(projectRoot, process.env.USERS_DATABASE_FILE_PATH.startsWith('./') ? process.env.USERS_DATABASE_FILE_PATH.substring(2) : process.env.USERS_DATABASE_FILE_PATH)
    : path.join(__dirname, DEFAULT_USERS_DB_NAME);
const FRIENDS_DB_PATH = process.env.FRIENDS_DATABASE_FILE_PATH
    ? path.resolve(projectRoot, process.env.FRIENDS_DATABASE_FILE_PATH.startsWith('./') ? process.env.FRIENDS_DATABASE_FILE_PATH.substring(2) : process.env.FRIENDS_DATABASE_FILE_PATH)
    : path.join(__dirname, DEFAULT_FRIENDS_DB_NAME);
const CHALLENGES_DB_PATH = process.env.CHALLENGES_DATABASE_FILE_PATH
    ? path.resolve(projectRoot, process.env.CHALLENGES_DATABASE_FILE_PATH.startsWith('./') ? process.env.CHALLENGES_DATABASE_FILE_PATH.substring(2) : process.env.CHALLENGES_DATABASE_FILE_PATH)
    : path.join(__dirname, DEFAULT_CHALLENGES_DB_NAME);


logServer(`[INFO] Results DB Path: ${RESULTS_DB_PATH}`);
logServer(`[INFO] Questions DB Path: ${QUESTIONS_DB_PATH}`);
logServer(`[INFO] Topics DB Path: ${TOPICS_DB_PATH}`);
logServer(`[INFO] Users DB Path: ${USERS_DB_PATH}`);
logServer(`[INFO] Friends DB Path: ${FRIENDS_DB_PATH}`);
logServer(`[INFO] Challenges DB Path: ${CHALLENGES_DB_PATH}`);

app.listen(port, () => {
    logServer(`[INFO] Backend API server running on http://localhost:${port}`);
});

process.on('unhandledRejection', (reason, promise) => { logError('[ERROR] Unhandled Rejection:', reason, promise); });
process.on('uncaughtException', (error) => { logError('[ERROR] Uncaught Exception:', error); process.exit(1); })

// --- END OF FILE backend/server.js ---