require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listGeminiModels() {
    console.log('--- LISTING MODELS ---');
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        console.log(`Fetching from: ${url.replace(apiKey, 'HIDDEN')}`);

        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log(`Found ${data.models.length} models.`);
            const embeddings = data.models.filter(m => m.name.includes('embedding'));

            const fs = require('fs');
            fs.writeFileSync('all_models.json', JSON.stringify(data.models, null, 2));
            console.log('Saved all models to all_models.json');
        } else {
            console.error('No models found or error:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('List Error:', error);
    }
    console.log('--- END LIST ---');
}

listGeminiModels();
