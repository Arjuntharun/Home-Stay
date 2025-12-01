const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Package = require('../models/Package');
const Activity = require('../models/Activity');
const Payment = require('../models/Payment');

// Load .env file from backend directory
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const deleteAllData = async () => {
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
    console.log('✅ Connected to MongoDB\n');

    console.log('⚠️  WARNING: This will delete ALL default data from:');
    console.log('   - Admin users');
    console.log('   - Bookings');
    console.log('   - Packages');
    console.log('   - Activities');
    console.log('   - Payments\n');

    // Delete Admin Users
    console.log('🗑️  Deleting admin users...');
    const adminCount = await User.countDocuments({ role: 'admin' });
    const adminResult = await User.deleteMany({ role: 'admin' });
    console.log(`   ✅ Deleted ${adminResult.deletedCount} admin user(s) (found ${adminCount})`);

    // Delete Payments (delete first due to foreign key relationships)
    console.log('🗑️  Deleting payments...');
    const paymentCount = await Payment.countDocuments();
    const paymentResult = await Payment.deleteMany({});
    console.log(`   ✅ Deleted ${paymentResult.deletedCount} payment(s) (found ${paymentCount})`);

    // Delete Bookings
    console.log('🗑️  Deleting bookings...');
    const bookingCount = await Booking.countDocuments();
    const bookingResult = await Booking.deleteMany({});
    console.log(`   ✅ Deleted ${bookingResult.deletedCount} booking(s) (found ${bookingCount})`);

    // Delete Packages
    console.log('🗑️  Deleting packages...');
    const packageCount = await Package.countDocuments();
    const packageResult = await Package.deleteMany({});
    console.log(`   ✅ Deleted ${packageResult.deletedCount} package(s) (found ${packageCount})`);

    // Delete Activities
    console.log('🗑️  Deleting activities...');
    const activityCount = await Activity.countDocuments();
    const activityResult = await Activity.deleteMany({});
    console.log(`   ✅ Deleted ${activityResult.deletedCount} activity/activities (found ${activityCount})`);

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Admin Users: ${adminResult.deletedCount} deleted`);
    console.log(`   Payments: ${paymentResult.deletedCount} deleted`);
    console.log(`   Bookings: ${bookingResult.deletedCount} deleted`);
    console.log(`   Packages: ${packageResult.deletedCount} deleted`);
    console.log(`   Activities: ${activityResult.deletedCount} deleted`);

    const totalDeleted = adminResult.deletedCount + paymentResult.deletedCount + 
                        bookingResult.deletedCount + packageResult.deletedCount + 
                        activityResult.deletedCount;
    console.log(`\n✅ Total records deleted: ${totalDeleted}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('\n💡 You can now add all data through the ADMIN PAGE');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

deleteAllData();

