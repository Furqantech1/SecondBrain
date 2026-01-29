const nodemailer = require('nodemailer');

// Create a transporter using Ethereal Email (for testing) or real SMTP
const createTransporter = async () => {
    // For development/testing, we use Ethereal
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
        const testAccount = await nodemailer.createTestAccount();

        console.log('Using Ethereal Email for testing');
        console.log(`Ethereal User: ${testAccount.user}`);
        console.log(`Ethereal Pass: ${testAccount.pass}`);

        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    // For production (or if creds provided)
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendWelcomeEmail = async (email, name) => {
    try {
        const transporter = await createTransporter();

        const info = await transporter.sendMail({
            from: '"Second Brain" <no-reply@secondbrain.ai>',
            to: email,
            subject: "Welcome to your Second Brain 🧠",
            html: `
                <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #4F46E5;">Welcome to Second Brain!</h1>
                    <p>Hi ${name || 'Explorer'},</p>
                    <p>We're thrilled to have you on board. Your personal intelligence database is ready to be built.</p>
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Upload your first PDF document</li>
                        <li>Ask the AI a question about it</li>
                        <li>Explore the dashboard</li>
                    </ul>
                    <p>If you have any questions, just reply to this email.</p>
                    <p>Happy Thinking,<br/>The Second Brain Team</p>
                </div>
            `,
        });

        console.log("Welcome email sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error("Error sending welcome email:", error);
        // Don't throw, just log. We don't want to block signup if email fails.
    }
};

const sendLoginAlert = async (email, username) => {
    try {
        const transporter = await createTransporter();
        const date = new Date().toLocaleString();

        const info = await transporter.sendMail({
            from: '"Second Brain Security" <no-reply@secondbrain.ai>',
            to: email,
            subject: "New Login Detected 🔐",
            html: `
                <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #4F46E5;">New Login to Second Brain</h2>
                    <p>Hi ${username},</p>
                    <p>We detected a new login to your account on <strong>${date}</strong>.</p>
                    <p>If this was you, you can safely ignore this email.</p>
                    <p style="background-color: #fee2e2; color: #991b1b; padding: 10px; border-radius: 5px;">
                        <strong>If this wasn't you, please reset your password immediately.</strong>
                    </p>
                    <p>Stay Safe,<br/>The Second Brain Team</p>
                </div>
            `,
        });

        console.log("Login alert sent: %s", info.messageId);
        if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error("Error sending login alert:", error);
    }
};

module.exports = { sendWelcomeEmail, sendLoginAlert };
