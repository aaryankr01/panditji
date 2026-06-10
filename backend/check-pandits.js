require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const run = async () => {
  await connectDB();
  const pandits = await User.find({ role: 'pandit' }).select('firstName lastName email city isActive');
  console.log('\nAll Pandits and their cities:');
  pandits.forEach(p => {
    console.log('  Name:', p.firstName, p.lastName, '| City:', p.city, '| Active:', p.isActive, '| Email:', p.email);
  });
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
