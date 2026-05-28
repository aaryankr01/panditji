import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import { Star, MapPin, CheckCircle, CalendarCheck } from 'lucide-react';
import useT from '../hooks/useT';

const PanditProfile = () => {
  const { id } = useParams();
  const [pandit, setPandit] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const getTranslatedBio = (bio, firstName) => {
    if (!bio) {
      return t('profile_default_bio', { name: firstName });
    }
    
    const prefix = 'Specializes in:';
    if (bio.toLowerCase().startsWith(prefix.toLowerCase())) {
      const specializationText = bio.slice(prefix.length).trim();
      
      const translatedSpecialization = specializationText
        .split(',')
        .map(s => translateSpecialization(s))
        .join(', ');
        
      return `${t('profile_specializes_in')} ${translatedSpecialization}`;
    }
    return bio;
  };

  useEffect(() => {
    const fetchPandit = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/pandits/${id}`);
        setPandit(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchPandit();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader size={48} /></div>;
  if (!pandit) return <div className="min-h-screen flex items-center justify-center">{t('profile_not_found')}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-10">
          {/* Left Column - Avatar & Quick Info */}
          <div className="w-full md:w-1/3 flex flex-col items-center text-center">
            <div className="w-40 h-40 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-6xl mb-6 shadow-inner overflow-hidden">
              {pandit.avatar ? (
                <img src={pandit.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                pandit.firstName.charAt(0)
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('profile_pt_prefix')} {pandit.firstName} {pandit.lastName}</h1>
            <div className="flex items-center gap-2 text-yellow-500 font-bold mb-4">
              <Star fill="currentColor" /> 4.9 <span className="text-gray-400 font-normal text-sm">{t('profile_reviews', { count: 120 })}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 mb-6 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <MapPin size={18} /> {pandit.city || t('profile_available_worldwide')}
            </div>
            
            <div className="flex flex-col w-full gap-3">
              <Link 
                to={`/book/${pandit._id}`}
                className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-all shadow-md flex items-center justify-center gap-2 text-lg"
              >
                <CalendarCheck /> {t('profile_book_puja')}
              </Link>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="w-full md:w-2/3">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg font-bold text-sm w-max mb-8 border border-green-100">
              <CheckCircle size={18} /> {t('profile_verified_partner')}
            </div>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">{t('profile_about_panditji')}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {getTranslatedBio(pandit.panditProfile?.bio, pandit.firstName)}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">{t('profile_specializations')}</h2>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    let specs = [];
                    if (Array.isArray(pandit.panditProfile?.specializations) && pandit.panditProfile.specializations.length > 0) {
                      specs = pandit.panditProfile.specializations;
                    } else if (pandit.panditProfile?.specialization) {
                      specs = pandit.panditProfile.specialization.split(',').map(s => s.trim());
                    } else {
                      specs = ['Griha Pravesh', 'Vivah', 'Satyanarayan', 'Havan'];
                    }
                    return specs.map((spec, idx) => (
                      <span key={idx} className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-semibold border border-orange-100">
                        {translateSpecialization(spec)}
                      </span>
                    ));
                  })()}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">{t('profile_experience')}</h2>
                <p className="text-gray-600">
                  {pandit.panditProfile?.experience || '10+'} {t('profile_years_service')}
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PanditProfile;
