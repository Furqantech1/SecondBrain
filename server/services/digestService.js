const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Document = require('../models/Document');
const { generateDigestTemplate } = require('./digestTemplate');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Creates a transporter — reuses the same logic from emailService.
 * In production, uses real SMTP. In dev, uses Ethereal for testing.
 */
const createTransporter = async () => {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
        const testAccount = await nodemailer.createTestAccount();
        console.log('[Digest] Using Ethereal Email for testing');
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
};

/**
 * Generates suggested questions based on document filenames.
 * Uses simple heuristic templates (no Gemini API call to keep it cost-free).
 */
const generateSuggestions = (documents) => {
    const templates = [
        (name) => `What are the key takeaways from ${name}?`,
        (name) => `Summarize the main points of ${name}`,
        (name) => `What are the most important concepts in ${name}?`,
        (name) => `How does ${name} relate to my other documents?`,
        (name) => `What questions should I be asking about ${name}?`,
    ];

    // Pick up to 3 suggestions from the most recently uploaded/queried docs
    const topDocs = documents.slice(0, 3);
    return topDocs.map((doc, idx) => ({
        documentName: doc.filename,
        question: templates[idx % templates.length](doc.filename),
    }));
};

/**
 * Sends a weekly digest email to a single user.
 */
const sendDigestToUser = async (transporter, user, documents) => {
    const suggestions = generateSuggestions(documents);
    const html = generateDigestTemplate({
        username: user.username || user.email.split('@')[0],
        documents,
        suggestions,
        appUrl: CLIENT_URL,
    });

    try {
        const info = await transporter.sendMail({
            from: '"Second Brain" <no-reply@secondbrain.ai>',
            to: user.email,
            subject: '🧠 Your Weekly Brain Digest',
            html,
        });

        console.log(`[Digest] Sent to ${user.email}: ${info.messageId}`);
        if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
            console.log('[Digest] Preview URL:', nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error(`[Digest] Failed to send to ${user.email}:`, error.message);
    }
};

/**
 * Runs the digest job: finds all users with documents and sends each a digest.
 */
const runDigestJob = async () => {
    console.log('[Digest] Starting weekly digest job...');

    try {
        const transporter = await createTransporter();

        // Find all users who have at least one document
        const userIds = await Document.distinct('user');
        console.log(`[Digest] Found ${userIds.length} users with documents`);

        for (const userId of userIds) {
            try {
                const user = await User.findById(userId).select('email username');
                if (!user || !user.email) continue;

                const documents = await Document.find({ user: userId })
                    .sort({ lastQueried: -1, createdAt: -1 })
                    .limit(10)
                    .lean();

                if (documents.length === 0) continue;

                await sendDigestToUser(transporter, user, documents);
            } catch (userError) {
                console.error(`[Digest] Error processing user ${userId}:`, userError.message);
            }
        }

        console.log('[Digest] Weekly digest job completed.');
    } catch (error) {
        console.error('[Digest] Job failed:', error);
    }
};

/**
 * Initializes the weekly digest cron job.
 * Schedule: Every Sunday at 10:00 AM server time.
 * Guard: Only runs if ENABLE_DIGEST=true in environment.
 */
const initDigestCron = () => {
    if (process.env.ENABLE_DIGEST !== 'true') {
        console.log('[Digest] Weekly digest is disabled. Set ENABLE_DIGEST=true to enable.');
        return;
    }

    // Cron expression: At 10:00 AM every Sunday
    // minute hour day-of-month month day-of-week
    cron.schedule('0 10 * * 0', () => {
        console.log('[Digest] Cron triggered — running digest job');
        runDigestJob();
    }, {
        timezone: process.env.DIGEST_TIMEZONE || 'UTC'
    });

    console.log('[Digest] Weekly digest cron scheduled (Sundays at 10:00 AM)');
};

module.exports = { initDigestCron, runDigestJob };
