const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('Attempting to connect to:', process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@'));
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:');
    console.error(error.message);
    process.exit(1);
  }
};

testConnection();
