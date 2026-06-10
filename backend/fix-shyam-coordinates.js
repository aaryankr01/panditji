require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Pandit = require('./models/Pandit');

const run = async () => {
  await connectDB();
  const shyamUser = await User.findOne({ email: 'shyamkumar1sk12@gmail.com' });
  if (shyamUser && shyamUser.panditProfile) {
    const coords = [85.0002, 24.7955]; // Gaya, Bihar coordinates
    await Pandit.findByIdAndUpdate(shyamUser.panditProfile, {
      city: 'Gaya',
      location: {
        type: 'Point',
        coordinates: coords
      }
    });
    console.log('✅ Updated Shyam Kumar coordinates to Gaya:', coords);
  } else {
    console.log('❌ Shyam Kumar user or profile not found');
  }
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
