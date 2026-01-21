// api/routes/contact.js
/**
 * Contact Routes
 * 
 * Handles contact form submissions via email using Nodemailer.
 * Sends contact form messages to the configured email address.
 * Requires EMAIL_USER and EMAIL_PASS environment variables for email functionality.
 */

const { Router } = require('express');
const nodemailer = require('nodemailer');
const { logApi, logError, logInfo } = require('../_utils/logger');

const router = Router();

/**
 * Email Transporter Configuration
 * 
 * Configures Nodemailer transporter for Gmail if credentials are available.
 */
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    logInfo('INFO', 'Nodemailer transporter configured.');
} else {
    logInfo('WARN', 'Email credentials not set. Contact form will not work.');
}

/**
 * POST /api/contact
 * 
 * Sends a contact form message via email.
 * Requires name, email, and message fields in the request body.
 * Returns 503 if email service is not configured.
 */
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;
    logApi('POST', '/api/contact', `From: ${name}`);

    if (!transporter) {
        res.status(503).json({ message: 'Email service is not configured on the server.' });
        return;
    }
    if (!name || !email || !message) {
        res.status(400).json({ message: 'All fields are required.' });
        return;
    }

    try {
        await transporter.sendMail({
            from: `"${name}" <${process.env.EMAIL_USER}>`,
            replyTo: email,
            to: process.env.EMAIL_USER, // Sends the contact email to yourself
            subject: `ReactiQuiz Contact Form: ${name}`,
            html: `<p><strong>From:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><hr/><p>${message.replace(/\n/g, '<br>')}</p>`,
        });
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        logError('EMAIL FAIL', 'Sending contact email failed', error.message);
        res.status(500).json({ message: 'Failed to send message.' });
    }
});

module.exports = router;