const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const devotee = await User.findOne({ email: 'aaryan22@gmail.com' });
    if (!devotee) {
      console.log('Devotee user not found');
      process.exit(1);
    }

    const pandit = await User.findOne({ email: 'ramesh.sharma@panditji.com' });
    if (!pandit) {
      console.log('Pandit Ramesh Sharma not found');
      process.exit(1);
    }

    // Delete existing bookings first to keep history clean for test
    await Booking.deleteMany({ devotee: devotee._id });
    await Payment.deleteMany({ devotee: devotee._id });
    console.log('Old test bookings cleared');

    // Create tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const booking = await Booking.create({
      devotee: devotee._id,
      pandit: pandit._id,
      pujaType: 'Satyanarayan Katha',
      scheduledDate: tomorrow,
      scheduledTime: '10:00',
      address: '123 Temple Road',
      city: 'Delhi',
      fee: 2100,
      pujaMode: 'in-person',
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    console.log('Booking created:', booking._id);

    const payment = await Payment.create({
      pandit: pandit._id,
      panditProfile: pandit.panditProfile || new mongoose.Types.ObjectId(),
      booking: booking._id,
      devotee: devotee._id,
      type: 'booking_fee',
      amount: 210000,
      panditEarnings: 189000,
      companyEarnings: 21000,
      status: 'captured',
      razorpayPaymentId: 'pay_test12345',
      razorpayOrderId: 'order_test12345'
    });

    console.log('Payment created:', payment._id);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
