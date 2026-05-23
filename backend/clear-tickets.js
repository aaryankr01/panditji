const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const SupportTicket = require('./models/SupportTicket');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const devotee = await User.findOne({ email: 'aaryan22@gmail.com' });
    if (!devotee) {
      console.log('Devotee user not found');
      process.exit(1);
    }

    await SupportTicket.deleteMany({ user: devotee._id });
    console.log('Support tickets cleared for', devotee.email);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
