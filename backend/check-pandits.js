require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Pandit = require('./models/Pandit');

const run = async () => {
  await connectDB();
  const users = await User.find({ role: 'pandit' }).populate('panditProfile');
  console.log('\nAll Pandits and their location coordinates:');
  users.forEach(u => {
    const p = u.panditProfile;
    if (p) {
      console.log(`  Name: ${u.firstName} ${u.lastName}`);
      console.log(`  City: ${u.city} | Profile City: ${p.city}`);
      console.log(`  Location coordinates:`, p.location?.coordinates);
    } else {
      console.log(`  Name: ${u.firstName} ${u.lastName} (No profile linked)`);
    }
  });
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
