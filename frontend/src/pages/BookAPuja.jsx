import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import useAuthStore from '../store/useAuthStore';
import useT from '../hooks/useT';
import { State, City } from '../utils/indiaData';
import {
  Star, MapPin, ChevronRight, CheckCircle, AlertCircle, Search, Video, Info, X, Home, ArrowRight, Clock
} from 'lucide-react';

const pujas = [
  { id: 1, name: 'Rudrabhishek', image: '/pictures/rudrabhisek.png', rating: 4.8, conducted: 875, isPopular: true, desc: 'Lord Shiva abhisheka for peace and prosperity.', longDesc: 'Rudrabhishek is a highly auspicious puja dedicated to Lord Shiva. It involves bathing the Shiva Lingam with sacred items like milk, honey, and gangajal while chanting powerful mantras. This brings peace, prosperity, and removes negative energies.', duration: '2-3 hrs', price: 'â‚¹3,100', category: 'Devotional' },
  { id: 2, name: 'Sunderkand Path', image: '/pictures/sunderkand.png', rating: 4.5, conducted: 187, isPopular: true, desc: 'Recitation of Hanumanji\'s glory.', longDesc: 'Sunderkand Path is the recitation of the fifth chapter of the Ramcharitmanas, which highlights the glory, devotion, and triumphs of Lord Hanuman. It brings courage, confidence, and removes obstacles from one\'s path.', duration: '4-5 hrs', price: 'â‚¹3,500', category: 'Devotional' },
  { id: 3, name: 'Griha Pravesh', image: '/pictures/grihaparvesh.png', rating: 4.9, conducted: 540, isPopular: true, desc: 'Blessings for your new home.', longDesc: 'Griha Pravesh is a Hindu ceremony performed on the occasion of an individual\'s first time entering their new home. It cleanses the space of any negative energies and invites divine blessings for a peaceful living.', duration: '3-4 hrs', price: 'â‚¹5,100', category: 'Home' },
  { id: 4, name: 'Vivah Ceremony', image: '/pictures/vivahceremony.png', rating: 4.7, conducted: 320, isPopular: false, desc: 'Sacred marriage ceremonies.', longDesc: 'A complete traditional Hindu wedding ceremony guided by a knowledgeable Pandit. It includes all crucial rituals like Kanyadaan, Mangal Phera, and Saptapadi, ensuring the couple begins their new journey with divine blessings.', duration: '6-8 hrs', price: 'â‚¹11,000', category: 'Wedding' },
  { id: 5, name: 'Satyanarayan Katha', image: '/pictures/satnaraynkatha.png', rating: 4.6, conducted: 410, isPopular: true, desc: 'Traditional thanksgiving story.', longDesc: 'The Satyanarayan Katha is a popular ritual performed to express gratitude to Lord Vishnu. It is often conducted during auspicious occasions like housewarmings, marriages, or simply for the general well-being of the family.', duration: '2-3 hrs', price: 'â‚¹2,100', category: 'Devotional' },
  { id: 6, name: 'Mundan Ceremony', image: '/pictures/mundanceremony.png', rating: 4.5, conducted: 215, isPopular: false, desc: 'First haircut ritual for child.', longDesc: 'Mundan is a highly auspicious ceremony where a child receives their first haircut. It is believed to purify the child, free them from past life karma, and promote healthy mental and physical growth.', duration: '1-2 hrs', price: 'â‚¹2,100', category: 'Life Events' },
  { id: 7, name: 'Navratri Puja', image: '/pictures/navratripuja.png', rating: 4.8, conducted: 630, isPopular: true, desc: '9 days of Goddess Durga worship.', longDesc: 'A powerful 9-day puja dedicated to the nine forms of Goddess Durga. This puja invokes divine feminine energy, bringing strength, prosperity, and protection to the devotee\'s household.', duration: '1-2 hrs/day', price: 'â‚¹3,100', category: 'Festival' },
  { id: 8, name: 'Durga Puja', image: '/pictures/durgapuja.png', rating: 4.9, conducted: 410, isPopular: false, desc: 'Elaborate worship of Maa Durga.', longDesc: 'An elaborate and grand worship of Goddess Durga, celebrating her victory over Mahishasura. This puja is performed to overcome evil forces, obstacles, and to seek power and courage.', duration: '4-5 hrs', price: 'â‚¹5,100', category: 'Festival' },
  { id: 9, name: 'Havan & Yagya', image: '/pictures/havanand%20yagya.png', rating: 4.7, conducted: 820, isPopular: true, desc: 'Fire sacrifice for purification.', longDesc: 'Havan is a sacred fire ritual where offerings are made to the fire god, Agni. The chanting of mantras along with the fire purifies the environment, eliminates negativity, and brings spiritual upliftment.', duration: '2-3 hrs', price: 'â‚¹3,100', category: 'Ritual' },
  { id: 10, name: 'Naamkaran', image: '/pictures/namkaran.png', rating: 4.6, conducted: 345, isPopular: false, desc: 'Naming ceremony for newborns.', longDesc: 'The Naamkaran ceremony is the official naming of a newborn baby. According to Vedic astrology, the name is chosen based on the child\'s birth star (Nakshatra) to ensure a prosperous and auspicious life.', duration: '1-2 hrs', price: 'â‚¹2,100', category: 'Life Events' },
  { id: 11, name: 'Ganesh Puja', image: '/pictures/ganeshpuja.png', rating: 4.9, conducted: 1120, isPopular: true, desc: 'Worship of Lord Ganesha for success.', longDesc: 'Lord Ganesha is the remover of obstacles and the god of new beginnings. This puja is highly recommended before starting any new venture, business, or significant life event to ensure success.', duration: '1-2 hrs', price: 'â‚¹2,100', category: 'Devotional' },
  { id: 12, name: 'Lakshmi Puja', image: '/pictures/lakshmipuja.png', rating: 4.8, conducted: 950, isPopular: true, desc: 'Goddess of wealth worship.', longDesc: 'Lakshmi Puja is performed to invite Goddess Lakshmi, the deity of wealth, fortune, and prosperity, into one\'s home or business. It is especially significant during Diwali to ensure financial stability.', duration: '1-2 hrs', price: 'â‚¹2,100', category: 'Festival' },
  { id: 13, name: 'Surya Puja', image: '/pictures/suryapuja.png', rating: 4.5, conducted: 120, isPopular: false, desc: 'Sun God worship for health.', longDesc: 'Surya Puja honors the Sun God, who is the source of all life and energy. It is performed for good health, vitality, success in career, and to mitigate the negative effects of the Sun in one\'s horoscope.', duration: '1-2 hrs', price: 'â‚¹2,100', category: 'Ritual' },
  { id: 14, name: 'Kaal Sarp Dosh', image: '/pictures/kaalsarpdosh.png', rating: 4.6, conducted: 290, isPopular: false, desc: 'Remedial puja for Kaal Sarp Dosh.', longDesc: 'This remedial puja is specifically for individuals who have Kaal Sarp Dosh in their Kundali. It neutralizes the malefic effects of Rahu and Ketu, bringing relief from struggles and unlocking blocked success.', duration: '3-4 hrs', price: 'â‚¹5,500', category: 'Remedial' },
  { id: 15, name: 'Vastu Shanti', image: '/pictures/vastushanti.png', rating: 4.7, conducted: 410, isPopular: false, desc: 'Removing vastu defects from home.', longDesc: 'Vastu Shanti is performed to correct any architectural or directional faults (Vastu Doshas) in a building. It appeases Vastu Purusha, ensuring peace, harmony, and prosperity for the inhabitants.', duration: '3-4 hrs', price: 'â‚¹6,100', category: 'Home' },
  { id: 16, name: 'Maha Mrityunjaya', image: '/pictures/maha%20mrityunjaya.png', rating: 4.9, conducted: 560, isPopular: false, desc: 'Jaap for health and longevity.', longDesc: 'The Maha Mrityunjaya Jaap is a highly potent chant dedicated to Lord Shiva. It is performed to overcome severe illnesses, prevent untimely death, and grant the devotee longevity and spiritual growth.', duration: '5-6 hrs', price: 'â‚¹3,100', category: 'Remedial' },
  { id: 17, name: 'Annaprashan', image: '/pictures/annaprashann.png', rating: 4.4, conducted: 180, isPopular: false, desc: 'First solid food ritual for baby.', longDesc: 'Annaprashan marks the milestone of a baby consuming solid food for the first time. The puja invokes blessings for the child\'s health, digestion, and a life filled with abundance and nourishment.', duration: '1-2 hrs', price: 'â‚¹1,500', category: 'Life Events' },
  { id: 18, name: 'Navagraha Puja', image: '/pictures/navgarahpuja.png', rating: 4.5, conducted: 310, isPopular: false, desc: 'Worship of nine planets.', longDesc: 'Navagraha Puja aims to appease all nine astrological planets. It balances their energies, mitigating adverse planetary alignments (Doshas) and amplifying the positive influences in one\'s life.', duration: '2-3 hrs', price: 'â‚¹3,500', category: 'Remedial' },
  { id: 19, name: 'Lakshmi Narayan', image: '/pictures/lakshminarayan.png', rating: 4.8, conducted: 430, isPopular: false, desc: 'Joint worship of Vishnu and Lakshmi.', longDesc: 'This puja is dedicated to the divine couple, Lord Vishnu and Goddess Lakshmi. It is performed to seek marital bliss, harmonious family life, and sustained material and spiritual prosperity.', duration: '2-3 hrs', price: 'â‚¹2,500', category: 'Devotional' },
  { id: 20, name: 'Janmashtami Puja', image: '/pictures/janmashtamipuja.png', rating: 4.9, conducted: 780, isPopular: true, desc: 'Lord Krishna birth celebration.', longDesc: 'Celebrated on the birth anniversary of Lord Krishna, this puja involves midnight prayers, chanting, and offering Makhan Mishri. It fills the home with joy, love, and divine grace.', duration: '2-3 hrs', price: 'â‚¹3,100', category: 'Festival' },
];

