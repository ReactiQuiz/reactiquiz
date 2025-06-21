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
    if (error || !challenge) return res.status(404).json({ message: "Challenge not found." });

    let updates = {};
    let newStatus = challenge.status;

    if (challenge.challenger_id === req.user.id) {
        updates = { challenger_score: score, challenger_percentage: percentage, challenger_time_taken: timeTaken };
        newStatus = challenge.challenged_score !== null ? 'completed' : 'challenger_completed';
    } else if (challenge.challenged_id === req.user.id) {
        updates = { challenged_score: score, challenged_percentage: percentage, challenged_time_taken: timeTaken };
        newStatus = 'completed';
    } else {
        return res.status(403).json({ message: 'Not part of this challenge.' });
    }

    updates.status = newStatus;
    if (newStatus === 'completed') {
        const cScore = updates.challenger_score ?? challenge.challenger_score;
        const dScore = updates.challenged_score ?? challenge.challenged_score;
        if (cScore > dScore) updates.winner_id = challenge.challenger_id;
        else if (dScore > cScore) updates.winner_id = challenge.challenged_id;
    }

    const { error: updateError } = await supabase.from('challenges').update(updates).eq('id', req.params.challengeId);
    if (updateError) return res.status(500).json({ message: 'Failed to submit score.' });

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

app.get('/api/challenges/pending', verifySessionToken, async (req, res) => {
    const currentUserId = req.user.id;
    // console.log('[API_LOG] GET /api/challenges/pending for User ID:', currentUserId); // Good for Vercel logs

    try {
        const { data: challenges, error } = await supabase
            .from('challenges')
            .select(`
                *,
                challenger:challenger_id ( id, identifier ),
                challenged:challenged_id ( id, identifier )
            `)
            .eq('challenged_id', currentUserId)
            .or('status.eq.pending,status.eq.challenger_completed') // Fetch if pending for challenged OR if challenger completed & waiting for challenged
            .gt('expires_at', new Date().toISOString()) // Check for expiration
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[API_ERROR] Supabase error fetching pending challenges:', error);
            return res.status(500).json({ message: 'Error fetching pending challenges.' });
        }

        if (!challenges || challenges.length === 0) {
            return res.json([]);
        }

        // Transform data to match frontend expectations if needed
        const enrichedChallenges = challenges.map(c => ({
            ...c,
            challengerUsername: c.challenger ? c.challenger.identifier : 'Unknown',
            challengedUsername: c.challenged ? c.challenged.identifier : 'Unknown',
            // question_ids_json is likely already a string from DB, no need to re-parse here for this list view
        }));

        // console.log('[API_LOG] Pending challenges found:', enrichedChallenges.length);
        res.json(enrichedChallenges);

    } catch (e) {
        console.error('[API_ERROR] Unexpected error in /api/challenges/pending:', e);
        res.status(500).json({ message: 'Server error processing pending challenges.' });
    }
});
app.post('/api/users/register', async (req, res) => {
    const { identifier, password, email, address, class: userClass } = req.body; // Ensure it handles address and class
    if (!identifier || !password || !email || !address || !userClass) return res.status(400).json({ message: 'Identifier, password, email, address, and class are required.' });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Ensure your Supabase users table insert includes address and class
        const { error } = await supabase.from('users').insert({
            identifier,
            password: hashedPassword,
            email,
            address, // Include address
            class: userClass, // Include class
            createdAt: new Date().toISOString()
        });
        if (error) {
            if (error.code === '23505' && error.message.includes('users_identifier_key')) return res.status(409).json({ message: 'Username already exists.' });
            if (error.code === '23505' && error.message.includes('users_email_key')) return res.status(409).json({ message: 'Email already registered.' });
            console.error("Registration Error (Supabase):", error);
            throw error;
        }
        res.status(201).json({ message: 'Registration successful!' });
    } catch (err) {
        console.error("Catch block Registration Error:", err);
        res.status(500).json({ message: 'Error registering user.' });
    }
});

