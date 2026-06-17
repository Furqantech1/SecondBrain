const mongoose = require('mongoose');

const highlightSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
        },
        documentName: {
            type: String,
        },
        aiExcerpt: {
            type: String,
            required: true,
        },
        sourceChunk: {
            type: String,
        },
        note: {
            type: String, // optional user annotation
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Highlight', highlightSchema);
