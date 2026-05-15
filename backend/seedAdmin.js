const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
  await connectDB();
  
  try {
    const adminExists = await Admin.findOne({ email: 'admin@panditji.com' });
    
    if (adminExists) {
      console.log('Admin already exists');
      process.exit();
    }
    
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@panditji.com',
      password: 'password123',
      role: 'admin'
    });
    
    console.log('Admin seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
