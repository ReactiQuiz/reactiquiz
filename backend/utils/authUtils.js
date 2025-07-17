// backend/utils/authUtils.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const debug = require('debug');

const { logInfo, logError } = require('./logger');

// --- Constants ---
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
const CHALLENGE_EXPIRATION_DAYS = 7;

// --- Helper Functions ---
const generateSecureToken = () => crypto.randomBytes(32).toString('hex');
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- Nodemailer Transporter ---
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' }
    });
    transporter.verify((error) => {
        if (error) {
            logError('EMAIL FAIL', 'Nodemailer transporter verification failed', error);
            transporter = null;
        } else {
            logInfo('READY', 'Nodemailer transporter is ready.');
        }
    });
} else {
    logInfo('WARN', 'EMAIL_USER or EMAIL_PASS not found. Emailing is disabled.');
}

module.exports = {
    transporter,
    generateSecureToken,
    generateOtp,
    TOKEN_EXPIRATION_MS,
    OTP_EXPIRATION_MS,
    CHALLENGE_EXPIRATION_DAYS,
};