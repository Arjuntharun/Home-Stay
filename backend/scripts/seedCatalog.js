const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Package = require('../models/Package');
const Activity = require('../models/Activity');

dotenv.config();

const activities = [
  { name: 'Wayanad Forest Camping', description: 'A guided evening camp with a campfire, forest sounds, and a fresh breakfast at sunrise.', price: 1800, image: '/img/campfire.jpg' },
  { name: 'Coffee Plantation Walk', description: 'Walk through a shade-grown coffee estate and learn how Wayanad coffee is grown and processed.', price: 900, image: '/img/coffee-walk.jpg' },
  { name: 'Dawn Birdwatching', description: 'A quiet morning trail for spotting Malabar birds and listening to the forest wake up.', price: 750, image: '/img/hornbill-watching.jpg' },
  { name: 'Tea Garden Photography', description: 'Capture the rolling tea gardens and misty ridgelines with a local host.', price: 700, image: '/img/tea-ridge.jpg' },
  { name: 'Zipline Adventure', description: 'Take in the valley views on a supervised zipline experience.', price: 1200, image: '/img/zipline.jpg' },
  { name: 'Waterfall Trail', description: 'Explore a scenic Wayanad waterfall route with a local guide and time for photographs.', price: 1100, image: '/img/waterfalls-1.jpg' }
];

const packages = [
  { name: 'Forest Weekend', description: 'A relaxed Wayanad stay with a plantation walk, waterfall visit, and home-style meals.', duration: '2 Nights / 3 Days', price: 8999, image: '/img/bedroom.jpg', features: ['Breakfast and dinner', 'Coffee plantation walk', 'Waterfall trail'] },
  { name: 'Camp and Canopy', description: 'A nature-first escape combining a comfortable homestay with one guided forest camping night.', duration: '2 Nights / 3 Days', price: 10499, image: '/img/campfire.jpg', features: ['One camping night', 'Campfire evening', 'Sunrise birdwatching'] },
  { name: 'Wayanad Explorer', description: 'A full itinerary for guests who want viewpoints, wildlife, tea gardens, and adventure.', duration: '3 Nights / 4 Days', price: 13999, image: '/img/Banasura-Sagar-Dam-3-Wayanad.jpg', features: ['Banasura viewpoint', 'Wildlife sanctuary visit', 'Tea garden photography', 'Breakfast and dinner'] },
  { name: 'Slow Travel Retreat', description: 'A peaceful longer stay with flexible local experiences and time to enjoy the homestay.', duration: '4 Nights / 5 Days', price: 16999, image: '/img/Sunrise.jpg', features: ['Daily breakfast', 'Two guided local walks', 'Flexible activity choice'] }
];

async function seedCatalog() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  for (const activity of activities) {
    await Activity.updateOne({ name: activity.name }, { $setOnInsert: activity }, { upsert: true });
  }
  for (const packageData of packages) {
    await Package.updateOne({ name: packageData.name }, { $setOnInsert: packageData }, { upsert: true });
  }
  await mongoose.disconnect();
  console.log(`Catalog ready: ${packages.length} packages, ${activities.length} activities`);
}

seedCatalog().catch(error => {
  console.error('Catalog seed failed:', error.message);
  process.exitCode = 1;
});
