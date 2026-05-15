const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Pandit = require('./models/Pandit');

mongoose.connect(process.env.MONGO_URI);

const seed = async () => {
  try {
    // Clear old test users
    const oldDevotee = await User.findOne({ email: 'testdevotee@example.com' });
    if (oldDevotee) await User.deleteOne({ _id: oldDevotee._id });
    const oldPandit = await User.findOne({ email: 'testpandit@example.com' });
    if (oldPandit) {
      await Pandit.deleteOne({ user: oldPandit._id });
      await User.deleteOne({ _id: oldPandit._id });
    }

    // Create Devotee
    const devotee = await User.create({
      firstName: 'Test',
      lastName: 'Devotee',
      email: 'testdevotee@example.com',
      password: 'password123',
      phone: '9999999999',
      role: 'devotee',
      city: 'Delhi',
      isVerified: true
    });

    // Create Pandit
    const panditUser = await User.create({
      firstName: 'Test',
      lastName: 'Pandit',
      email: 'testpandit@example.com',
      password: 'password123',
      phone: '8888888888',
      role: 'pandit',
      city: 'Delhi',
      isVerified: true
    });

    const panditProfile = await Pandit.create({
      user: panditUser._id,
      specializations: ['All Pujas'],
      experience: 10,
      feePerPuja: 1500,
      city: 'Delhi',
      isApproved: true,
      isAvailable: true
    });

    console.log('Seed successful!');
    console.log('Devotee: testdevotee@example.com / password123');
    console.log('Pandit: testpandit@example.com / password123');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
