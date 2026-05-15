import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { State, City } from 'country-state-city';
import {
  Home, Heart, BookOpen, User, Star, Zap, Shield, Sun, Moon,
  Flame, Music, Gift, Clock, Calendar, MapPin, ChevronRight,
  CheckCircle, AlertCircle, Search
} from 'lucide-react';

const pujas = [
  { id: 1, name: 'Griha Pravesh', icon: Home, desc: 'House warming ceremony', duration: '3-4 hrs', price: '₹5,100', category: 'Home' },
  { id: 2, name: 'Vivah Sanskar', icon: Heart, desc: 'Marriage ceremonies', duration: '6-8 hrs', price: '₹11,000', category: 'Wedding' },
  { id: 3, name: 'Satyanarayan Katha', icon: BookOpen, desc: 'Auspicious story telling', duration: '2-3 hrs', price: '₹2,100', category: 'Devotional' },
  { id: 4, name: 'Namakaran', icon: User, desc: 'Naming ceremony', duration: '1-2 hrs', price: '₹1,500', category: 'Life Events' },
  { id: 5, name: 'Ganesh Puja', icon: Star, desc: 'Blessings of Lord Ganesha', duration: '1-2 hrs', price: '₹1,100', category: 'Devotional' },
  { id: 6, name: 'Laxmi Puja', icon: Gift, desc: 'Goddess of prosperity', duration: '2 hrs', price: '₹1,500', category: 'Devotional' },
  { id: 7, name: 'Navratri Puja', icon: Moon, desc: 'Nine nights celebration', duration: '9 days', price: '₹7,500', category: 'Festival' },
  { id: 8, name: 'Havan & Yagya', icon: Flame, desc: 'Sacred fire rituals', duration: '3-5 hrs', price: '₹4,500', category: 'Ritual' },
  { id: 9, name: 'Maha Mrityunjaya', icon: Shield, desc: 'Health & longevity mantra', duration: '3-4 hrs', price: '₹3,100', category: 'Ritual' },
  { id: 10, name: 'Rudrabhishek', icon: Sun, desc: 'Shiva abhisheka puja', duration: '2-3 hrs', price: '₹2,500', category: 'Devotional' },
  { id: 11, name: 'Kaal Sarp Dosh', icon: Zap, desc: 'Remedial puja for dosha', duration: '3-4 hrs', price: '₹5,500', category: 'Remedial' },
  { id: 12, name: 'Vastu Shanti', icon: Home, desc: 'Harmony of living space', duration: '4-5 hrs', price: '₹6,100', category: 'Home' },
  { id: 13, name: 'Mundan Ceremony', icon: User, desc: 'First haircut ritual', duration: '1-2 hrs', price: '₹1,800', category: 'Life Events' },
  { id: 14, name: 'Annaprashan', icon: Gift, desc: 'First rice feeding ceremony', duration: '1-2 hrs', price: '₹1,500', category: 'Life Events' },
  { id: 15, name: 'Durga Puja', icon: Star, desc: 'Worship of Goddess Durga', duration: '4-5 hrs', price: '₹4,100', category: 'Devotional' },
  { id: 16, name: 'Navagraha Puja', icon: Sun, desc: 'Nine planets puja', duration: '3-4 hrs', price: '₹3,500', category: 'Remedial' },
  { id: 17, name: 'Havan Yagya', icon: Flame, desc: 'Sacred fire ritual', duration: '3-5 hrs', price: '₹4,000', category: 'Ritual' },
  { id: 18, name: 'Lakshmi Narayan Puja', icon: Music, desc: 'Joint worship ceremony', duration: '2-3 hrs', price: '₹2,500', category: 'Devotional' },
  { id: 19, name: 'Janmashtami Puja', icon: Star, desc: 'Lord Krishna birthday', duration: '3-4 hrs', price: '₹3,100', category: 'Festival' },
  { id: 20, name: 'Sunderkand Path', icon: BookOpen, desc: 'Recitation of Ramcharitmanas', duration: '4-5 hrs', price: '₹3,500', category: 'Devotional' },
];