const BookAPuja = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const t = useT();

  const categories = [t('bap_cat_all'), t('bap_cat_home'), t('bap_cat_wedding'), t('bap_cat_devotional'), t('bap_cat_festival'), t('bap_cat_ritual'), t('bap_cat_remedial'), t('bap_cat_life_events')];
  const steps = [t('bap_step_choose'), t('bap_step_location'), t('bap_step_book')];

  const [step, setStep] = useState(1);
  const [selectedPuja, setSelectedPuja] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(t('bap_cat_all'));

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [bookingType, setBookingType] = useState('doorstep');

  // Location step state
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState('');
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);

  const indianStates = State.getStatesOfCountry('IN');
  const citiesOfState = stateCode ? City.getCitiesOfState('IN', stateCode) : [];

  // Create a mapping or fallback for category filtering if needed, but since we rely on the English strings for the data, we might need a mapping.
  // Actually, pujas data has english category names.
  const catMap = {
    [t('bap_cat_all')]: 'All',
    [t('bap_cat_home')]: 'Home',
    [t('bap_cat_wedding')]: 'Wedding',
    [t('bap_cat_devotional')]: 'Devotional',
    [t('bap_cat_festival')]: 'Festival',
    [t('bap_cat_ritual')]: 'Ritual',
    [t('bap_cat_remedial')]: 'Remedial',
    [t('bap_cat_life_events')]: 'Life Events',
  };

  const englishCategory = catMap[selectedCategory] || 'All';
  const filtered = englishCategory === 'All' ? pujas : pujas.filter(p => p.category === englishCategory);

  const checkLocation = async () => {
    if (!city) return;
    setCheckingLocation(true);
    setLocationStatus(null);
    try {
      const res = await api.get(`/pandits?city=${encodeURIComponent(city)}`);
      if (res.data.isLocal && res.data.count > 0) {
        setLocationStatus('available');
      } else {
        setLocationStatus('unavailable');
      }
    } catch {
      setLocationStatus('unavailable');
    } finally {
      setCheckingLocation(false);
    }
  };

  const handleViewDetails = (puja) => {
    setSelectedPuja(puja);
    setShowDetailsModal(true);
  };

  const handleBookNowClick = (puja) => {
    setSelectedPuja(puja);
    setShowDetailsModal(false);
    setBookingType('doorstep');
    setStep(2); // Go directly to Step 2
  };

  const proceedToDashboard = () => {
    const queryParams = new URLSearchParams({
      city: city,
      puja: selectedPuja.name,
      mode: 'in-person'
    }).toString();

    if (isAuthenticated) {
      navigate(`/devotee-dashboard?${queryParams}`);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(`/devotee-dashboard?${queryParams}`)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans">
      <Navbar />

      <div className="bg-maroon text-white py-12 px-4 border-b-8 border-saffron relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-saffron opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl font-bold font-serif mb-3">{t('bap_title')}</h1>
          <p className="text-maroon-light">{t('bap_subtitle')}</p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">

        {/* Step Indicator (Only show if not on card grid) */}
        {step !== 1 && (
          <div className="bg-white border border-brandborder rounded-2xl py-4 px-6 shadow-sm mb-10 flex items-center gap-1 overflow-x-auto">
            {steps.map((s, i) => {
              const n = i + 1;
              const isActive = step === n;
              const isDone = step > n;
              return (
                <div key={s} className="flex items-center gap-1 shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isDone ? 'bg-[#1E7D3C] text-white' : isActive ? 'bg-saffron text-white' : 'bg-surface text-textMuted'}`}>
                    {isDone ? 'âœ“' : n}
                  </div>
                  <span className={`text-xs font-bold hidden sm:block ${isActive ? 'text-saffron' : isDone ? 'text-[#1E7D3C]' : 'text-textMuted'}`}>{s}</span>
                  {i < steps.length - 1 && <ChevronRight size={14} className="text-textMuted opacity-50" />}
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 1: Choose Puja (Grid View) */}
        {step === 1 && (
          <div>
            <div className="flex gap-2 flex-wrap mb-10 justify-center">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-saffron text-white shadow-lg' : 'bg-white border border-brandborder text-textMid hover:border-saffron hover:text-saffron'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filtered.map(puja => (
                <div key={puja.id} className="group bg-white rounded-3xl overflow-hidden border border-brandborder shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
                  <div className="relative h-48 overflow-hidden shrink-0 cursor-pointer" onClick={() => handleViewDetails(puja)}>
                    <img src={puja.image} alt={t(`puja_${puja.id}_name`) || puja.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {puja.isPopular && (
                      <div className="absolute top-4 left-4 bg-saffron text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        {t('bap_popular')}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold font-serif text-maroon mb-1 cursor-pointer hover:text-saffron transition-colors" onClick={() => handleViewDetails(puja)}>
                      {t(`puja_${puja.id}_name`) || puja.name}
                    </h3>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-gold text-gold" />)}
                        <span className="text-xs font-bold text-maroon ml-1">{puja.rating}</span>
                      </div>
                      <span className="text-saffron font-bold">{puja.price}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-textMid mb-4 bg-surface px-3 py-1.5 rounded-lg w-fit">
                      <Clock size={14} className="text-saffron" />
                      <span className="font-medium">{puja.duration}</span>
                    </div>

                    <p className="text-textMid text-xs mb-6 line-clamp-2 flex-1">{t(`puja_${puja.id}_desc`) || puja.desc}</p>

                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => handleViewDetails(puja)}
                        className="flex-1 px-3 py-2.5 border border-brandborder text-maroon font-bold rounded-xl hover:bg-surface transition-colors text-xs"
                      >
                        {t('bap_btn_details')}
                      </button>
                      <button
                        onClick={() => handleBookNowClick(puja)}
                        className="flex-1 px-3 py-2.5 bg-saffron text-white font-bold rounded-xl hover:bg-saffron-dark transition-all shadow-md shadow-saffron/20 text-xs"
                      >
                        {t('bap_btn_book')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Location Check */}
        {step === 2 && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white p-8 rounded-2xl border border-brandborder shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-saffron-light text-saffron rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="font-bold font-serif text-maroon text-xl">{t('bap_loc_title')}</h2>
                  <p className="text-sm text-textMid">{bookingType === 'epuja' ? t('bap_loc_subtitle_epuja') : t('bap_loc_subtitle_doorstep')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-textMid mb-1.5">{t('bap_lbl_state')}</label>
                  <select
                    value={stateCode}
                    onChange={e => { setStateCode(e.target.value); setCity(''); setLocationStatus(null); }}
                    className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron outline-none bg-white text-maroon"
                  >
                    <option value="">{t('bap_select_state')}</option>
                    {indianStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-textMid mb-1.5">{t('bap_lbl_city')}</label>
                  <select
                    value={city}
                    onChange={e => { setCity(e.target.value); setLocationStatus(null); }}
                    disabled={!stateCode}
                    className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron outline-none bg-white disabled:bg-surface disabled:text-textMuted text-maroon"
                  >
                    <option value="">{t('bap_select_city')}</option>
                    {citiesOfState.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <button
                  onClick={checkLocation}
                  disabled={!city || checkingLocation}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-saffron text-white font-bold rounded-xl hover:bg-saffron-dark transition-all shadow-md shadow-saffron/20"
                >
                  {checkingLocation ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={18} />}
                  {checkingLocation ? t('bap_btn_checking') : t('bap_btn_check_avail')}
                </button>
              </div>

              {locationStatus === 'available' && (
                <div className="mt-5 p-4 bg-[#E8F5EE] border border-[#1E7D3C] rounded-xl flex items-start gap-3">
                  <CheckCircle size={20} className="text-[#1E7D3C] mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-[#1E7D3C]">{t('bap_avail_in')} {city}!</p>
                    <button onClick={proceedToDashboard} className="mt-3 w-full py-3 bg-[#1E7D3C] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-[#15612e] transition-colors">
                      {t('bap_btn_view_book')} <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {locationStatus === 'unavailable' && (
                <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{t('bap_unavail_msg')} {city} {t('bap_unavail_msg_end')}</p>
                </div>
              )}

              <button onClick={() => setStep(1)} className="mt-4 w-full text-sm text-textMuted hover:text-maroon font-bold transition-colors">{t('bap_back_list')}</button>
            </div>
          </div>
        )}

      </main>

      {/* PUJA DETAILS MODAL */}
      {showDetailsModal && selectedPuja && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-maroon/60 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
          <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="relative h-64 shrink-0">
              <img src={selectedPuja.image} alt={t(`puja_${selectedPuja.id}_name`) || selectedPuja.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-colors z-20"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-6 left-8 right-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-saffron text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    {selectedPuja.category}
                  </span>
                  {selectedPuja.isPopular && (
                    <span className="bg-white text-maroon text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      {t('bap_popular_choice')}
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-bold font-serif text-white">{t(`puja_${selectedPuja.id}_name`) || selectedPuja.name}</h3>
              </div>
            </div>

            <div className="p-8 overflow-y-auto">
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-brandborder">
                <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl">
                  <Clock size={18} className="text-saffron" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-textMuted tracking-wider">{t('bap_duration')}</p>
                    <p className="text-sm font-bold text-maroon">{selectedPuja.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl">
                  <Star size={18} className="text-gold" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-textMuted tracking-wider">{t('bap_rating')}</p>
                    <p className="text-sm font-bold text-maroon">{selectedPuja.rating} ({selectedPuja.conducted}+)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl">
                  <Info size={18} className="text-[#1E7D3C]" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-textMuted tracking-wider">{t('bap_price')}</p>
                    <p className="text-sm font-bold text-[#1E7D3C]">{selectedPuja.price}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold font-serif text-maroon">{t('bap_about_puja')}</h4>
                <p className="text-textMid text-sm leading-relaxed">{t(`puja_${selectedPuja.id}_longDesc`) || selectedPuja.longDesc}</p>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleBookNowClick(selectedPuja)}
                  className="w-full py-4 bg-saffron text-white font-bold rounded-2xl shadow-lg shadow-saffron/20 hover:bg-saffron-dark transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight size={20} /> {t('bap_book_this_puja')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BookAPuja;

