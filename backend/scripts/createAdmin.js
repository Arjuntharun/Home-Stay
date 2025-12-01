const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Load .env file from backend directory
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const createAdmin = async () => {
  try {
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      console.error('❌ Error: .env file not found!');
      console.error(`Expected location: ${envPath}`);
      console.error('\nPlease create a .env file with the following variables:');
      console.error('MONGO_URI=your_mongodb_connection_string');
      console.error('JWT_SECRET=your_jwt_secret');
      console.error('\nSee SETUP.md for complete .env file template.');
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
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@hawkins.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@hawkins.com',
      phone: '1234567890',
      password: 'admin123', // Change this password after first login
      role: 'admin'
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@hawkins.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

