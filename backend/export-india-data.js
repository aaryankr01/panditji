const fs = require('fs');
const path = require('path');
const { State, City } = require('country-state-city');

const run = () => {
  const states = State.getStatesOfCountry('IN');
  const cities = City.getCitiesOfCountry('IN');
  
  // Format states
  const formattedStates = states.map(s => ({
    isoCode: s.isoCode,
    name: s.name
  }));
  
  // Group cities by state
  const citiesByState = {};
  states.forEach(s => {
    citiesByState[s.isoCode] = [];
  });
  
  cities.forEach(c => {
    if (citiesByState[c.stateCode]) {
      // Sort to avoid duplicates and push
      if (!citiesByState[c.stateCode].includes(c.name)) {
        citiesByState[c.stateCode].push(c.name);
      }
    }
  });
  
  // Sort cities alphabetically for each state
  Object.keys(citiesByState).forEach(stateCode => {
    citiesByState[stateCode].sort();
  });
  
  const fileContent = `// Auto-generated Indian States and Cities list from country-state-city (IN only)
// This file is lightweight (~300KB) and iOS-compatible, avoiding Safari call stack crashes.

export const indianStates = ${JSON.stringify(formattedStates, null, 2)};

const citiesByState = ${JSON.stringify(citiesByState, null, 2)};

export const State = {
  getStatesOfCountry: () => indianStates
};

export const City = {
  getCitiesOfState: (countryCode, stateIsoCode) => {
    const list = citiesByState[stateIsoCode] || [];
    return list.map(cityName => ({ name: cityName }));
  }
};
`;

  const outputPath = path.join(__dirname, '../frontend/src/utils/indiaData.js');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`✅ Successfully generated all Indian states and cities to ${outputPath}`);
};

run();
