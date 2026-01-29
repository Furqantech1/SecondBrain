require('dotenv').config({ path: '../.env' });
const { Pinecone } = require('@pinecone-database/pinecone');

const INDEX_NAME = process.env.PINECONE_INDEX || 'second-brain';

async function recreateIndex() {
    try {
        console.log('Using API Key:', process.env.PINECONE_API_KEY ? 'Present' : 'Missing');
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

        console.log(`Checking if index "${INDEX_NAME}" exists...`);
        const indexList = await pc.listIndexes();
        const indexNames = indexList.indexes ? indexList.indexes.map(i => i.name) : [];

        if (indexNames.includes(INDEX_NAME)) {
            console.log(`Deleting existing index "${INDEX_NAME}"...`);
            await pc.deleteIndex(INDEX_NAME);
            console.log('Index deleted. Waiting 10 seconds for cleanup...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
            console.log(`Index "${INDEX_NAME}" does not exist.`);
        }

        console.log(`Creating new index "${INDEX_NAME}" with dimension 3072...`);
        await pc.createIndex({
            name: INDEX_NAME,
            dimension: 3072, // Matches text-embedding-004 / gemini-embedding-001 actual output
            metric: 'cosine',
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1'
                }
            }
        });

        console.log('Index created successfully!');
        console.log('Waiting 30 seconds for index initialization...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        console.log('Ready!');

    } catch (error) {
        console.error('Pinecone Error:', error);
    }
}

recreateIndex();
