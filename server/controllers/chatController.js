const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { GoogleGenerativeAI, TaskType } = require('@google/generative-ai');
const pinecone = require('../services/pineconeService');

const INDEX_NAME = process.env.PINECONE_INDEX || 'second-brain';

// Initialize Gemini Chat Model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use stable alias verified by debug script
const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });

const chat = async (req, res) => {
    const { question, history, documentId } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }

    try {
        console.log(`[Chat] Received question: "${question}"`);
        if (documentId) console.log(`[Chat] Context restricted to documentId: ${documentId}`);

        // 1. Generate Embedding for the Question
        console.log('[Chat] Generating embedding...');
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "models/gemini-embedding-001",
            taskType: TaskType.RETRIEVAL_QUERY,
        });

        let queryEmbedding;
        try {
            queryEmbedding = await embeddings.embedQuery(question);
        } catch (embedError) {
            console.error('[Chat] Embedding Error:', embedError);
            if (embedError.message.includes('429')) {
                return res.status(429).json({ message: 'Too many requests to Gemini API (Embedding). Please wait a moment and try again.' });
            }
            throw embedError;
        }
        console.log('[Chat] Embedding generated.');

        // 2. Query Pinecone for relevant chunks
        console.log(`[Chat] Querying Pinecone index: ${INDEX_NAME}`);

        // Construct Filter
        // Always filter by user to ensure tenancy
        const filter = {
            user: req.user.id
        };
        // If documentId is provided, scoped to that document
        if (documentId) {
            filter.documentId = documentId;
        }

        const index = pinecone.index(INDEX_NAME);
        const queryResponse = await index.query({
            vector: queryEmbedding,
            topK: 5,
            includeMetadata: true,
            filter: filter
        });

        const matches = queryResponse.matches;
        console.log(`[Chat] Found ${matches.length} matches.`);

        // 3. Construct Context from matches
        let context = "";
        matches.forEach((match) => {
            context += `\n\n---\nSource: ${match.metadata.filename}\nContent: ${match.metadata.text}`;
        });

        // 4. Construct Prompt
        console.log('[Chat] Generating answer with Gemini...');
        const prompt = `You are a helpful AI assistant called "Second Brain". match the following context to answer the user's question. 
        
        Formatting Instructions:
        - Use simple, clear, and professional language.
        - Structure your answer with **Bold Headers** for key sections.
        - Use **bullet points** or **numbered lists** for steps or features to improve readability.
        - Important terms or numbers should be **bolded**.
        - If the answer is long, break it into concise paragraphs.
        
        If the answer is not in the context, say "I couldn't find the answer in your documents." and then try to answer from your general knowledge but mention that it is general knowledge.
        
        Context:
        ${context}

        Question: ${question}
        
        Answer:`;

        // 5. Generate Answer
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log('[Chat] Answer generated successfully.');

            // Deduplicate sources by filename
            const uniqueSources = [];
            const seenFilenames = new Set();

            matches.forEach(m => {
                if (!seenFilenames.has(m.metadata.filename)) {
                    seenFilenames.add(m.metadata.filename);
                    uniqueSources.push({ filename: m.metadata.filename, score: m.score });
                }
            });

            res.json({
                answer: text,
                sources: uniqueSources
            });
        } catch (genError) {
            console.error('[Chat] Generation Error:', genError);
            if (genError.message.includes('429')) {
                return res.status(429).json({ message: 'Too many requests to Gemini API (Generation). Please wait a moment and try again.' });
            }
            throw genError;
        }

    } catch (error) {
        console.error('[Chat] Uncaught Error:', error);
        res.status(500).json({ message: 'Error generating response', error: error.message });
    }
};

module.exports = { chat };
