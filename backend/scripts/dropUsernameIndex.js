const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Load .env file from backend directory
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const dropUsernameIndex = async () => {
  try {
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      console.error('❌ Error: .env file not found!');
      console.error(`Expected location: ${envPath}`);
      process.exit(1);
    }

    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI is not set in .env file!');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the collection
    const collection = User.collection;
    
    // List all indexes
    console.log('\n📋 Current indexes on users collection:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`   - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop the username index if it exists
    try {
      await collection.dropIndex('username_1');
      console.log('\n✅ Successfully dropped index: username_1');
    } catch (error) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('\nℹ️  Index username_1 does not exist (already removed)');
      } else {
        throw error;
      }
    }

    // List indexes after dropping
    console.log('\n📋 Updated indexes on users collection:');
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach(index => {
      console.log(`   - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Index cleanup completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping username index:', error.message);
    process.exit(1);
  }
};

dropUsernameIndex();

