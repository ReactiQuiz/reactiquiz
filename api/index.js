// --- FULL AND FINAL CODE for api/index.js ---

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

// --- CORS Configuration ---
const allowedOrigins = [
  'https://sanskarsontakke.github.io', // Your GH Pages URL
  'https://reactiquiz.vercel.app',    // Your Vercel domain
  'http://localhost:3000'            // For local development
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));

// --- HELPERS & MIDDLEWARE ---
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;
const OTP_EXPIRATION_MS = 10 * 60 * 1000;
const CHALLENGE_EXPIRATION_DAYS = 7;
const generateSecureToken = () => crypto.randomBytes(32).toString('hex');
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

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

const verifySessionToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication token is required.' });
    const token = authHeader.split(' ')[1];
    const { data: user, error } = await supabase.from('users').select('*').eq('active_session_token', token).single();
    if (error || !user) return res.status(401).json({ message: "Invalid session token." });
    if (new Date() > new Date(user.active_session_token_expires_at)) return res.status(401).json({ message: "Session token expired." });
    req.user = user;
    next();
};

// --- API ROUTES ---

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

// --- USER & AUTH ROUTES ---

app.post('/api/users/register', async (req, res) => {
    const { identifier, password, email, address, class: userClass } = req.body;
    if (!identifier || !password || !email) return res.status(400).json({ message: 'Identifier, password, and email are required.' });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { error } = await supabase.from('users').insert({ identifier, password: hashedPassword, email, address, class: userClass });
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

app.post('/api/users/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Username and password are required.' });
    const { data: user, error } = await supabase.from('users').select('*').eq('identifier', identifier.trim()).single();
    if (error || !user) return res.status(401).json({ message: 'Invalid username or password.' });
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Invalid username or password.' });
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MS).toISOString();
    const { error: updateError } = await supabase.from('users').update({ login_otp: otp, login_otp_expires_at: otpExpiresAt }).eq('id', user.id);
    if (updateError) return res.status(500).json({ message: 'Error preparing login.' });
    if (!transporter) return res.status(503).json({ message: 'Email service is not configured.' });
    try {
        await transporter.sendMail({ from: `"${process.env.EMAIL_SENDER_NAME || 'ReactiQuiz'}" <${process.env.EMAIL_USER}>`, to: user.email, subject: 'ReactiQuiz Login Code', text: `Your OTP is: ${otp}` });
        res.status(200).json({ success: true, message: `An OTP has been sent to your email.` });
    } catch (emailError) { res.status(500).json({ message: 'Failed to send OTP email.' }); }
});

app.post('/api/users/verify-otp', async (req, res) => {
    const { identifier, otp, deviceIdFromClient } = req.body;
    if (!identifier || !otp || !deviceIdFromClient) return res.status(400).json({ message: 'Identifier, OTP, and device ID are required.' });
    const { data: user, error } = await supabase.from('users').select('*').eq('identifier', identifier.trim()).single();
    if (error || !user) return res.status(404).json({ message: "User not found." });
    if (user.login_otp !== otp || new Date() > new Date(user.login_otp_expires_at)) return res.status(400).json({ message: "Invalid or expired OTP." });
    const token = generateSecureToken();
    const expires = new Date(Date.now() + TOKEN_EXPIRATION_MS).toISOString();
    const { error: updateError } = await supabase.from('users').update({ registered_device_id: deviceIdFromClient, active_session_token: token, active_session_token_expires_at: expires, login_otp: null, login_otp_expires_at: null }).eq('id', user.id);
    if (updateError) return res.status(500).json({ message: "Error finalizing login." });
    res.status(200).json({ message: "Login successful.", user: { id: user.id, name: user.identifier, email: user.email, address: user.address, class: user.class }, token });
});

app.post('/api/users/change-password', verifySessionToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 6) return res.status(400).json({ message: 'Invalid input.' });
    const { data: user, error } = await supabase.from('users').select('password').eq('id', req.user.id).single();
    if (error || !user) return res.status(500).json({ message: 'User not found.' });
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Incorrect old password.' });
    const newHashed = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase.from('users').update({ password: newHashed }).eq('id', req.user.id);
    if (updateError) return res.status(500).json({ message: 'Error changing password.' });
    res.status(200).json({ message: 'Password changed successfully.' });
});

// --- FRIENDS & SOCIAL ROUTES ---

