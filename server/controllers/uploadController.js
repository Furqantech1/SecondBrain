const fs = require('fs');
const pdf = require('pdf-parse');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const pinecone = require('../services/pineconeService');
const { TaskType } = require('@google/generative-ai');

// Ensure PINECONE_INDEX is set (or hardcode for now if user missed it, but env is better)
const INDEX_NAME = process.env.PINECONE_INDEX || 'second-brain';

const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const dataBuffer = fs.readFileSync(req.file.path);

        // 1. Extract Text
        console.log('[Upload] Extracting text from PDF...');
        const pdfData = await pdf(dataBuffer);
        const rawText = pdfData.text;

        // 2. Chunk Text
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const chunks = await splitter.createDocuments([rawText]);

        // 3. Generate Embeddings using Gemini
        console.log(`[Upload] Initializing Embeddings with model: text-embedding-004`);
        
        // 3. Clean Integration: Configure maxConcurrency to help LangChain manage internal API queues
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "models/gemini-embedding-001",
            taskType: TaskType.RETRIEVAL_DOCUMENT,
            maxConcurrency: 1, // Restrict concurrent API calls
            maxRetries: 3      // Built-in resilience for temporary errors
        });

        // Prepare vectors for Pinecone
        const vectors = [];
        const chunkTexts = chunks.map(chunk => chunk.pageContent);

        console.log(`[Upload] Generating embeddings for ${chunkTexts.length} chunks...`);
        let chunkEmbeddings = [];

        // Utility: delay function for rate limiting
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        // Utility: retry with exponential backoff for 429 errors
        const retryWithBackoff = async (fn, maxRetries = 3, baseDelayMs = 5000) => {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    return await fn();
                } catch (error) {
                    const is429 = error.message?.includes('429') || error.status === 429;
                    if (is429 && attempt < maxRetries) {
                        const waitMs = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1000;
                        console.warn(`[Upload] ⚠️ Rate limited (429). Retry ${attempt}/${maxRetries} in ${Math.round(waitMs / 1000)}s...`);
                        await delay(waitMs);
                    } else {
                        throw error;
                    }
                }
            }
        };

        // Staggered Batch Execution with Rate Limit Jitter
        // BATCH_SIZE = 1: Process one chunk at a time to stay well under Free Tier RPM
        // JITTER_MS = 4000: 4 seconds between chunks (Free Tier allows ~15 RPM for embeddings)
        const BATCH_SIZE = 1;
        const JITTER_MS = 4000;

        for (let i = 0; i < chunkTexts.length; i += BATCH_SIZE) {
            const batch = chunkTexts.slice(i, i + BATCH_SIZE);
            console.log(`[Upload] Processing chunk ${i + 1} of ${chunkTexts.length}`);
            
            try {
                // Retry each batch up to 3 times with exponential backoff on 429
                const batchEmbeddings = await retryWithBackoff(
                    () => embeddings.embedDocuments(batch),
                    3,    // maxRetries
                    5000  // baseDelayMs (5s, 10s, 20s)
                );
                chunkEmbeddings.push(...batchEmbeddings);
            } catch (embError) {
                console.error(`[Upload] ❌ Embedding failed for chunk ${i} after all retries:`, embError.message);
                
                // Error Resilience: push nulls to keep indices aligned, continue processing
                for (let j = 0; j < batch.length; j++) {
                    chunkEmbeddings.push(null);
                }
            }

            // Apply Rate Limit Jitter between chunks (skip delay after the final chunk)
            if (i + BATCH_SIZE < chunkTexts.length) {
                await delay(JITTER_MS);
            }
        }

        console.log(`[Upload] Embeddings loop completed.`);

        // Build Pinecone vectors, filtering out any chunks that failed to embed
        for (let i = 0; i < chunks.length; i++) {
            if (chunkEmbeddings[i]) {
                vectors.push({
                    id: `${req.file.filename}_${i}`,
                    values: chunkEmbeddings[i],
                    metadata: {
                        text: chunks[i].pageContent,
                        filename: req.file.originalname,
                        page: 1,
                        user: req.user.id,
                        documentId: req.file.filename
                    }
                });
            } else {
                console.warn(`[Upload] ⚠️ Skipping chunk ${i} due to missing embedding from earlier error.`);
            }
        }

        // 4. Store in Pinecone
        const index = pinecone.index(INDEX_NAME);
        if (vectors.length > 0) {
            console.log(`[Upload] Upserting ${vectors.length} vectors to Pinecone index: ${INDEX_NAME}`);
            // batch upsert (Pinecone limit is usually 1000 vectors per call)
            await index.upsert(vectors);
        } else {
            console.warn(`[Upload] ⚠️ No successful embeddings generated. Skipping Pinecone upsert.`);
        }

        const Document = require('../models/Document');

        // ... imports ...

        // Inside uploadFile, after index.upsert(vectors)

        // 5. Save to MongoDB for History
        await Document.create({
            user: req.user.id, // req.user is set by 'protect' middleware
            filename: req.file.originalname,
            fileType: req.file.mimetype || 'pdf',
            size: req.file.size,
            vectorId: req.file.filename // simpler ref
        });

        // Initial cleanup (optional: remove temp file)
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: 'File processed and embedded successfully',
            chunks: chunks.length,
            filename: req.file.originalname,
            documentId: req.file.filename
        });

    } catch (error) {
        console.error('Upload Error:', error);
        // Always clean up the temp file, even on failure
        try { if (req.file?.path) fs.unlinkSync(req.file.path); } catch (_) {}
        res.status(500).json({ message: 'Error processing file', error: error.message });
    }
};

const getDocuments = async (req, res) => {
    try {
        const Device = require('../models/Document'); // Ensure correct model import if not already at top
        const documents = await require('../models/Document').find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json(documents);
    } catch (error) {
        console.error('Fetch Documents Error:', error);
        res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const Document = require('../models/Document');
        const doc = await Document.findOne({ _id: req.params.id, user: req.user.id });

        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete vectors from Pinecone
        try {
            const index = pinecone.index(INDEX_NAME);
            // Pinecone serverless: delete by metadata filter
            await index.deleteMany({
                filter: { documentId: doc.vectorId, user: req.user.id }
            });
            console.log(`[Delete] Removed vectors for document: ${doc.filename}`);
        } catch (pineconeError) {
            console.error('[Delete] Pinecone deletion error (continuing):', pineconeError.message);
            // Continue even if Pinecone fails — still clean up MongoDB
        }

        // Delete MongoDB record
        await Document.findByIdAndDelete(req.params.id);

        // Delete associated highlights
        try {
            const Highlight = require('../models/Highlight');
            await Highlight.deleteMany({ document: req.params.id });
        } catch (hlError) {
            console.error('[Delete] Highlight cleanup error (non-critical):', hlError.message);
        }

        res.json({ message: 'Document and vectors deleted successfully' });
    } catch (error) {
        console.error('Delete Document Error:', error);
        res.status(500).json({ message: 'Error deleting document', error: error.message });
    }
};

module.exports = { uploadFile, getDocuments, deleteDocument };
