const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

const User = require('./backend/models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    const users = await User.find({}, 'firstName lastName email role');
    console.log('All Users in DB:');
    users.forEach(u => {
      console.log(`- [${u.role}] Name: ${u.firstName} ${u.lastName}, Email: ${u.email}`);
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
