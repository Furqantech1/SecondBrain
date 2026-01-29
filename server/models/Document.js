const mongoose = require('mongoose');

const documentSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        filename: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            default: 'pdf',
        },
        size: {
            type: Number,
        },
        vectorId: {
            type: String, // Prefix used in Pinecone
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Document', documentSchema);
