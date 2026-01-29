const { Pinecone } = require('@pinecone-database/pinecone');

if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY is not defined in environment variables');
}

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

module.exports = pinecone;
