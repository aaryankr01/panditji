const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Pandit = require('./models/Pandit');
const Booking = require('./models/Booking');

mongoose.connect(process.env.MONGO_URI);

const run = async () => {
  try {
    const devotee = await User.findOne({ email: 'testdevotee@example.com' });
    const panditUser = await User.findOne({ email: 'testpandit@example.com' });
    const panditProfile = await Pandit.findOne({ user: panditUser._id });

    // Create Booking
    const booking = await Booking.create({
      devotee: devotee._id,
      pujaType: 'Griha Pravesh',
      scheduledDate: new Date(),
      scheduledTime: '10:00 AM',
      address: devotee.city || 'Delhi',
      city: devotee.city || 'Delhi',
      fee: panditProfile.feePerPuja,
      status: 'pending' // pending until accepted
    });

    console.log('Booking created:', booking._id);

    // Accept Booking
    booking.pandit = panditUser._id;
    booking.panditProfile = panditProfile._id;
    booking.status = 'confirmed'; // Depending on the backend logic, it might be confirmed or in-progress
    await booking.save();

    console.log('Booking accepted by Pandit.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
