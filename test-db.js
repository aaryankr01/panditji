const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const testConnection = async () => {
  try {
    console.log('Attempting to connect to:', process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@'));
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:');
    console.error(error);
    process.exit(1);
  }
};

testConnection();
