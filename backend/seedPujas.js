const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const Puja = require('./models/Puja');

const pujas = [
  { name: "Satyanarayan Pooja", price: 5100, originalPrice: 8100, discount: 37, rating: 5, category: "Devotional", tag: "Most Booked", duration: "1.5 hrs", description: "Online Satyanarayan Pooja performed by verified pandits." },
  { name: "Kaal Sarp Dosh Puja", price: 5100, originalPrice: 7100, discount: 28, rating: 4.5, category: "Remedial", duration: "1.5 hrs", description: "Online Kaal Sarp Dosh Puja performed by verified pandits." },
  { name: "Rin Mukti Puja", price: 5100, originalPrice: 7100, discount: 28, rating: 4, category: "Remedial", duration: "1.5 hrs", description: "Online Rin Mukti Puja performed by verified pandits." },
  { name: "Baglamukhi Puja", price: 5100, originalPrice: 7999, discount: 36, rating: 4.9, category: "Devotional", duration: "1.5 hrs", description: "Online Baglamukhi Puja performed by verified pandits." },
  { name: "Mangal Dosh Nivaran", price: 5100, originalPrice: 8100, discount: 37, rating: 4.3, category: "Remedial", duration: "1.5 hrs", description: "Online Mangal Dosh Nivaran performed by verified pandits." },
  { name: "Pitru Paksha Puja", price: 5100, originalPrice: 8100, discount: 37, rating: 4.6, category: "Ancestral", duration: "1.5 hrs", description: "Online Pitru Paksha Puja performed by verified pandits." },
  { name: "Dhanteras Puja", price: 2100, originalPrice: 5100, discount: 59, rating: 4.7, category: "Festival", tag: "Festival Special", duration: "1.5 hrs", description: "Online Dhanteras Puja performed by verified pandits." },
  { name: "Marriage Anniversary Puja", price: 2100, originalPrice: 5100, discount: 59, rating: 4.8, category: "Celebration", duration: "1.5 hrs", description: "Online Marriage Anniversary Puja performed by verified pandits." },
  { name: "Shani Puja", price: 2100, originalPrice: 5500, discount: 62, rating: 4.6, category: "Remedial", duration: "1.5 hrs", description: "Online Shani Puja performed by verified pandits." },
  { name: "Diwali Puja", price: 2100, originalPrice: 4100, discount: 49, rating: 4.5, category: "Festival", duration: "1.5 hrs", description: "Online Diwali Puja performed by verified pandits." },
  { name: "Shradh Puja", price: 5100, originalPrice: 7100, discount: 28, rating: 4.6, category: "Ancestral", duration: "1.5 hrs", description: "Online Shradh Puja performed by verified pandits." },
  { name: "Namkaran Puja", price: 5100, originalPrice: 9100, discount: 44, rating: 4.7, category: "Celebration", duration: "1.5 hrs", description: "Online Namkaran Puja performed by verified pandits." },
  { name: "Nav Chandi Puja", price: 21000, originalPrice: 31000, discount: 32, rating: 4.8, category: "Devotional", tag: "Premium", duration: "1.5 hrs", description: "Online Nav Chandi Puja performed by verified pandits." },
  { name: "Godh Bharai Puja", price: 2100, originalPrice: 5100, discount: 59, rating: 4.5, category: "Celebration", duration: "1.5 hrs", description: "Online Godh Bharai Puja performed by verified pandits." },
  { name: "Navagraha Shanti Puja", price: 5100, originalPrice: 8100, discount: 37, rating: 4.4, category: "Remedial", duration: "1.5 hrs", description: "Online Navagraha Shanti Puja performed by verified pandits." },
  { name: "Vastu Shanti Puja", price: 1100, originalPrice: 4100, discount: 73, rating: 4.2, category: "Remedial", tag: "Best Value", duration: "1.5 hrs", description: "Online Vastu Shanti Puja performed by verified pandits." },
  { name: "Griha Pravesh Puja", price: 5100, originalPrice: 8500, discount: 40, rating: 4.6, category: "Celebration", duration: "1.5 hrs", description: "Online Griha Pravesh Puja performed by verified pandits." },
  { name: "Guru Chandal Dosh Puja", price: 7100, originalPrice: 9100, discount: 22, rating: 4.4, category: "Remedial", duration: "1.5 hrs", description: "Online Guru Chandal Dosh Puja performed by verified pandits." },
  { name: "Mahamrityunjaya Jaap", price: 51000, originalPrice: 70000, discount: 27, rating: 4.3, category: "Devotional", tag: "Premium", duration: "1.5 hrs", description: "Online Mahamrityunjaya Jaap performed by verified pandits." },
  { name: "Hanuman Chalisa Path", price: 3100, originalPrice: 5100, discount: 39, rating: 4.5, category: "Devotional", duration: "1.5 hrs", description: "Online Hanuman Chalisa Path performed by verified pandits." },
  { name: "Office Opening Puja", price: 3100, originalPrice: 5100, discount: 39, rating: 4, category: "Celebration", duration: "1.5 hrs", description: "Online Office Opening Puja performed by verified pandits." },
  { name: "Annaprasana Puja", price: 2100, originalPrice: 5100, discount: 59, rating: 4.6, category: "Celebration", duration: "1.5 hrs", description: "Online Annaprasana Puja performed by verified pandits." },
  { name: "Navratri Ghatsthapana", price: 5100, originalPrice: 6100, discount: 16, rating: 4.1, category: "Festival", duration: "1.5 hrs", description: "Online Navratri Ghatsthapana performed by verified pandits." },
  { name: "Shuddhikaran Puja", price: 5100, originalPrice: 8100, discount: 37, rating: 4.3, category: "Devotional", duration: "1.5 hrs", description: "Online Shuddhikaran Puja performed by verified pandits." }
];

const seed = async () => {
  await connectDB();
  try {
    await Puja.deleteMany({});
    console.log('Cleared existing active Pujas');
    
    await Puja.insertMany(pujas);
    console.log('🎉 Successfully seeded Pujas into Database!');
  } catch (err) {
    console.error('Error during seeding:', err.message);
  }
  process.exit();
};

seed();
