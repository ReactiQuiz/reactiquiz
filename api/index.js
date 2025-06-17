import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { supabase } from './supabaseClient.js'; // <-- Import our new Supabase client

// --- CORS Configuration ---
const app = express();

// --- CORS Configuration ---
const allowedOrigins = [
  'https://sanskarsontakke.github.io', // Your GH Pages URL
  'https://reactiquiz.vercel.app',    // Your Vercel frontend URL (if you use it later)
  'http://localhost:3000'            // For local development
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '5mb' }));

// --- HELPERS ---
const generateSecureToken = () => crypto.randomBytes(32).toString('hex');
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;
const OTP_EXPIRATION_MS = 10 * 60 * 1000;

// --- NODEMAILER ---
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    console.log('[INFO] Nodemailer transporter configured.');
} else {
    console.log('[WARN] Email sending is disabled.');
}

// --- MIDDLEWARE ---
const verifySessionToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication token is required.' });

    const token = authHeader.split(' ')[1];
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('active_session_token', token)
        .single(); // .single() expects exactly one row

    if (error || !user) return res.status(401).json({ message: "Invalid session token." });
    if (new Date() > new Date(user.active_session_token_expires_at)) return res.status(401).json({ message: "Session token expired." });

    req.user = { id: user.id, identifier: user.identifier, email: user.email };
    next();
};

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Register User
app.post('/api/users/register', async (req, res) => {
    const { identifier, password, email, address, class: userClass } = req.body;
    if (!identifier || !password || !email) return res.status(400).json({ message: 'Identifier, password, and email are required.' });
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { error } = await supabase
            .from('users')
            .insert({ 
                identifier: identifier.trim(), 
                password: hashedPassword, 
                email: email.trim().toLowerCase(),
                address,
                class: userClass
            });

        if (error) {
            if (error.code === '23505') return res.status(409).json({ message: 'Username or email already exists.' });
            throw error;
        }
        res.status(201).json({ message: 'Registration successful!' });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ message: 'Error registering user.' });
    }
});

// Get Topics
app.get('/api/topics/:subject', async (req, res) => {
    const { subject } = req.params;
    const { data, error } = await supabase
        .from('quiz_topics')
        .select('*')
        .eq('subject', subject.toLowerCase());

    if (error) return res.status(500).json({ message: 'Failed to fetch topics.' });
    res.json(data || []);
});

// Get Questions
app.get('/api/questions', async (req, res) => {
    const { topicId } = req.query;
    if (!topicId) return res.status(400).json({ message: 'A topicId query parameter is required.' });
    
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('topicId', topicId);

    if (error) return res.status(500).json({ message: 'Failed to fetch questions.' });
    res.json(data || []);
});

// Save Result
app.post('/api/results', verifySessionToken, async (req, res) => {
    const resultData = { ...req.body, userId: req.user.id };
    const { error } = await supabase.from('quiz_results').insert(resultData);
    if (error) {
        console.error("Save Result Error:", error);
        return res.status(500).json({ message: 'Failed to save result.' });
    }
    res.status(201).json({ message: 'Result saved successfully!' });
});

app.get('/api/results', verifySessionToken, async (req, res) => {
    const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('userId', req.user.id)
        .order('timestamp', { ascending: false });

    if (error) return res.status(500).json({ message: 'Failed to fetch results.' });
    res.json(data || []);
});


app.delete('/api/results/:id', verifySessionToken, (req, res) => {
    resultsDb.run("DELETE FROM quiz_results WHERE id = ? AND userId = ?", [req.params.id, req.user.id], function (err) {
        if (err || this.changes === 0) return res.status(500).json({ message: 'Failed to delete result or not authorized.' });
        res.status(200).json({ message: 'Result deleted.' });
    });
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message, recipientEmail } = req.body;
    if (!name || !email || !message || !recipientEmail) return res.status(400).json({ message: 'All fields are required.' });
    if (!transporter) return res.status(503).json({ message: 'Email service not configured.' });
    try {
        await transporter.sendMail({ from: `"${name}" <${process.env.EMAIL_USER}>`, to: recipientEmail, subject: 'Contact Form', text: `From ${email}: ${message}` });
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) { res.status(500).json({ message: 'Failed to send message.' }); }
});

// --- Final export for Vercel ---
module.exports = app;