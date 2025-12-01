const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Load .env file from backend directory
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const deleteUsers = async () => {
  try {
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      console.error('❌ Error: .env file not found!');
      console.error(`Expected location: ${envPath}`);
      console.error('\nPlease create a .env file with the following variables:');
      console.error('MONGO_URI=your_mongodb_connection_string');
      process.exit(1);
    }

    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI is not set in .env file!');
      console.error('Please add MONGO_URI to your .env file.');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get command line argument for deletion type
    const deleteType = process.argv[2] || 'all';
    
    let deletedCount = 0;
    let query = {};

    if (deleteType === 'users') {
      // Delete only regular users, keep admin
      query = { role: 'user' };
      console.log('🗑️  Deleting all regular users (keeping admin users)...');
    } else if (deleteType === 'admin') {
      // Delete only admin users
      query = { role: 'admin' };
      console.log('🗑️  Deleting all admin users...');
    } else {
      // Delete all users
      console.log('⚠️  WARNING: This will delete ALL users from the database!');
      console.log('🗑️  Deleting all users...');
    }

    // Count users before deletion
    const countBefore = await User.countDocuments(query);
    console.log(`📊 Found ${countBefore} user(s) to delete`);

    if (countBefore === 0) {
      console.log('ℹ️  No users found to delete.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Delete users
    const result = await User.deleteMany(query);
    deletedCount = result.deletedCount;

    console.log(`✅ Successfully deleted ${deletedCount} user(s)`);
    
    // Show remaining users count
    const remainingCount = await User.countDocuments();
    console.log(`📊 Remaining users in database: ${remainingCount}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

deleteUsers();

