import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import useAuthStore from '../store/useAuthStore';
import { State, City } from 'country-state-city';
import {
  Star, MapPin, ChevronRight, CheckCircle, AlertCircle, Search, Video, Info, X, Home, ArrowRight, Clock
} from 'lucide-react';

const pujas = [
  { id: 1, name: 'Rudrabhishek', image: 'https://images.unsplash.com/photo-1630938063393-db2bc769f9a2?q=80&w=800&auto=format&fit=crop', rating: 4.8, conducted: 875, isPopular: true, desc: 'Lord Shiva abhisheka for peace and prosperity.', longDesc: 'Rudrabhishek is a highly auspicious puja dedicated to Lord Shiva. It involves bathing the Shiva Lingam with sacred items like milk, honey, and gangajal while chanting powerful mantras. This brings peace, prosperity, and removes negative energies.', duration: '2-3 hrs', price: '₹3,100', category: 'Devotional' },
  { id: 2, name: 'Sunderkand Path', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop', rating: 4.5, conducted: 187, isPopular: true, desc: 'Recitation of Hanumanji\'s glory.', longDesc: 'Sunderkand Path is the recitation of the fifth chapter of the Ramcharitmanas, which highlights the glory, devotion, and triumphs of Lord Hanuman. It brings courage, confidence, and removes obstacles from one\'s path.', duration: '4-5 hrs', price: '₹3,500', category: 'Devotional' },
  { id: 3, name: 'Griha Pravesh', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', rating: 4.9, conducted: 540, isPopular: true, desc: 'Blessings for your new home.', longDesc: 'Griha Pravesh is a Hindu ceremony performed on the occasion of an individual\'s first time entering their new home. It cleanses the space of any negative energies and invites divine blessings for a peaceful living.', duration: '3-4 hrs', price: '₹5,100', category: 'Home' },
  { id: 4, name: 'Vivah Ceremony', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop', rating: 4.7, conducted: 320, isPopular: false, desc: 'Sacred marriage ceremonies.', longDesc: 'A complete traditional Hindu wedding ceremony guided by a knowledgeable Pandit. It includes all crucial rituals like Kanyadaan, Mangal Phera, and Saptapadi, ensuring the couple begins their new journey with divine blessings.', duration: '6-8 hrs', price: '₹11,000', category: 'Wedding' },
  { id: 5, name: 'Satyanarayan Katha', image: 'https://images.unsplash.com/photo-1561049501-e1f96bdd98ee?q=80&w=800&auto=format&fit=crop', rating: 4.6, conducted: 410, isPopular: true, desc: 'Traditional thanksgiving story.', longDesc: 'The Satyanarayan Katha is a popular ritual performed to express gratitude to Lord Vishnu. It is often conducted during auspicious occasions like housewarmings, marriages, or simply for the general well-being of the family.', duration: '2-3 hrs', price: '₹2,100', category: 'Devotional' },
  { id: 6, name: 'Mundan Ceremony', image: 'https://images.unsplash.com/photo-1596701062351-be5f6a45556d?q=80&w=800&auto=format&fit=crop', rating: 4.5, conducted: 215, isPopular: false, desc: 'First haircut ritual for child.', longDesc: 'Mundan is a highly auspicious ceremony where a child receives their first haircut. It is believed to purify the child, free them from past life karma, and promote healthy mental and physical growth.', duration: '1-2 hrs', price: '₹2,100', category: 'Life Events' },
  { id: 7, name: 'Navratri Puja', image: 'https://images.unsplash.com/photo-1533158307587-828f0a76cf46?q=80&w=800&auto=format&fit=crop', rating: 4.8, conducted: 630, isPopular: true, desc: '9 days of Goddess Durga worship.', longDesc: 'A powerful 9-day puja dedicated to the nine forms of Goddess Durga. This puja invokes divine feminine energy, bringing strength, prosperity, and protection to the devotee\'s household.', duration: '1-2 hrs/day', price: '₹3,100', category: 'Festival' },
  { id: 8, name: 'Durga Puja', image: 'https://images.unsplash.com/photo-1605342417726-25f385c2c4d6?q=80&w=800&auto=format&fit=crop', rating: 4.9, conducted: 410, isPopular: false, desc: 'Elaborate worship of Maa Durga.', longDesc: 'An elaborate and grand worship of Goddess Durga, celebrating her victory over Mahishasura. This puja is performed to overcome evil forces, obstacles, and to seek power and courage.', duration: '4-5 hrs', price: '₹5,100', category: 'Festival' },
  { id: 9, name: 'Havan & Yagya', image: 'https://images.unsplash.com/photo-1595180666016-56bebc161c60?q=80&w=800&auto=format&fit=crop', rating: 4.7, conducted: 820, isPopular: true, desc: 'Fire sacrifice for purification.', longDesc: 'Havan is a sacred fire ritual where offerings are made to the fire god, Agni. The chanting of mantras along with the fire purifies the environment, eliminates negativity, and brings spiritual upliftment.', duration: '2-3 hrs', price: '₹3,100', category: 'Ritual' },
  { id: 10, name: 'Naamkaran', image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=800&auto=format&fit=crop', rating: 4.6, conducted: 345, isPopular: false, desc: 'Naming ceremony for newborns.', longDesc: 'The Naamkaran ceremony is the official naming of a newborn baby. According to Vedic astrology, the name is chosen based on the child\'s birth star (Nakshatra) to ensure a prosperous and auspicious life.', duration: '1-2 hrs', price: '₹2,100', category: 'Life Events' },
  { id: 11, name: 'Ganesh Puja', image: 'https://images.unsplash.com/photo-1563200787-88981df10134?q=80&w=800&auto=format&fit=crop', rating: 4.9, conducted: 1120, isPopular: true, desc: 'Worship of Lord Ganesha for success.', longDesc: 'Lord Ganesha is the remover of obstacles and the god of new beginnings. This puja is highly recommended before starting any new venture, business, or significant life event to ensure success.', duration: '1-2 hrs', price: '₹2,100', category: 'Devotional' },
  { id: 12, name: 'Lakshmi Puja', image: 'https://images.unsplash.com/photo-1616035133379-37f0dc32de88?q=80&w=800&auto=format&fit=crop', rating: 4.8, conducted: 950, isPopular: true, desc: 'Goddess of wealth worship.', longDesc: 'Lakshmi Puja is performed to invite Goddess Lakshmi, the deity of wealth, fortune, and prosperity, into one\'s home or business. It is especially significant during Diwali to ensure financial stability.', duration: '1-2 hrs', price: '₹2,100', category: 'Festival' },
  { id: 13, name: 'Surya Puja', image: 'https://images.unsplash.com/photo-1583344697967-df5e9e000490?q=80&w=800&auto=format&fit=crop', rating: 4.5, conducted: 120, isPopular: false, desc: 'Sun God worship for health.', longDesc: 'Surya Puja honors the Sun God, who is the source of all life and energy. It is performed for good health, vitality, success in career, and to mitigate the negative effects of the Sun in one\'s horoscope.', duration: '1-2 hrs', price: '₹2,100', category: 'Ritual' },
  { id: 14, name: 'Kaal Sarp Dosh', image: 'https://images.unsplash.com/photo-1615566373801-b3b420067645?q=80&w=800&auto=format&fit=crop', rating: 4.6, conducted: 290, isPopular: false, desc: 'Remedial puja for Kaal Sarp Dosh.', longDesc: 'This remedial puja is specifically for individuals who have Kaal Sarp Dosh in their Kundali. It neutralizes the malefic effects of Rahu and Ketu, bringing relief from struggles and unlocking blocked success.', duration: '3-4 hrs', price: '₹5,500', category: 'Remedial' },
  { id: 15, name: 'Vastu Shanti', image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?q=80&w=800&auto=format&fit=crop', rating: 4.7, conducted: 410, isPopular: false, desc: 'Removing vastu defects from home.', longDesc: 'Vastu Shanti is performed to correct any architectural or directional faults (Vastu Doshas) in a building. It appeases Vastu Purusha, ensuring peace, harmony, and prosperity for the inhabitants.', duration: '3-4 hrs', price: '₹6,100', category: 'Home' },
  { id: 16, name: 'Maha Mrityunjaya', image: 'https://images.unsplash.com/photo-1621689718474-0f1e0d37e3d1?q=80&w=800&auto=format&fit=crop', rating: 4.9, conducted: 560, isPopular: false, desc: 'Jaap for health and longevity.', longDesc: 'The Maha Mrityunjaya Jaap is a highly potent chant dedicated to Lord Shiva. It is performed to overcome severe illnesses, prevent untimely death, and grant the devotee longevity and spiritual growth.', duration: '5-6 hrs', price: '₹3,100', category: 'Remedial' },
  { id: 17, name: 'Annaprashan', image: 'https://images.unsplash.com/photo-1544026265-b1ebdbd4da34?q=80&w=800&auto=format&fit=crop', rating: 4.4, conducted: 180, isPopular: false, desc: 'First solid food ritual for baby.', longDesc: 'Annaprashan marks the milestone of a baby consuming solid food for the first time. The puja invokes blessings for the child\'s health, digestion, and a life filled with abundance and nourishment.', duration: '1-2 hrs', price: '₹1,500', category: 'Life Events' },
  { id: 18, name: 'Navagraha Puja', image: 'https://images.unsplash.com/photo-1596711462057-0a133486abdf?q=80&w=800&auto=format&fit=crop', rating: 4.5, conducted: 310, isPopular: false, desc: 'Worship of nine planets.', longDesc: 'Navagraha Puja aims to appease all nine astrological planets. It balances their energies, mitigating adverse planetary alignments (Doshas) and amplifying the positive influences in one\'s life.', duration: '2-3 hrs', price: '₹3,500', category: 'Remedial' },
  { id: 19, name: 'Lakshmi Narayan', image: 'https://images.unsplash.com/photo-1574585145600-0e190e29b15b?q=80&w=800&auto=format&fit=crop', rating: 4.8, conducted: 430, isPopular: false, desc: 'Joint worship of Vishnu and Lakshmi.', longDesc: 'This puja is dedicated to the divine couple, Lord Vishnu and Goddess Lakshmi. It is performed to seek marital bliss, harmonious family life, and sustained material and spiritual prosperity.', duration: '2-3 hrs', price: '₹2,500', category: 'Devotional' },
  { id: 20, name: 'Janmashtami Puja', image: 'https://images.unsplash.com/photo-1599500057422-b5b630dc65ab?q=80&w=800&auto=format&fit=crop', rating: 4.9, conducted: 780, isPopular: true, desc: 'Lord Krishna birth celebration.', longDesc: 'Celebrated on the birth anniversary of Lord Krishna, this puja involves midnight prayers, chanting, and offering Makhan Mishri. It fills the home with joy, love, and divine grace.', duration: '2-3 hrs', price: '₹3,100', category: 'Festival' },
];

const categories = ['All', 'Home', 'Wedding', 'Devotional', 'Festival', 'Ritual', 'Remedial', 'Life Events'];
const steps = ['Choose Puja', 'Your Location', 'Book Pandit'];

const BookAPuja = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1); 
  const [selectedPuja, setSelectedPuja] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEPujaModal, setShowEPujaModal] = useState(false);
  
  const [bookingType, setBookingType] = useState('doorstep');

  // Location step state
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState('');
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);

  const indianStates = State.getStatesOfCountry('IN');
  const citiesOfState = stateCode ? City.getCitiesOfState('IN', stateCode) : [];
  const filtered = selectedCategory === 'All' ? pujas : pujas.filter(p => p.category === selectedCategory);

  const checkLocation = async () => {
    if (!city) return;
    setCheckingLocation(true);
    setLocationStatus(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/pandits?city=${encodeURIComponent(city)}`);
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
    setShowEPujaModal(true);
  };

  const proceedWithBooking = (type) => {
    setBookingType(type);
    setShowEPujaModal(false);
    setStep(2); // Go to Location step
  };

  const proceedToDashboard = () => {
    const queryParams = new URLSearchParams({
      city: city,
      puja: selectedPuja.name,
      mode: bookingType === 'epuja' ? 'online' : 'in-person'
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
          <h1 className="text-4xl font-bold font-serif mb-3">All Puja Services</h1>
          <p className="text-maroon-light">Experience sacred rituals with verified Pandits at your doorstep or online.</p>
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
                    {isDone ? '✓' : n}
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
                    <img src={puja.image} alt={puja.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {puja.isPopular && (
                      <div className="absolute top-4 left-4 bg-saffron text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        Popular
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold font-serif text-maroon mb-1 cursor-pointer hover:text-saffron transition-colors" onClick={() => handleViewDetails(puja)}>
                      {puja.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-gold text-gold" />)}
                        <span className="text-xs font-bold text-maroon ml-1">{puja.rating}</span>
                      </div>
                      <span className="text-saffron font-bold">{puja.price}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-textMid mb-4 bg-surface px-3 py-1.5 rounded-lg w-fit">
                      <Clock size={14} className="text-saffron" />
                      <span className="font-medium">{puja.duration}</span>
                    </div>

                    <p className="text-textMid text-xs mb-6 line-clamp-2 flex-1">{puja.desc}</p>
                    
                    <div className="flex gap-3 mt-auto">
                      <button 
                        onClick={() => handleViewDetails(puja)}
                        className="flex-1 px-3 py-2.5 border border-brandborder text-maroon font-bold rounded-xl hover:bg-surface transition-colors text-xs"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleBookNowClick(puja)}
                        className="flex-1 px-3 py-2.5 bg-saffron text-white font-bold rounded-xl hover:bg-saffron-dark transition-all shadow-md shadow-saffron/20 text-xs"
                      >
                        Book
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
                  <h2 className="font-bold font-serif text-maroon text-xl">Where is the Puja?</h2>
                  <p className="text-sm text-textMid">{bookingType === 'epuja' ? 'Needed to match you with a Pandit' : 'We will check availability in your city'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-textMid mb-1.5">State</label>
                  <select
                    value={stateCode}
                    onChange={e => { setStateCode(e.target.value); setCity(''); setLocationStatus(null); }}
                    className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron outline-none bg-white text-maroon"
                  >
                    <option value="">Select State</option>
                    {indianStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-textMid mb-1.5">City</label>
                  <select
                    value={city}
                    onChange={e => { setCity(e.target.value); setLocationStatus(null); }}
                    disabled={!stateCode}
                    className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron outline-none bg-white disabled:bg-surface disabled:text-textMuted text-maroon"
                  >
                    <option value="">Select City</option>
                    {citiesOfState.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <button
                  onClick={checkLocation}
                  disabled={!city || checkingLocation}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-saffron text-white font-bold rounded-xl hover:bg-saffron-dark transition-all shadow-md shadow-saffron/20"
                >
                  {checkingLocation ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={18} />}
                  {checkingLocation ? 'Checking...' : 'Check Availability'}
                </button>
              </div>

              {locationStatus === 'available' && (
                <div className="mt-5 p-4 bg-[#E8F5EE] border border-[#1E7D3C] rounded-xl flex items-start gap-3">
                  <CheckCircle size={20} className="text-[#1E7D3C] mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-[#1E7D3C]">Available in {city}!</p>
                    <button onClick={proceedToDashboard} className="mt-3 w-full py-3 bg-[#1E7D3C] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-[#15612e] transition-colors">
                      View Available Pandits & Book <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {locationStatus === 'unavailable' && (
                <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700 font-medium">Sorry, no pandits available in {city} yet. Please try another city.</p>
                </div>
              )}
              
              <button onClick={() => setStep(1)} className="mt-4 w-full text-sm text-textMuted hover:text-maroon font-bold transition-colors">← Back to Puja List</button>
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
              <img src={selectedPuja.image} alt={selectedPuja.name} className="w-full h-full object-cover" />
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
                      Popular Choice
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-bold font-serif text-white">{selectedPuja.name}</h3>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-brandborder">
                <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl">
                  <Clock size={18} className="text-saffron" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Duration</p>
                    <p className="text-sm font-bold text-maroon">{selectedPuja.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl">
                  <Star size={18} className="text-gold" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Rating</p>
                    <p className="text-sm font-bold text-maroon">{selectedPuja.rating} ({selectedPuja.conducted}+)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl">
                  <Info size={18} className="text-[#1E7D3C]" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Price</p>
                    <p className="text-sm font-bold text-[#1E7D3C]">{selectedPuja.price}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold font-serif text-maroon">About this Puja</h4>
                <p className="text-textMid text-sm leading-relaxed">{selectedPuja.longDesc}</p>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => handleBookNowClick(selectedPuja)}
                  className="w-full py-4 bg-saffron text-white font-bold rounded-2xl shadow-lg shadow-saffron/20 hover:bg-saffron-dark transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight size={20} /> Book This Puja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E-PUJA MODAL */}
      {showEPujaModal && selectedPuja && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-maroon/60 backdrop-blur-sm" onClick={() => setShowEPujaModal(false)} />
          <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            <button 
              onClick={() => setShowEPujaModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-surface rounded-full transition-colors z-20"
            >
              <X size={20} className="text-maroon" />
            </button>
            
            <div className="flex border-b border-brandborder shrink-0">
              <button 
                onClick={() => setBookingType('doorstep')}
                className={`flex-1 py-6 font-bold text-sm transition-all ${bookingType === 'doorstep' ? 'bg-white text-saffron border-b-2 border-saffron' : 'bg-surface text-textMuted'}`}
              >
                Book a Pandit (Doorstep)
              </button>
              <button 
                onClick={() => setBookingType('epuja')}
                className={`flex-1 py-6 font-bold text-sm transition-all ${bookingType === 'epuja' ? 'bg-white text-saffron border-b-2 border-saffron' : 'bg-surface text-textMuted'}`}
              >
                Book an E-Puja
              </button>
            </div>

            <div className="p-10 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-saffron-light text-saffron rounded-xl flex items-center justify-center shrink-0">
                  {bookingType === 'epuja' ? <Video size={24} /> : <Home size={24} />}
                </div>
                <h3 className="text-2xl font-bold font-serif text-maroon">
                  {bookingType === 'epuja' ? 'E-Puja Booking' : 'Doorstep Puja Booking'}
                </h3>
              </div>

              <div className="space-y-4 text-textMid mb-8">
                <p className="font-medium text-sm">
                  {bookingType === 'epuja' 
                    ? 'E-Puja is an easy way to book and perform Hindu rituals online from your home. A qualified pandit conducts the puja live through a video call and guides you through each step of the ritual.' 
                    : 'Traditional doorstep puja where a verified Pandit visits your home with all necessary Samagri to perform the sacred rituals.'}
                </p>
                <div className="space-y-2 bg-surface p-4 rounded-xl border border-brandborder">
                  <p className="font-bold text-maroon text-sm">How it works:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#1E7D3C] mt-0.5 shrink-0" /> Select the puja, date, and time.</li>
                    <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#1E7D3C] mt-0.5 shrink-0" /> {bookingType === 'epuja' ? 'Join the live video session with the pandit.' : 'Pandit reaches your location on time.'}</li>
                    <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#1E7D3C] mt-0.5 shrink-0" /> Follow the guided ritual and ask questions during the puja.</li>
                  </ul>
                </div>
              </div>

              <button 
                onClick={() => proceedWithBooking(bookingType)}
                className="w-full py-4 bg-saffron text-white font-bold rounded-2xl shadow-lg shadow-saffron/20 hover:bg-saffron-dark transition-all flex items-center justify-center gap-2"
              >
                {bookingType === 'epuja' ? <Video size={20} /> : <ArrowRight size={20} />}
                {bookingType === 'epuja' ? 'Continue with E-puja' : 'Continue with Doorstep'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BookAPuja;
