const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Admin = require('./models/Admin');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    const users = await User.find({}, 'firstName lastName email role');
    console.log('All Users in DB:');
    users.forEach(u => {
      console.log(`- [${u.role}] Name: ${u.firstName} ${u.lastName}, Email: ${u.email}`);
    });
    
    const admins = await Admin.find({}, 'name email username');
    console.log('\nAll Admins in DB:');
    admins.forEach(a => {
      console.log(`- Name: ${a.name}, Email: ${a.email}, Username: ${a.username}`);
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
