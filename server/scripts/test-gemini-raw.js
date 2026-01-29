require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiRaw() {
    console.log('--- STARTING GEMINI RAW TEST ---');
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        const text = "Hello world";
        console.log(`Generating embedding for: "${text}"`);

        const result = await model.embedContent(text);

        if (!result || !result.embedding) {
            console.error('ERROR: No embedding object in response');
            console.log('Full Result:', JSON.stringify(result, null, 2));
            return;
        }

        const values = result.embedding.values;
        console.log(`Success! Embedding Vector Length: ${values.length}`);

        if (values.length === 0) {
            console.error('CRITICAL: Returned vector is empty (length 0).');
        } else {
            console.log('First 5 values:', values.slice(0, 5));
        }

    } catch (error) {
        console.error('--- ERROR OCCURRED ---');
        console.error(error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Status Text:', error.response.statusText);
        }
    }
    console.log('--- END TEST ---');
}

testGeminiRaw();
