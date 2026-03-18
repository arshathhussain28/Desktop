const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function dropIndex() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const collection = db.collection('labels');
        
        // List indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes);
        
        // Find the labelId unique index
        const indexName = 'labelId_1';
        if (indexes.some(i => i.name === indexName)) {
            await collection.dropIndex(indexName);
            console.log(`Dropped index: ${indexName}`);
        } else {
            console.log(`Index ${indexName} not found`);
        }
        
    } catch (err) {
        console.error('Error dropping index:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

dropIndex();
