require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Pandit = require('./models/Pandit');
const { geocodeCity } = require('./utils/geocoder');

const run = async () => {
  await connectDB();
  const users = await User.find({ role: 'pandit' }).populate('panditProfile');
  console.log(`\nFound ${users.length} pandit(s) in the database. Updating coordinates...`);
  
  for (const u of users) {
    const p = u.panditProfile;
    if (p) {
      const city = u.city || p.city;
      const state = u.state || p.state || '';
      console.log(`\nProcessing ${u.firstName} ${u.lastName}: City = "${city}", State = "${state}"`);
      
      const coords = await geocodeCity(city, state);
      if (coords && !(coords[0] === 0 && coords[1] === 0)) {
        await Pandit.findByIdAndUpdate(p._id, {
          city: city,
          state: state,
          location: {
            type: 'Point',
            coordinates: coords
          }
        });
        console.log(`✅ Updated ${u.firstName} ${u.lastName} coordinates to:`, coords);
      } else {
        console.log(`⚠️ Could not geocode city "${city}" for ${u.firstName} ${u.lastName}. Keeping coordinates:`, p.location?.coordinates);
      }
    }
  }
  
  console.log('\n🎉 Finished updating all pandit coordinates!');
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
