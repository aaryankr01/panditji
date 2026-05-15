import React from 'react';
import { Star, MapPin, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const PanditCard = ({ pandit }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-2xl">
          {pandit.firstName.charAt(0)}
        </div>
        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg text-sm font-bold border border-yellow-100">
          <Star size={14} fill="currentColor" /> 4.8
        </div>
      </div>
      
      <h3 className="font-bold text-xl text-gray-800 mb-1">Pt. {pandit.firstName} {pandit.lastName}</h3>
      
      <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
        <MapPin size={14} /> 
        {pandit.city || 'Location unavailable'} 
        {pandit.distance !== undefined && (
          <span className="ml-1 text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-md">
            {pandit.distance < 1 ? '< 1' : Math.round(pandit.distance)} km away
          </span>
        )}
      </div>
      
      <div className="text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100 flex-1">
        <span className="font-bold text-gray-700 block mb-1">Specializations:</span> 
        {pandit.panditProfile?.specialization || 'All standard Pujas and Homas'}
      </div>
      
      <div className="flex gap-2 mt-auto">
        <Link 
          to={`/book/${pandit._id}`}
          className="flex-1 bg-orange-600 text-white font-bold py-2.5 rounded-xl hover:bg-orange-700 transition-colors text-center flex items-center justify-center gap-2"
        >
          <CalendarCheck size={18} /> Book Now
        </Link>
        <Link 
          to={`/pandit/${pandit._id}`}
          className="px-4 bg-orange-50 text-orange-600 font-bold py-2.5 rounded-xl hover:bg-orange-100 transition-colors border border-orange-200"
        >
          Profile
        </Link>
      </div>
    </div>
  );
};

export default PanditCard;
