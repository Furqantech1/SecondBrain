/**
 * Generates an HTML email template for the weekly digest.
 * @param {Object} options
 * @param {string} options.username - The user's display name
 * @param {Array} options.documents - Array of { filename, createdAt, lastQueried }
 * @param {Array} options.suggestions - Array of { documentName, question }
 * @param {string} options.appUrl - The client application URL
 * @returns {string} HTML email content
 */
const generateDigestTemplate = ({ username, documents, suggestions, appUrl }) => {
    const documentRows = documents.map(doc => {
        const uploadDate = new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const lastQueried = doc.lastQueried
            ? new Date(doc.lastQueried).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Never';

        return `
            <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <div style="font-size: 14px; font-weight: 600; color: #e2e8f0;">📄 ${doc.filename}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                        Uploaded: ${uploadDate} · Last queried: ${lastQueried}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    const suggestionCards = suggestions.map(s => `
        <div style="background: rgba(0, 224, 255, 0.04); border: 1px solid rgba(0, 224, 255, 0.12); border-radius: 12px; padding: 14px 18px; margin-bottom: 10px;">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">📄 ${s.documentName}</div>
            <div style="font-size: 13px; color: #cbd5e1; font-weight: 500;">💡 "${s.question}"</div>
        </div>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Second Brain — Weekly Digest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #06060b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 28px; margin-bottom: 8px;">🧠</div>
            <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 6px 0;">Your Weekly Brain Digest</h1>
            <p style="font-size: 13px; color: #64748b; margin: 0;">Here's what's happening in your knowledge base</p>
        </div>

        <!-- Greeting -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #e2e8f0; margin: 0 0 8px 0;">
                Hey ${username || 'there'} 👋
            </p>
            <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.6;">
                You have <strong style="color: #00e0ff;">${documents.length} document${documents.length !== 1 ? 's' : ''}</strong> in your Second Brain.
                Here's a quick overview and some suggested questions to explore.
            </p>
        </div>

        <!-- Documents Table -->
        <div style="margin-bottom: 24px;">
            <h2 style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 4px;">Your Documents</h2>
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                    ${documentRows}
                </table>
            </div>
        </div>

        <!-- Suggested Questions -->
        ${suggestions.length > 0 ? `
        <div style="margin-bottom: 32px;">
            <h2 style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 4px;">Try Asking</h2>
            ${suggestionCards}
        </div>
        ` : ''}

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
            <a href="${appUrl}/dashboard" style="display: inline-block; padding: 14px 32px; background: #00e0ff; color: #06060b; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px; letter-spacing: 0.3px;">
                Open Second Brain →
            </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.04);">
            <p style="font-size: 11px; color: #475569; margin: 0;">
                Second Brain — Your AI-powered knowledge assistant
            </p>
            <p style="font-size: 10px; color: #334155; margin: 6px 0 0 0;">
                You received this because you have documents in your Second Brain.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
};

module.exports = { generateDigestTemplate };