const categories = ['All', 'Home', 'Wedding', 'Devotional', 'Festival', 'Ritual', 'Remedial', 'Life Events'];
const steps = ['Your Location', 'Choose Puja', 'Date & Time', 'Details', 'Confirm'];

const BookAPuja = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPuja, setSelectedPuja] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookingData, setBookingData] = useState({ date: '', time: '', address: '', name: '', phone: '', notes: '' });
  const [booked, setBooked] = useState(false);

  // Location step state
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState('');
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null); // 'available' | 'unavailable' | null

  const indianStates = State.getStatesOfCountry('IN');
  const citiesOfState = stateCode ? City.getCitiesOfState('IN', stateCode) : [];
  const stateName = indianStates.find(s => s.isoCode === stateCode)?.name || '';
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

  const handleBook = () => setBooked(true);

  if (booked) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Booking Confirmed!</h2>
          <p className="text-gray-500 max-w-md mb-2">Your <strong>{selectedPuja?.name}</strong> in <strong>{city}</strong> is booked for <strong>{bookingData.date}</strong> at <strong>{bookingData.time}</strong>.</p>
          <p className="text-gray-400 text-sm mb-8">A pandit will be assigned shortly. You'll receive confirmation on your phone.</p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/devotee-dashboard')} className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors">Go to Dashboard</button>
            <button onClick={() => { setBooked(false); setStep(1); setSelectedPuja(null); setLocationStatus(null); setCity(''); setStateCode(''); }} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">Book Another</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="bg-orange-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold font-serif mb-3">Book a Puja</h1>
          <p className="text-orange-100">Enter your location, choose a puja, and we'll find you a trusted pandit</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-1 overflow-x-auto">
          {steps.map((s, i) => {
            const n = i + 1;
            const isActive = step === n;
            const isDone = step > n;
            return (
              <div key={s} className="flex items-center gap-1 shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {isDone ? '✓' : n}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-orange-600' : isDone ? 'text-green-600' : 'text-gray-400'}`}>{s}</span>
                {i < steps.length - 1 && <ChevronRight size={14} className="text-gray-300" />}
              </div>
            );
          })}
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">

        {/* STEP 1: Location Check */}
        {step === 1 && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">Enter Your Location</h2>
                  <p className="text-sm text-gray-500">We'll check if a pandit is available near you</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">State</label>
                  <select
                    value={stateCode}
                    onChange={e => { setStateCode(e.target.value); setCity(''); setLocationStatus(null); }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  >
                    <option value="">Select State</option>
                    {indianStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">City</label>
                  <select
                    value={city}
                    onChange={e => { setCity(e.target.value); setLocationStatus(null); }}
                    disabled={!stateCode}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Select City</option>
                    {citiesOfState.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <button
                  onClick={checkLocation}
                  disabled={!city || checkingLocation}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {checkingLocation ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search size={18} />
                  )}
                  {checkingLocation ? 'Checking...' : 'Find Pandits Near Me'}
                </button>
              </div>

              {/* Location Result */}
              {locationStatus === 'available' && (
                <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-green-800">Pandits available in {city}!</p>
                    <p className="text-sm text-green-700 mt-0.5">Great news! We have verified pandits in your city. You can proceed to book.</p>
                    <button
                      onClick={() => setStep(2)}
                      className="mt-3 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Proceed to Book →
                    </button>
                  </div>
                </div>
              )}

              {locationStatus === 'unavailable' && (
                <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-red-800">Sorry, not available in {city}</p>
                    <p className="text-sm text-red-700 mt-0.5">We don't have any pandits in your city right now. Please try a nearby major city or check back later.</p>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <button onClick={() => { setCity(''); setStateCode(''); setLocationStatus(null); }} className="px-4 py-2 bg-red-100 text-red-800 font-semibold rounded-lg hover:bg-red-200 transition-colors text-sm">Try Another City</button>
                      <button onClick={() => navigate('/pandits')} className="px-4 py-2 bg-white border border-red-200 text-red-700 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm">Browse All Pandits</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Choose Puja */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-sm text-orange-700 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2 w-fit">
              <MapPin size={14} /> Booking for: <strong>{city}, {stateName}</strong>
            </div>
            <div className="flex gap-2 flex-wrap mb-6">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedCategory === cat ? 'bg-orange-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-400'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(puja => {
                const Icon = puja.icon;
                const isSelected = selectedPuja?.id === puja.id;
                return (
                  <button key={puja.id} onClick={() => setSelectedPuja(puja)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md ${isSelected ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 bg-white hover:border-orange-300'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isSelected ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'}`}>
                      <Icon size={22} />
                    </div>
                    <h3 className="font-bold text-gray-800">{puja.name}</h3>
                    <p className="text-gray-500 text-xs mt-1 mb-3">{puja.desc}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1 text-gray-400"><Clock size={12} /> {puja.duration}</span>
                      <span className="font-bold text-orange-700">{puja.price}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">← Back</button>
              <button onClick={() => setStep(3)} disabled={!selectedPuja}
                className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Date & Time */}
        {step === 3 && (
          <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 p-4 bg-orange-50 rounded-xl">
              <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center">
                {React.createElement(selectedPuja.icon, { size: 20 })}
              </div>
              <div>
                <div className="font-bold text-gray-800">{selectedPuja.name}</div>
                <div className="text-sm text-orange-700">{selectedPuja.price} · {selectedPuja.duration} · {city}</div>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5"><Calendar size={14} className="inline mr-1" />Date</label>
                <input type="date" value={bookingData.date} onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5"><Clock size={14} className="inline mr-1" />Time Slot</label>
                <select value={bookingData.time} onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                  <option value="">Choose a time slot</option>
                  {['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '4:00 PM', '5:00 PM', '6:00 PM'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5"><MapPin size={14} className="inline mr-1" />Full Address</label>
                <textarea value={bookingData.address} onChange={e => setBookingData({ ...bookingData, address: e.target.value })}
                  rows={3} placeholder="House no., Street, Area..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">← Back</button>
              <button onClick={() => setStep(4)} disabled={!bookingData.date || !bookingData.time || !bookingData.address}
                className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 4: Details */}
        {step === 4 && (
          <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Your Contact Details</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                <input type="text" value={bookingData.name} onChange={e => setBookingData({ ...bookingData, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                <input type="tel" value={bookingData.phone} onChange={e => setBookingData({ ...bookingData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Special Instructions (Optional)</label>
                <textarea value={bookingData.notes} onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows={3} placeholder="Any specific requirements..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(3)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">← Back</button>
              <button onClick={() => setStep(5)} disabled={!bookingData.name || !bookingData.phone}
                className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Review →</button>
            </div>
          </div>
        )}

        {/* STEP 5: Confirm */}
        {step === 5 && (
          <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Confirm Your Booking</h2>
            <div className="space-y-1 mb-6">
              {[
                { label: 'Puja', value: selectedPuja?.name },
                { label: 'Location', value: `${city}, ${stateName}` },
                { label: 'Estimated Cost', value: selectedPuja?.price },
                { label: 'Duration', value: selectedPuja?.duration },
                { label: 'Date', value: bookingData.date },
                { label: 'Time', value: bookingData.time },
                { label: 'Address', value: bookingData.address },
                { label: 'Name', value: bookingData.name },
                { label: 'Phone', value: bookingData.phone },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-gray-500 text-sm">{row.label}</span>
                  <span className="text-gray-800 font-semibold text-sm text-right max-w-xs">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800 mb-6">
              A verified pandit from {city} will be assigned and will contact you 24 hours before the ceremony.
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(4)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">← Back</button>
              <button onClick={handleBook} className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors">Confirm Booking ✓</button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BookAPuja;
