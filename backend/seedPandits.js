const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Pandit = require('./models/Pandit');

const pandits = [
  {
    firstName: 'Ramesh', lastName: 'Sharma',
    email: 'ramesh.sharma@panditji.com', phone: '9876543201',
    password: 'pandit123', role: 'pandit', city: 'Varanasi', state: 'Uttar Pradesh',
    pandit: { specializations: ['Satyanarayan Katha', 'Rudrabhishek'], experience: 15, bio: 'Expert in Vedic rituals with 15 years of experience.', feePerPuja: 2100, city: 'Varanasi', state: 'Uttar Pradesh', location: { type: 'Point', coordinates: [82.9739, 25.3176] } }
  },
  {
    firstName: 'Suresh', lastName: 'Mishra',
    email: 'suresh.mishra@panditji.com', phone: '9876543202',
    password: 'pandit123', role: 'pandit', city: 'Haridwar', state: 'Uttarakhand',
    pandit: { specializations: ['Havan & Yagya', 'Navratri Puja'], experience: 20, bio: 'Specializes in Havan and Yagya with deep scriptural knowledge.', feePerPuja: 3100, city: 'Haridwar', state: 'Uttarakhand', location: { type: 'Point', coordinates: [78.1642, 29.9457] } }
  },
  {
    firstName: 'Anil', lastName: 'Tiwari',
    email: 'anil.tiwari@panditji.com', phone: '9876543203',
    password: 'pandit123', role: 'pandit', city: 'Mumbai', state: 'Maharashtra',
    pandit: { specializations: ['Griha Pravesh', 'Ganesh Puja'], experience: 12, bio: 'Expert in home entry rituals and auspicious ceremonies.', feePerPuja: 2500, city: 'Mumbai', state: 'Maharashtra', location: { type: 'Point', coordinates: [72.8777, 19.0760] } }
  },
  {
    firstName: 'Dinesh', lastName: 'Dubey',
    email: 'dinesh.dubey@panditji.com', phone: '9876543204',
    password: 'pandit123', role: 'pandit', city: 'Jaipur', state: 'Rajasthan',
    pandit: { specializations: ['Vivah Ceremony', 'Naamkaran'], experience: 18, bio: 'Renowned for conducting beautiful and traditional wedding ceremonies.', feePerPuja: 5100, city: 'Jaipur', state: 'Rajasthan', location: { type: 'Point', coordinates: [75.7873, 26.9124] } }
  },
  {
    firstName: 'Vijay', lastName: 'Pandey',
    email: 'vijay.pandey@panditji.com', phone: '9876543205',
    password: 'pandit123', role: 'pandit', city: 'Delhi', state: 'Delhi',
    pandit: { specializations: ['Lakshmi Puja', 'Durga Puja', 'Satyanarayan Katha'], experience: 10, bio: 'Performing pujas in Delhi NCR for over a decade.', feePerPuja: 1500, city: 'Delhi', state: 'Delhi', location: { type: 'Point', coordinates: [77.2090, 28.6139] } }
  },
  {
    firstName: 'Krishna', lastName: 'Joshi',
    email: 'krishna.joshi@panditji.com', phone: '9876543206',
    password: 'pandit123', role: 'pandit', city: 'Bengaluru', state: 'Karnataka',
    pandit: { specializations: ['Surya Puja', 'Mundan Ceremony', 'Havan & Yagya'], experience: 8, bio: 'Youngest certified pandit with modern and traditional approach.', feePerPuja: 2000, city: 'Bengaluru', state: 'Karnataka', location: { type: 'Point', coordinates: [77.5946, 12.9716] } }
  },
];

const seed = async () => {
  await connectDB();
  try {
    await User.deleteMany({ role: 'pandit' });
    await Pandit.deleteMany({});
    console.log('Cleared existing pandits');
    
    for (const data of pandits) {
      const exists = await User.findOne({ email: data.email });
      if (exists) { console.log(`${data.email} already exists, skipping.`); continue; }

      const panditProfile = await Pandit.create({ ...data.pandit, user: new mongoose.Types.ObjectId() });
      const user = await User.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        city: data.city,
        state: data.state,
        panditProfile: panditProfile._id
      });

      // Update pandit profile with actual user ID
      await Pandit.findByIdAndUpdate(panditProfile._id, { user: user._id });
      console.log(`✅ Created pandit: ${data.firstName} ${data.lastName}`);
    }
    console.log('\n🎉 All pandits seeded successfully!');
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
};

seed();
