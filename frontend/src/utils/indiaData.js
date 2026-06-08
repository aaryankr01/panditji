// Simple, lightweight list of Indian States and major Cities to replace the heavy 15MB country-state-city library
// This fixes the "Maximum call stack size exceeded" crash on iOS Safari and reduces build size significantly.

export const indianStates = [
  { isoCode: 'DL', name: 'Delhi' },
  { isoCode: 'UP', name: 'Uttar Pradesh' },
  { isoCode: 'MH', name: 'Maharashtra' },
  { isoCode: 'KA', name: 'Karnataka' },
  { isoCode: 'RJ', name: 'Rajasthan' },
  { isoCode: 'UK', name: 'Uttarakhand' },
  { isoCode: 'BR', name: 'Bihar' },
  { isoCode: 'HR', name: 'Haryana' },
  { isoCode: 'PB', name: 'Punjab' },
  { isoCode: 'GJ', name: 'Gujarat' },
  { isoCode: 'WB', name: 'West Bengal' },
  { isoCode: 'MP', name: 'Madhya Pradesh' },
  { isoCode: 'TN', name: 'Tamil Nadu' },
  { isoCode: 'AP', name: 'Andhra Pradesh' },
  { isoCode: 'TG', name: 'Telangana' },
  { isoCode: 'JH', name: 'Jharkhand' },
  { isoCode: 'OR', name: 'Odisha' },
  { isoCode: 'CG', name: 'Chhattisgarh' },
  { isoCode: 'HP', name: 'Himachal Pradesh' },
  { isoCode: 'JK', name: 'Jammu and Kashmir' },
  { isoCode: 'GA', name: 'Goa' },
  { isoCode: 'AS', name: 'Assam' },
  { isoCode: 'KL', name: 'Kerala' },
  { isoCode: 'TR', name: 'Tripura' },
  { isoCode: 'ML', name: 'Meghalaya' },
  { isoCode: 'MN', name: 'Manipur' },
  { isoCode: 'NL', name: 'Nagaland' },
  { isoCode: 'AR', name: 'Arunachal Pradesh' },
  { isoCode: 'MZ', name: 'Mizoram' },
  { isoCode: 'SK', name: 'Sikkim' }
];

const citiesByState = {
  DL: ['Delhi', 'New Delhi', 'Dwarka', 'Rohini', 'Noida', 'Gurugram', 'Ghaziabad', 'Faridabad'],
  UP: ['Varanasi', 'Lucknow', 'Kanpur', 'Prayagraj', 'Agra', 'Meerut', 'Vrindavan', 'Mathura', 'Ayodhya', 'Ghaziabad', 'Noida', 'Gorakhpur', 'Jhansi', 'Aligarh', 'Bareilly'],
  MH: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Navi Mumbai', 'Kolhapur'],
  KA: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Dharwad', 'Kalaburagi', 'Udupi'],
  RJ: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Pushkar', 'Alwar', 'Bhailwara'],
  UK: ['Haridwar', 'Dehradun', 'Rishikesh', 'Haldwani', 'Roorkee', 'Rudrapur', 'Nainital', 'Mussoorie'],
  BR: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai'],
  HR: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat'],
  PB: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur'],
  GJ: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh'],
  WB: ['Kolkata', 'Howrah', 'Darjeeling', 'Siliguri', 'Asansol', 'Durgapur', 'Kharagpur', 'Haldia'],
  MP: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam'],
  TN: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode'],
  AP: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Kakinada', 'Rajamahendravaram'],
  TG: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam'],
  JH: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Hazaribagh'],
  OR: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur', 'Berhampur', 'Balasore'],
  CG: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
  HP: ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali'],
  JK: ['Srinagar', 'Jammu', 'Anantnag', 'Kathua', 'Udhampur'],
  GA: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
  AS: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon'],
  KL: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  TR: ['Agartala'],
  ML: ['Shillong'],
  MN: ['Imphal'],
  NL: ['Kohima', 'Dimapur'],
  AR: ['Itanagar'],
  MZ: ['Aizawl'],
  SK: ['Gangtok']
};

export const State = {
  getStatesOfCountry: () => indianStates
};

export const City = {
  getCitiesOfState: (countryCode, stateIsoCode) => {
    const list = citiesByState[stateIsoCode] || [];
    return list.map(cityName => ({ name: cityName }));
  }
};
