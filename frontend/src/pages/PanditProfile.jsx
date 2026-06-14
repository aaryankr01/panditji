import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import { Star, MapPin, CheckCircle, CalendarCheck } from 'lucide-react';
import useT from '../hooks/useT';
import api from '../utils/api';

const PanditProfile = () => {
  const { id } = useParams();
  const [pandit, setPandit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
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

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  };

  useEffect(() => {
    const fetchPandit = async () => {
      try {
        const res = await api.get(`/pandits/${id}`);
        setPandit(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchPandit();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.get(`/reviews/pandit/${id}`)
      .then(res => setReviews(res.data.data || []))
      .catch(() => setReviews([]));
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
            <div className="flex items-center justify-center gap-2 text-orange-600 font-bold mb-4">
              <Star fill="currentColor" size={20} />
              <span>{pandit.panditProfile?.rating || 3.8}</span>
              <span className="text-gray-400 font-normal text-sm">({pandit.panditProfile?.totalReviews || 0} {pandit.panditProfile?.totalReviews === 1 ? 'review' : 'reviews'})</span>
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

        {/* ═══ REVIEWS SECTION ═══ */}
        <div className="mt-8 bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Star size={20} fill="#ea580c" color="#ea580c" />
              </span>
              What Devotees Say
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-full">
                <Star size={16} fill="#ea580c" color="#ea580c" />
                <span className="font-bold text-orange-700 text-lg">{pandit.panditProfile?.rating || 3.8}</span>
                <span className="text-gray-400 text-sm">· {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-14 flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-2">
                <Star size={32} color="#fdba74" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">No reviews yet</p>
              <p className="text-gray-400 text-sm">Be the first to share your experience after a completed puja.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  style={{ border: '1px solid #FDE8D8', background: 'linear-gradient(135deg, #FFFAF6 0%, #FFF5EE 100%)' }}
                  className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-md"
                >
                  {/* Reviewer Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-base flex-shrink-0 overflow-hidden">
                      {review.devotee?.avatar
                        ? <img src={review.devotee.avatar} alt="" className="w-full h-full object-cover" />
                        : (review.devotee?.firstName?.charAt(0) || '?')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">
                        {review.devotee?.firstName} {review.devotee?.lastName}
                      </p>
                      <p className="text-gray-400 text-xs">{timeAgo(review.createdAt)}</p>
                    </div>
                    {/* Star Row */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= review.rating ? '#ea580c' : 'none'}
                          color={s <= review.rating ? '#ea580c' : '#d1d5db'}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Comment */}
                  {review.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed italic border-l-2 border-orange-300 pl-3">
                      "{review.comment}"
                    </p>
                  )}

                  {/* Puja Type Tag */}
                  {review.booking?.pujaType && (
                    <div className="mt-auto pt-1">
                      <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded-full font-semibold">
                        🕉 {review.booking.pujaType}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PanditProfile;
