const { City, State } = require('country-state-city');

const geocodeCity = async (cityName, stateNameOrCode = '') => {
  if (!cityName) return [0, 0];
  
  const searchName = cityName.trim().toLowerCase();
  
  // Get all cities in India
  const allIndianCities = City.getCitiesOfCountry('IN');
  
  // Find matching cities
  let matches = allIndianCities.filter(c => c.name.toLowerCase() === searchName);
  
  // If no exact match, try matching by startsWith or includes
  if (matches.length === 0) {
    matches = allIndianCities.filter(c => c.name.toLowerCase().includes(searchName));
  }
  
  if (matches.length > 0) {
    // If we have multiple matches and state info is provided, filter by state
    if (stateNameOrCode && matches.length > 1) {
      const stateSearch = stateNameOrCode.trim().toLowerCase();
      // Try to match by stateCode or state name
      const stateMatch = matches.find(c => 
        c.stateCode.toLowerCase() === stateSearch ||
        (State.getStateByCodeAndCountry(c.stateCode, 'IN')?.name.toLowerCase() || '').includes(stateSearch)
      );
      if (stateMatch) {
        const lng = parseFloat(stateMatch.longitude);
        const lat = parseFloat(stateMatch.latitude);
        console.log(`🗺️ Geocoder: Found city match using state filtering: ${stateMatch.name} (${stateMatch.stateCode}) -> [${lng}, ${lat}]`);
        return [lng, lat];
      }
    }
    
    // Default to the first match
    const bestMatch = matches[0];
    const lng = parseFloat(bestMatch.longitude);
    const lat = parseFloat(bestMatch.latitude);
    console.log(`🗺️ Geocoder: Found city match: ${bestMatch.name} (${bestMatch.stateCode}) -> [${lng}, ${lat}]`);
    return [lng, lat];
  }
  
  // Fallback to OSM Nominatim if not found in country-state-city
  try {
    const axios = require('axios');
    console.log(`🗺️ Geocoder: City ${cityName} not found in country-state-city. Requesting Nominatim API...`);
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          format: 'json',
          q: `${cityName}, India`,
          limit: 1
        },
        headers: {
          'User-Agent': 'PanditJi-App'
        },
        timeout: 4000
      }
    );
    if (res.data && res.data.length > 0) {
      const lon = parseFloat(res.data[0].lon);
      const lat = parseFloat(res.data[0].lat);
      console.log(`🗺️ Geocoder: Nominatim API result for ${cityName}: [${lon}, ${lat}]`);
      return [lon, lat];
    }
  } catch (err) {
    console.error('🗺️ Geocoder: OSM Geocoding failed on backend:', err.message);
  }
  
  console.log(`🗺️ Geocoder: Fallback [0, 0] for ${cityName}`);
  return [0, 0];
};

module.exports = { geocodeCity };
