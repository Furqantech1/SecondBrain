require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { TaskType } = require('@google/generative-ai');

async function testGemini() {
    try {
        console.log('Using Gemini Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "text-embedding-004",
            taskType: TaskType.RETRIEVAL_DOCUMENT,
        });

        console.log('Generating embedding for "test"...');
        const res = await embeddings.embedQuery("test string");

        console.log('Success! Vector length:', res.length);
        const fs = require('fs');
        fs.writeFileSync('gemini-status.txt', 'SUCCESS');

    } catch (error) {
        console.error('Gemini Error:', error);
        const fs = require('fs');
        fs.writeFileSync('gemini-status.txt', `ERROR: ${error.message}`);
    }
}

testGemini();
