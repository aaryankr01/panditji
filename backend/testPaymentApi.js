const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const run = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    const devotee = await User.findOne({ email: 'testdevotee@example.com' });
    const token = jwt.sign({ id: devotee._id, role: devotee.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Testing create-order API...');
    const bookingId = '6a04fc58a5041977fc844ff4'; // from earlier
    const res = await axios.post('http://localhost:5000/api/payments/create-order', 
      { bookingId }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Success:', res.data);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
};

run();
