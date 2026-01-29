require('dotenv').config({ path: '../.env' });
const { Pinecone } = require('@pinecone-database/pinecone');

async function testPinecone() {
    try {
        console.log('Using API Key:', process.env.PINECONE_API_KEY ? 'Present' : 'Missing');
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

        const indexes = await pc.listIndexes();
        const fs = require('fs');
        fs.writeFileSync('pinecone-debug.json', JSON.stringify(indexes, null, 2));
        console.log('Result saved to pinecone-debug.json');

    } catch (error) {
        const fs = require('fs');
        fs.writeFileSync('pinecone-debug.json', JSON.stringify({ error: error.message, stack: error.stack }, null, 2));
        console.error('Pinecone Connection Error:', error);
    }
}

testPinecone();