app.get('/api/users/search', verifySessionToken, async (req, res) => {
    const { username } = req.query;
    if (!username || username.trim().length < 2) return res.status(400).json({ message: 'Search term must be at least 2 characters.' });
    const { data, error } = await supabase.from('users').select('id, identifier').ilike('identifier', `%${username.trim()}%`).neq('id', req.user.id).limit(10);
    if (error) return res.status(500).json({ message: 'Error searching for users.' });
    res.json(data || []);
});

app.post('/api/friends/request', verifySessionToken, async (req, res) => {
    const { receiverUsername } = req.body;
    const { data: receiver, error: receiverError } = await supabase.from('users').select('id').eq('identifier', receiverUsername.trim()).single();
    if (receiverError || !receiver) return res.status(404).json({ message: 'User not found.' });
    if (req.user.id === receiver.id) return res.status(400).json({ message: "You cannot friend yourself." });
    const { data: existing, error: existingError } = await supabase.from('friendships').select('*').or(`(requester_id.eq.${req.user.id},and(receiver_id.eq.${receiver.id})),(requester_id.eq.${receiver.id},and(receiver_id.eq.${req.user.id}))`).single();
    if (existing) return res.status(400).json({ message: 'A friend request or friendship already exists.' });
    const { error } = await supabase.from('friendships').insert({ requester_id: req.user.id, receiver_id: receiver.id });
    if (error) return res.status(500).json({ message: 'Failed to send friend request.' });
    res.status(201).json({ message: 'Friend request sent.' });
});

app.get('/api/friends/requests/pending', verifySessionToken, async (req, res) => {
    const { data, error } = await supabase.from('friendships').select('id, requester:requester_id(id, identifier)').eq('receiver_id', req.user.id).eq('status', 'pending');
    if (error) return res.status(500).json({ message: 'Error fetching requests.' });
    res.json(data.map(r => ({ requestId: r.id, userId: r.requester.id, username: r.requester.identifier })) || []);
});

app.put('/api/friends/request/:requestId', verifySessionToken, async (req, res) => {
    const { action } = req.body;
    if (!['accept', 'decline'].includes(action)) return res.status(400).json({ message: 'Invalid action.' });
    const { error } = await supabase.from('friendships').update({ status: action === 'accept' ? 'accepted' : 'declined' }).match({ id: req.params.requestId, receiver_id: req.user.id, status: 'pending' });
    if (error) return res.status(500).json({ message: `Failed to ${action} request.` });
    res.status(200).json({ message: `Friend request ${action}ed.` });
});

app.get('/api/friends', verifySessionToken, async (req, res) => {
    const { data, error } = await supabase.from('friendships').select('requester_id, receiver_id').eq('status', 'accepted').or(`requester_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`);
    if (error) return res.status(500).json({ message: 'Error fetching friends list.' });
    const friendIds = data.map(f => f.requester_id === req.user.id ? f.receiver_id : f.requester_id);
    if (friendIds.length === 0) return res.json([]);
    const { data: friends, error: friendsError } = await supabase.from('users').select('id, identifier').in('id', friendIds);
    if (friendsError) return res.status(500).json({ message: 'Error fetching friend details.' });
    res.json(friends.map(f => ({ friendId: f.id, friendUsername: f.identifier })) || []);
});

// --- QUIZ & TOPIC ROUTES ---

app.get('/api/topics/:subject', async (req, res) => {
    const { data, error } = await supabase.from('quiz_topics').select('*').eq('subject', req.params.subject.toLowerCase());
    if (error) return res.status(500).json({ message: 'Failed to fetch topics.' });
    res.json(data || []);
});

app.get('/api/questions', async (req, res) => {
    const { topicId } = req.query;
    if (!topicId) return res.status(400).json({ message: 'A topicId query parameter is required.' });
    const { data, error } = await supabase.from('questions').select('*').eq('topicId', topicId);
    if (error) return res.status(500).json({ message: 'Failed to fetch questions.' });
    res.json(data || []);
});

// --- RESULTS & CHALLENGE ROUTES ---

app.post('/api/results', verifySessionToken, async (req, res) => {
    const { subject, topicId, score, totalQuestions, percentage, difficulty, numQuestionsConfigured, class: className, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot, challenge_id } = req.body;
    const resultData = { userId: req.user.id, subject, topicId, score, totalQuestions, percentage, timestamp: new Date().toISOString(), difficulty, numQuestionsConfigured, class: className, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot, challenge_id };
    const { data, error } = await supabase.from('quiz_results').insert(resultData).select().single();
    if (error) return res.status(500).json({ message: 'Failed to save result.' });
    res.status(201).json({ message: 'Result saved successfully!', id: data.id });
});

