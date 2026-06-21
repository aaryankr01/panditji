/**
 * updateTempleImages.js
 * Run once: node updateTempleImages.js
 * Updates existing temple records to use local /pictures/temples/ image paths.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Temple = require('./models/Temple');

const IMAGE_MAP = [
  { keywords: ['tirupati', 'balaji', 'venkateswara'], image: '/pictures/temples/tirupati.jpg' },
  { keywords: ['vaishno'],                             image: '/pictures/temples/vaishno_devi.jpg' },
  { keywords: ['shirdi', 'sai baba'],                  image: '/pictures/temples/sai_baba.jpg' },
  { keywords: ['kedarnath'],                           image: '/pictures/temples/kedarnath.jpg' },
  { keywords: ['somnath'],                             image: '/pictures/temples/somnath.jpg' },
  { keywords: ['kashi', 'vishwanath'],                 image: '/pictures/temples/kashi_vishwanath.jpg' },
  { keywords: ['siddhivinayak'],                       image: '/pictures/temples/siddhivinayak.jpg' },
  { keywords: ['jagannath', 'puri'],                   image: '/pictures/temples/jagannath.jpg' },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const temples = await Temple.find({});
  let updated = 0;

  for (const temple of temples) {
    const nameLower = temple.name.toLowerCase();
    const deity = (temple.deity || '').toLowerCase();
    const combined = `${nameLower} ${deity}`;

    let matchedImage = null;
    for (const entry of IMAGE_MAP) {
      if (entry.keywords.some(k => combined.includes(k))) {
        matchedImage = entry.image;
        break;
      }
    }

    if (matchedImage && temple.image !== matchedImage) {
      temple.image = matchedImage;
      await temple.save();
      console.log(`✅ Updated "${temple.name}" → ${matchedImage}`);
      updated++;
    } else {
      console.log(`⏭  Skipped "${temple.name}" (already correct or no match)`);
    }
  }

  console.log(`\nDone! ${updated} temple(s) updated.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
