const express = require('express');
const router = express.Router();
const Highlight = require('../models/Highlight');
const { protect } = require('../middleware/auth');

// POST /api/highlights — save a new highlight
router.post('/', protect, async (req, res) => {
    try {
        const { document, documentName, aiExcerpt, sourceChunk, note } = req.body;

        if (!aiExcerpt) {
            return res.status(400).json({ message: 'aiExcerpt is required' });
        }

        const highlight = await Highlight.create({
            user: req.user.id,
            document: document || undefined,
            documentName: documentName || '',
            aiExcerpt,
            sourceChunk: sourceChunk || '',
            note: note || '',
        });

        res.status(201).json(highlight);
    } catch (error) {
        console.error('Create Highlight Error:', error);
        res.status(500).json({ message: 'Error saving highlight', error: error.message });
    }
});

// GET /api/highlights — list all user highlights (newest first)
router.get('/', protect, async (req, res) => {
    try {
        const highlights = await Highlight.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .lean();

        res.json(highlights);
    } catch (error) {
        console.error('Fetch Highlights Error:', error);
        res.status(500).json({ message: 'Error fetching highlights', error: error.message });
    }
});

// DELETE /api/highlights/:id — remove a highlight
router.delete('/:id', protect, async (req, res) => {
    try {
        const highlight = await Highlight.findOne({ _id: req.params.id, user: req.user.id });

        if (!highlight) {
            return res.status(404).json({ message: 'Highlight not found' });
        }

        await Highlight.findByIdAndDelete(req.params.id);
        res.json({ message: 'Highlight deleted' });
    } catch (error) {
        console.error('Delete Highlight Error:', error);
        res.status(500).json({ message: 'Error deleting highlight', error: error.message });
    }
});

// GET /api/highlights/export — export all highlights as Markdown
router.get('/export', protect, async (req, res) => {
    try {
        const highlights = await Highlight.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .lean();

        // Group highlights by document name
        const grouped = {};
        highlights.forEach(h => {
            const key = h.documentName || 'General';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(h);
        });

        // Build Markdown
        let md = '# Second Brain — Saved Highlights\n\n';
        md += `_Exported on ${new Date().toLocaleDateString()}_\n\n---\n\n`;

        for (const [docName, items] of Object.entries(grouped)) {
            md += `## 📄 ${docName}\n\n`;
            items.forEach((h, idx) => {
                md += `### Highlight ${idx + 1}\n\n`;
                md += `> ${h.aiExcerpt}\n\n`;
                if (h.sourceChunk) {
                    md += `**Source:** _${h.sourceChunk.substring(0, 300)}${h.sourceChunk.length > 300 ? '...' : ''}_\n\n`;
                }
                if (h.note) {
                    md += `📝 **Note:** ${h.note}\n\n`;
                }
                md += `_Saved: ${new Date(h.createdAt).toLocaleString()}_\n\n---\n\n`;
            });
        }

        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="second-brain-highlights.md"');
        res.send(md);
    } catch (error) {
        console.error('Export Highlights Error:', error);
        res.status(500).json({ message: 'Error exporting highlights', error: error.message });
    }
});

module.exports = router;