app.get('/api/results', verifySessionToken, async (req, res) => {
    const { excludeChallenges, limit } = req.query;
    let query = supabase.from('quiz_results').select('*').eq('userId', req.user.id);
    if (excludeChallenges === 'true') query = query.is('challenge_id', null);
    query = query.order('timestamp', { ascending: false });
    if (limit) query = query.limit(parseInt(limit));
    const { data, error } = await query;
    if (error) return res.status(500).json({ message: 'Failed to fetch results.' });
    res.json(data || []);
});

app.delete('/api/results/:id', verifySessionToken, async (req, res) => {
    const { error } = await supabase.from('quiz_results').delete().match({ id: req.params.id, userId: req.user.id });
    if (error) return res.status(500).json({ message: 'Failed to delete result.' });
    res.status(200).json({ message: 'Result deleted.' });
});

app.post('/api/challenges', verifySessionToken, async (req, res) => {
    const { challenged_friend_id, topic_id, topic_name, difficulty, num_questions, quiz_class, question_ids_json, subject } = req.body;
    const expires_at = new Date(Date.now() + CHALLENGE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase.from('challenges').insert({ challenger_id: req.user.id, challenged_id: challenged_friend_id, topic_id, topic_name, difficulty, num_questions, quiz_class, question_ids_json, subject, expires_at }).select().single();
    if (error) return res.status(500).json({ message: 'Failed to create challenge.' });
    res.status(201).json({ message: 'Challenge sent!', challengeId: data.id });
});

app.put('/api/challenges/:challengeId/submit', verifySessionToken, async (req, res) => {
    const { score, percentage, timeTaken, resultId } = req.body;
    const { data: challenge, error } = await supabase.from('challenges').select('*').eq('id', req.params.challengeId).single();
    if(error || !challenge) return res.status(404).json({ message: "Challenge not found." });

    let updates = {};
    let newStatus = challenge.status;

    if(challenge.challenger_id === req.user.id) {
        updates = { challenger_score: score, challenger_percentage: percentage, challenger_time_taken: timeTaken };
        newStatus = challenge.challenged_score !== null ? 'completed' : 'challenger_completed';
    } else if(challenge.challenged_id === req.user.id) {
        updates = { challenged_score: score, challenged_percentage: percentage, challenged_time_taken: timeTaken };
        newStatus = 'completed';
    } else {
        return res.status(403).json({ message: 'Not part of this challenge.' });
    }

    updates.status = newStatus;
    if (newStatus === 'completed') {
        const cScore = updates.challenger_score ?? challenge.challenger_score;
        const dScore = updates.challenged_score ?? challenge.challenged_score;
        if(cScore > dScore) updates.winner_id = challenge.challenger_id;
        else if(dScore > cScore) updates.winner_id = challenge.challenged_id;
    }
    
    const { error: updateError } = await supabase.from('challenges').update(updates).eq('id', req.params.challengeId);
    if(updateError) return res.status(500).json({ message: 'Failed to submit score.' });
    
    // Link result to challenge
    await supabase.from('quiz_results').update({ challenge_id: req.params.challengeId }).eq('id', resultId);

    res.status(200).json({ message: 'Challenge score submitted.', status: newStatus });
});

// --- CONTACT ROUTE ---
app.post('/api/contact', async (req, res) => {
    const { name, email, message, recipientEmail } = req.body;
    if (!name || !email || !message || !recipientEmail) return res.status(400).json({ message: 'All fields are required.' });
    if (!transporter) return res.status(503).json({ message: 'Email service not configured.' });
    try {
        await transporter.sendMail({ from: `"${name}" <${process.env.EMAIL_USER}>`, to: recipientEmail, subject: 'Contact Form', text: `From ${email}: ${message}` });
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) { res.status(500).json({ message: 'Failed to send message.' }); }
});

app.get('/api/subjects', async (req, res) => {
    const { data, error } = await supabase.from('subjects').select('*').order('displayOrder', { ascending: true });
    if (error) {
        console.error("Supabase Error fetching subjects:", error);
        return res.status(500).json({ message: 'Failed to fetch subjects.' });
    }
    res.json(data || []);
});

// --- FINAL EXPORT FOR VERCEL ---
export default app;