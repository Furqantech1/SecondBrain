require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        console.log('Using Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy init

        // There isn't a direct "listModels" on the instance in some SDK versions, 
        // but let's try the generic way via REST if SDK fails, or use `genAI.getGenerativeModel` isn't enough.
        // Wait, the SDK has `getGenerativeModel`. 
        // To list models, we usually might need the REST API or `genAI.getGenerativeModel` just works?
        // Actually, the easiest way to test valid key + models is just to try to generate content with gemini-pro.
        // If that works, the key is fine.

        console.log('Testing generation with gemini-pro...');
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log('Generation Success:', response.text());

        const fs = require('fs');
        fs.writeFileSync('gemini-list.txt', 'Generation SUCCESS');

    } catch (error) {
        console.error('List/Gen Error:', error);
        const fs = require('fs');
        fs.writeFileSync('gemini-list.txt', `ERROR: ${error.message} \nStack: ${error.stack}`);
    }
}

listModels();
