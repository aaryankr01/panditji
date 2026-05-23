const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    const user = await User.findOne({ email: 'aaryan22@gmail.com' });
    if (!user) {
      console.log('Devotee user not found');
      process.exit(1);
    }
    user.password = 'password123';
    await user.save();
    console.log('Password updated successfully');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
