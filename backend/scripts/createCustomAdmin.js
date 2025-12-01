const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Load .env file from backend directory
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const createCustomAdmin = async () => {
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

    // Get email and password from command line arguments or use defaults
    const email = process.argv[2] || 'admin.arjun@gmail.com';
    const password = process.argv[3] || 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log(`ℹ️  Admin user with email ${email} already exists`);
      console.log(`   You can login with:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: [the password you set]`);
      process.exit(0);
    }

    // Create admin user with email verified
    const admin = await User.create({
      name: 'Admin',
      email: email.toLowerCase(),
      phone: '1234567890',
      password: password,
      role: 'admin',
      isEmailVerified: true // Set as verified so admin can login immediately
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createCustomAdmin();

