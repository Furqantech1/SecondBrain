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
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "models/gemini-embedding-001",
            taskType: TaskType.RETRIEVAL_DOCUMENT,
        });

        // Prepare vectors for Pinecone
        // We process in batches to avoid hitting API limits
        const vectors = [];

        // We need to generate embeddings for each chunk's content
        // Note: LangChain's embeddings.embedDocuments takes an array of strings
        const chunkTexts = chunks.map(chunk => chunk.pageContent);

        console.log(`[Upload] Generating embeddings for ${chunkTexts.length} chunks...`);
        let chunkEmbeddings;
        try {
            chunkEmbeddings = await embeddings.embedDocuments(chunkTexts);
        } catch (embError) {
            console.error('[Upload] Embedding Generation Failed:', embError);
            throw new Error(`Embedding Generation Failed: ${embError.message}`);
        }
        console.log(`[Upload] Embeddings generated successfully.`);
        console.log(`[Upload] chunks count: ${chunkEmbeddings.length}`);
        if (chunkEmbeddings.length > 0) {
            console.log(`[Upload] First chunk embedding length: ${chunkEmbeddings[0] ? chunkEmbeddings[0].length : 'undefined'}`);
            console.log(`[Upload] First chunk text preview: ${chunkTexts[0].substring(0, 50)}...`);
        }

        for (let i = 0; i < chunks.length; i++) {
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
        }

        // 4. Store in Pinecone
        const index = pinecone.index(INDEX_NAME);
        console.log(`[Upload] Upserting to Pinecone index: ${INDEX_NAME}`);

        // batch upsert (Pinecone limit is usually 1000 vectors per call, our chunks likely < 1000 for single file)
        await index.upsert(vectors);

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

module.exports = { uploadFile, getDocuments };
