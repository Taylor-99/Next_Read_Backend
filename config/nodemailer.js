// Email functionality do when a new user is created, they will receive a welcome email

require('dotenv').config()
const nodemailer = require('nodemailer');

// Create the transporter
const transporter = nodemailer.createTransport({

    // Add the SMTP host, port and aithentication details (SMTP username and password). Brevo SMTP
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }

});

module.exports = transporter;