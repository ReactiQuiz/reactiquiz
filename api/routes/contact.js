// api/routes/contact.js
const { Router } = require('express');
const nodemailer = require('nodemailer');
const { logApi, logError, logInfo } = require('../_utils/logger');

const router = Router();

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

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;
    logApi('POST', '/api/contact', `From: ${name}`);

    if (!transporter) {
        return res.status(503).json({ message: 'Email service is not configured on the server.' });
    }
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
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