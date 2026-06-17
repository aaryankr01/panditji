const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
  await connectDB();
  
  try {
    const adminsToSeed = [
      { name: 'Super Admin', email: 'admin@panditji.com', password: 'password123', role: 'admin' },
      { name: 'Admin One', email: 'admin1@panditji.com', password: 'password123', role: 'admin' },
      { name: 'Admin Two', email: 'admin2@panditji.com', password: 'password123', role: 'admin' }
    ];

    for (const adminData of adminsToSeed) {
      const exists = await Admin.findOne({ email: adminData.email });
      if (!exists) {
        await Admin.create(adminData);
        console.log(`Admin ${adminData.email} seeded successfully!`);
      } else {
        console.log(`Admin ${adminData.email} already exists`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
