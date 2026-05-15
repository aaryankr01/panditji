import React, { useState } from 'react';
import { Search, Filter, MapPin, Navigation } from 'lucide-react';

const PanditFilter = ({ onSearch, onFilterChange, onLocationRequest }) => {
  const [isLocating, setIsLocating] = useState(false);

  const handleGeolocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationRequest(position.coords.latitude, position.coords.longitude);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not get your location. Please check your browser permissions.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
      <div className="flex items-center gap-2 mb-6 text-gray-800 font-bold text-lg">
        <Filter size={20} className="text-orange-600" /> Filters
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Search Name</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search pandits..." 
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
          
          <button 
            onClick={handleGeolocation}
            disabled={isLocating}
            className="w-full mb-3 flex items-center justify-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 py-2 rounded-xl hover:bg-orange-100 transition-colors font-semibold text-sm disabled:opacity-50"
          >
            {isLocating ? (
              <span className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Navigation size={16} />
            )}
            {isLocating ? 'Locating...' : 'Use My Location'}
          </button>

          <div className="relative">
            <select 
              onChange={(e) => onFilterChange('location', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
            >
              <option value="">All Locations</option>
              <option value="Varanasi">Varanasi</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bengaluru</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Haridwar">Haridwar</option>
            </select>
            <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanditFilter;
