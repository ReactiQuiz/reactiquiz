// backend/routes/contactRoutes.js
const express = require('express');
const { transporter } = require('../utils/authUtils');
const { logApi, logError } = require('../utils/logger');

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, email, message, recipientEmail } = req.body;
    logApi('POST', '/api/contact', `From: ${name} <${email}>`);

    if (!name || !email || !message || !recipientEmail) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!transporter) {
        logError('EMAIL FAIL', 'Contact form submitted but transporter not ready');
        return res.status(503).json({ message: 'The email service is not configured on the server.' });
    }

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        replyTo: email,
        to: recipientEmail,
        subject: `Contact Form Submission from ${name} via ReactiQuiz`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        logError('EMAIL FAIL', 'Sending contact form email failed', error.message);
        res.status(500).json({ message: 'Failed to send message.' });
    }
});

module.exports = router;