// Ensure /api/users/verify-otp returns address and class in the user object
app.post('/api/users/verify-otp', async (req, res) => {
    const { identifier, otp, deviceIdFromClient } = req.body;
    // ... (initial checks for identifier, otp, deviceIdFromClient) ...

    const { data: user, error: userFetchError } = await supabase
        .from('users')
        .select('*') // Select all necessary fields
        .eq('identifier', identifier.trim())
        .single();

    if (userFetchError || !user) {
        console.error("[API_ERROR] /verify-otp - User not found or DB error:", userFetchError);
        return res.status(404).json({ message: "User not found." });
    }

    if (user.login_otp !== otp) {
        console.warn(`[API_WARN] /verify-otp - Invalid OTP for user: ${identifier}`);
        return res.status(400).json({ message: "Invalid OTP." });
    }

    if (new Date() > new Date(user.login_otp_expires_at)) {
        console.warn(`[API_WARN] /verify-otp - OTP expired for user: ${identifier}`);
        // Optionally clear the expired OTP from the database
        await supabase.from('users').update({ login_otp: null, login_otp_expires_at: null }).eq('id', user.id);
        return res.status(400).json({ message: "OTP has expired. Please try logging in again." });
    }

    // If OTP is valid and not expired, generate a NEW session token
    const newSessionToken = generateSecureToken(); // Use a different variable name here
    const expires = new Date(Date.now() + TOKEN_EXPIRATION_MS).toISOString();

    const { error: updateError } = await supabase
        .from('users')
        .update({
            registered_device_id: deviceIdFromClient,
            active_session_token: newSessionToken, // Use the new variable
            active_session_token_expires_at: expires,
            login_otp: null, // Clear the used OTP
            login_otp_expires_at: null
        })
        .eq('id', user.id);

    if (updateError) {
        console.error("[API_ERROR] /verify-otp - Supabase error updating user session:", updateError);
        return res.status(500).json({ message: "Error finalizing login. Please try again." });
    }

    console.log(`[API_SUCCESS] /verify-otp - Login successful for: ${identifier}`);
    res.status(200).json({
        message: "Login successful.",
        user: {
            id: user.id,
            name: user.identifier,
            email: user.email,
            address: user.address,
            class: user.class
        },
        token: newSessionToken // Send the NEWLY generated token back to the client
    });
});


// --- NEW: User Details Update Endpoint (Supabase) ---
app.put('/api/users/update-details', verifySessionToken, async (req, res) => {
    const userId = req.user.id; // req.user should be populated by verifySessionToken
    const { address, class: userClass } = req.body;
    console.log(`[API_LOG] PUT /api/users/update-details for User ID: ${userId}`);

    if (!address || !userClass) {
        return res.status(400).json({ message: 'Address and class are required.' });
    }

    try {
        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ address: address.trim(), class: userClass.trim() })
            .eq('id', userId)
            .select('id, identifier, email, address, class') // Select the fields to return
            .single();

        if (error) {
            console.error("[API_ERROR] Supabase error updating user details:", error);
            throw error; // Will be caught by the outer catch block
        }

        if (!updatedUser) {
            // This case might happen if RLS prevents the update or the user ID is wrong,
            // though verifySessionToken should ensure user exists.
            console.warn(`[API_WARN] User ${userId} not found after update or no changes made.`);
            return res.status(404).json({ message: 'User not found or no changes applied.' });
        }

        console.log(`[API_SUCCESS] Details updated for user ID: ${userId}`);
        res.status(200).json({ message: 'Details updated successfully!', user: updatedUser });

    } catch (error) { // Catch errors from the try block
        res.status(500).json({ message: 'Failed to update user details.' });
    }
});


// --- NEW: User Stats API Endpoint (Supabase) ---
app.get('/api/users/stats', verifySessionToken, async (req, res) => {
    const userId = req.user.id; // req.user populated by verifySessionToken
    console.log(`[API_LOG] GET /api/users/stats for User ID: ${userId}`);

    try {
        // Fetch aggregate stats: total quizzes and average percentage
        const { data: resultsData, error: resultsError, count: totalQuizzesSolved } = await supabase
            .from('quiz_results')
            .select('percentage', { count: 'exact', head: false }) // Get count and percentage
            .eq('userId', userId);

        if (resultsError) {
            console.error("[API_ERROR] Supabase error fetching aggregate stats:", resultsError);
            throw resultsError;
        }

        let overallAveragePercentage = 0;
        if (totalQuizzesSolved > 0 && resultsData) {
            const sumOfPercentages = resultsData.reduce((sum, r) => sum + (r.percentage || 0), 0);
            overallAveragePercentage = Math.round(sumOfPercentages / totalQuizzesSolved);
        }

        // Fetch timestamps for activity data
        const { data: activityTimestampData, error: activityError } = await supabase
            .from('quiz_results')
            .select('timestamp')
            .eq('userId', userId)
            .order('timestamp', { ascending: true });

        if (activityError) {
            console.error("[API_ERROR] Supabase error fetching activity timestamps:", activityError);
            // Decide if you want to throw or proceed without activityData
        }

        let activityData = [];
        if (activityTimestampData && activityTimestampData.length > 0) {
            const countsByDay = {};
            activityTimestampData.forEach(r => {
                try {
                    const datePart = r.timestamp.substring(0, 10); // YYYY-MM-DD
                    countsByDay[datePart] = (countsByDay[datePart] || 0) + 1;
                } catch (e) {
                    console.warn(`[API_WARN] Could not parse timestamp for activity: ${r.timestamp}`);
                }
            });
            activityData = Object.entries(countsByDay)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        console.log(`[API_SUCCESS] Fetched stats for user ID: ${userId}`);
        res.json({
            totalQuizzesSolved: totalQuizzesSolved || 0,
            overallAveragePercentage,
            activityData
        });

    } catch (error) { // Catch any error from the try block
        console.error("[API_ERROR] Overall error in /api/users/stats:", error);
        res.status(500).json({ message: 'Failed to retrieve user statistics.' });
    }
});


// --- FINAL EXPORT FOR VERCEL ---
export default app;