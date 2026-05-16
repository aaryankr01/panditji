import React from 'react';
import { Star, MapPin, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const PanditCard = ({ pandit }) => {
  return (
    <div className="bg-white rounded-[32px] p-6 border border-brandborder shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-14 h-14 bg-saffron-light text-saffron rounded-full flex items-center justify-center font-bold text-2xl shadow-sm">
          {pandit.firstName.charAt(0)}
        </div>
        <div className="flex items-center gap-1 bg-surface text-maroon px-3 py-1.5 rounded-xl text-sm font-bold border border-brandborder">
          <Star size={14} className="fill-gold text-gold" /> 4.8
        </div>
      </div>
      
      <h3 className="font-bold font-serif text-xl text-maroon mb-1 group-hover:text-saffron transition-colors">Pt. {pandit.firstName} {pandit.lastName}</h3>
      
      <div className="flex items-center gap-1 text-textMid text-sm mb-4">
        <MapPin size={14} /> 
        {pandit.city || 'Location unavailable'} 
        {pandit.distance !== undefined && (
          <span className="ml-1 text-[#1E7D3C] font-bold bg-[#E8F5EE] px-2 py-0.5 rounded-md">
            {pandit.distance < 1 ? '< 1' : Math.round(pandit.distance)} km away
          </span>
        )}
      </div>
      
      <div className="text-sm text-textMid mb-6 bg-surface p-3 rounded-xl border border-brandborder flex-1">
        <span className="font-bold text-maroon block mb-1">Specializations:</span> 
        {pandit.panditProfile?.specialization || 'All standard Pujas and Homas'}
      </div>
      
      <div className="flex gap-2 mt-auto">
        <Link 
          to={`/pandit/${pandit._id}`}
          className="px-4 border border-brandborder text-maroon font-bold py-2.5 rounded-xl hover:bg-surface transition-colors text-sm"
        >
          Profile
        </Link>
        <Link 
          to={`/book/${pandit._id}`}
          className="flex-1 bg-saffron text-white font-bold py-2.5 rounded-xl hover:bg-saffron-dark transition-all shadow-md shadow-saffron/20 text-center flex items-center justify-center gap-2 text-sm"
        >
          <CalendarCheck size={18} /> Book Now
        </Link>
      </div>
    </div>
  );
};

export default PanditCard;
