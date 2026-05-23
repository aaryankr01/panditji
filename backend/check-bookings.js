const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const User = require('./models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    const user = await User.findOne({ email: 'aaryan22@gmail.com' });
    if (!user) {
      console.log('User aaryan22@gmail.com not found');
      process.exit(1);
    }
    const bookings = await Booking.find({ devotee: user._id }).populate('pandit', 'firstName lastName');
    console.log(`Found ${bookings.length} bookings for devotee:`);
    bookings.forEach(b => {
      console.log(`- Booking ID: ${b._id}, Puja: ${b.pujaType}, Pandit: ${b.pandit ? b.pandit.firstName : 'none'}, Status: ${b.status}, Payment: ${b.paymentStatus}`);
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
