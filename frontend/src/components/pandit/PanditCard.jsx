import React from 'react';
import { Star, MapPin, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import useT from '../../hooks/useT';

const PanditCard = ({ pandit }) => {
  const t = useT();

  const translateSpecialization = (spec) => {
    const cleanSpec = spec.trim();
    const specMap = {
      'Griha Pravesh': 'puja_3_name',
      'Satyanarayan Katha': 'puja_5_name',
      'Vivah Ceremony': 'puja_4_name',
      'Mundan Ceremony': 'puja_6_name',
      'Navratri Puja': 'puja_7_name',
      'Durga Puja': 'puja_8_name',
      'Havan & Yagya': 'puja_9_name',
      'Naamkaran': 'puja_10_name',
      'Ganesh Puja': 'puja_11_name',
      'Lakshmi Puja': 'puja_12_name',
      'Rudrabhishek': 'puja_1_name',
      'Surya Puja': 'puja_13_name',
      'All Pujas': 'card_all_pujas',
      'Vivah': 'puja_vivah_shorthand',
      'Satyanarayan': 'puja_satya_shorthand',
      'Havan': 'puja_havan_shorthand',
    };

    const key = specMap[cleanSpec];
    if (key) {
      return t(key);
    }
    return cleanSpec;
  };

  const getSpecializationsText = () => {
    let specs = [];
    if (Array.isArray(pandit.panditProfile?.specializations) && pandit.panditProfile.specializations.length > 0) {
      specs = pandit.panditProfile.specializations;
    } else if (pandit.panditProfile?.specialization) {
      specs = pandit.panditProfile.specialization.split(',').map(s => s.trim());
    } else {
      return t('card_all_pujas');
    }
    return specs.map(s => translateSpecialization(s)).join(', ');
  };

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
      
      <h3 className="font-bold font-serif text-xl text-maroon mb-1 group-hover:text-saffron transition-colors">{t('profile_pt_prefix')} {pandit.firstName} {pandit.lastName}</h3>
      
      <div className="flex items-center gap-1 text-textMid text-sm mb-4">
        <MapPin size={14} /> 
        {pandit.city || t('card_location_unavail')} 
        {pandit.distance !== undefined && (
          <span className="ml-1 text-[#1E7D3C] font-bold bg-[#E8F5EE] px-2 py-0.5 rounded-md">
            {pandit.distance < 1 ? '< 1' : Math.round(pandit.distance)} {t('card_away')}
          </span>
        )}
      </div>
      
      <div className="text-sm text-textMid mb-6 bg-surface p-3 rounded-xl border border-brandborder flex-1">
        <span className="font-bold text-maroon block mb-1">{t('card_specializations')}</span> 
        {getSpecializationsText()}
      </div>
      
      <div className="flex gap-2 mt-auto">
        <Link 
          to={`/pandit/${pandit._id}`}
          className="px-4 border border-brandborder text-maroon font-bold py-2.5 rounded-xl hover:bg-surface transition-colors text-sm"
        >
          {t('card_profile')}
        </Link>
        <Link 
          to={`/book/${pandit._id}`}
          className="flex-1 bg-saffron text-white font-bold py-2.5 rounded-xl hover:bg-saffron-dark transition-all shadow-md shadow-saffron/20 text-center flex items-center justify-center gap-2 text-sm"
        >
          <CalendarCheck size={18} /> {t('card_book_now')}
        </Link>
      </div>
    </div>
  );
};

export default PanditCard;
