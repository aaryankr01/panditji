const { City } = require('country-state-city');

const test = () => {
  const cities = City.getCitiesOfCountry('IN');
  console.log(`Total cities in India: ${cities.length}`);
  
  // Find Gaya
  const gaya = cities.find(c => c.name.toLowerCase() === 'gaya');
  console.log('Gaya info:', gaya);
  
  // Find Meerut
  const meerut = cities.find(c => c.name.toLowerCase() === 'meerut');
  console.log('Meerut info:', meerut);
  
  // Find Bengaluru
  const bengaluru = cities.find(c => c.name.toLowerCase() === 'bengaluru' || c.name.toLowerCase() === 'bangalore');
  console.log('Bengaluru info:', bengaluru);
};

test();
