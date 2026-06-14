import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import useT from '../hooks/useT';
import Footer from '../components/common/Footer';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import { 
  ArrowRight, CheckCircle, Users, Star, Shield, 
  Home as HomeIcon, BookOpen, Heart, Scissors, Flame, 
  Droplets, Calendar, Sparkles, MapPin, Zap, ChevronLeft, ChevronRight, Sun, Moon, Quote, X, MessageSquare
} from 'lucide-react';

// ─── Hindu Panchang helpers (no library needed) ───────────────────────────

const HINDI_MONTHS = [
  'चैत्र','वैशाख','ज्येष्ठ','आषाढ़','श्रावण','भाद्रपद',
  'आश्विन','कार्तिक','मार्गशीर्ष','पौष','माघ','फाल्गुन'
];
const ENGLISH_MONTHS = [
  'Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada',
  'Ashwin','Kartik','Margashirsha','Pausha','Magha','Phalguna'
];
const TITHIS = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima / Amavasya'
];
const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati'
];
const YOGAS = [
  'Vishkamba','Priti','Ayushman','Saubhagya','Shobhana','Atiganda',
  'Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva',
  'Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyan',
  'Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla',
  'Brahma','Indra','Vaidhriti'
];
const VARAS = ['Ravivar','Somvar','Mangalvar','Budhvar','Guruvar','Shukravar','Shanivar'];
const VARA_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Julian Day Number from Gregorian date
const julianDay = (y, m, d) => {
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr + Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
};

const getPanchang = (date) => {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  const jd = julianDay(y, m, d);
  // Vikram Samvat approx start JD = 1558466 (57.5 years ahead of CE)
  const VSepoch = 1558466;
  const daysSinceVS = jd - VSepoch;
  const samvatYear = Math.floor(daysSinceVS / 365.25) + 1;
  // Synodic month = 29.53059 days; JD of a known new moon (Jan 6 2000) = 2451549.5
  const knownNM = 2451549.5;
  const synodicMonth = 29.53059;
  const lunarAge = ((jd - knownNM) % synodicMonth + synodicMonth) % synodicMonth;
  const tithiIndex = Math.floor(lunarAge / (synodicMonth / 30));
  const tithiName = TITHIS[Math.min(tithiIndex, 14)];
  const isPurnima = tithiIndex === 14 && lunarAge > 14.5;
  const isAmavasya = tithiIndex === 14 && lunarAge < 14.5;
  const isEkadashi = tithiIndex === 10;
  // Nakshatra: sidereal moon longitude divided into 27 parts
  const nakshatraIndex = Math.floor(((jd - 2451545) * 13.176396) % 27 + 27) % 27;
  // Yoga: sum of sun+moon longitude / (360/27)
  const yogaIndex = Math.floor(((jd - 2451545) * 0.9856 * 2) % 27 + 27) % 27;
  // Hindu month: based on solar longitude into 12 Rashis
  const sunLong = (((jd - 2451545) * 0.9856) % 360 + 360) % 360;
  const hindMonthIdx = Math.floor(sunLong / 30);
  return {
    samvatYear,
    hindMonth: ENGLISH_MONTHS[hindMonthIdx],
    hindMonthHindi: HINDI_MONTHS[hindMonthIdx],
    tithi: isPurnima ? 'Purnima' : isAmavasya ? 'Amavasya' : tithiName,
    nakshatra: NAKSHATRAS[nakshatraIndex],
    yoga: YOGAS[yogaIndex],
    vara: VARAS[date.getDay()],
    varaEn: VARA_EN[date.getDay()],
    isAuspicious: isEkadashi || isPurnima,
    isSpecial: isAmavasya,
    lunarAge,
  };
};

// ─── Hindu Calendar Component ─────────────────────────────────────────────
const GREG_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const HinduCalendar = () => {
  const t = useT();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayPanchang = getPanchang(selected);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (d) => d === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear();

  return (
    <section id="panchang" className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 bg-surface relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-gold-light rounded-full blur-3xl opacity-40 -z-10" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-saffron-light rounded-full blur-3xl opacity-30 -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-saffron font-black text-sm uppercase tracking-widest mb-3 block">{t('panchang_label')}</span>
          <h2 className="text-4xl lg:text-5xl font-black text-maroon font-serif mb-4">
            {t('panchang_h2_line1')} <span className="text-saffron italic">{t('panchang_h2_ital')}</span>
          </h2>
          <p className="text-textMid max-w-xl mx-auto">
            {t('panchang_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ── Calendar Grid ── */}
          <div className="lg:col-span-3 bg-white rounded-[32px] border border-brandborder shadow-xl shadow-saffron-light/20 overflow-hidden">
            {/* Month nav */}
            <div style={{ background: 'linear-gradient(135deg, #7B1D0E 0%, #C45F06 100%)' }} className="p-6 flex items-center justify-between">
              <button onClick={prevMonth} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all">
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <p className="text-white font-black text-xl">{GREG_MONTHS[month]} {year}</p>
                <p className="text-white/70 text-sm font-medium mt-1">विक्रम संवत {getPanchang(new Date(year, month, 15)).samvatYear}</p>
              </div>
              <button onClick={nextMonth} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 bg-maroon-light border-b border-brandborder">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} className="py-3 text-center text-xs font-black text-maroon uppercase tracking-wider">{d}</div>
              ))}
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7 p-3 gap-1">
              {cells.map((d, i) => {
                if (!d) return <div key={i} />;
                const cellDate = new Date(year, month, d);
                const p = getPanchang(cellDate);
                const auspicious = p.isAuspicious;
                const special = p.isSpecial;
                const todayCell = isToday(d);
                const sel = isSelected(d);

                return (
                  <button
                    key={i}
                    onClick={() => setSelected(cellDate)}
                    className={`
                      relative flex flex-col items-center justify-start p-1.5 rounded-2xl transition-all duration-200 min-h-[60px]
                      ${sel ? 'bg-maroon text-white shadow-lg scale-105' :
                        todayCell ? 'bg-saffron text-white shadow-md' :
                        auspicious ? 'bg-gold-light hover:bg-yellow-100 border border-gold/30' :
                        special ? 'bg-purpleTheme-light hover:bg-purple-100 border border-purpleTheme/20' :
                        'hover:bg-saffron-light'}
                    `}
                  >
                    <span className={`text-sm font-black leading-none ${sel ? 'text-white' : todayCell ? 'text-white' : auspicious ? 'text-gold' : special ? 'text-purpleTheme' : 'text-maroon'}`}>
                      {d}
                    </span>
                    <span className={`text-[8px] font-bold mt-1 leading-tight text-center ${sel || todayCell ? 'text-white/80' : 'text-textMuted'}`} style={{ fontSize: '7px' }}>
                      {p.tithi.split(' ')[0].substring(0, 6)}
                    </span>
                    {auspicious && !sel && !todayCell && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold" />
                    )}
                    {special && !sel && !todayCell && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purpleTheme" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="px-5 pb-5 flex flex-wrap gap-4 text-xs font-bold text-textMid">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-saffron inline-block" /> {t('panchang_today')}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-maroon inline-block" /> {t('panchang_selected')}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gold inline-block" /> {t('panchang_auspicious')} (Ekadashi / Purnima)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purpleTheme inline-block" /> Amavasya</span>
            </div>
          </div>

          {/* ── Panchang Detail Panel ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Date title */}
            <div className="bg-white rounded-[28px] border border-brandborder p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                {todayPanchang.lunarAge < 15 ? <Sun size={22} className="text-saffron" /> : <Moon size={22} className="text-purpleTheme" />}
                <div>
                  <p className="font-black text-maroon text-lg leading-none">
                    {selected.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-textMuted text-sm mt-1">{todayPanchang.varaEn} · {todayPanchang.vara}</p>
                </div>
              </div>
              <div className="bg-saffron-light rounded-2xl px-4 py-3 text-center">
                <p className="text-xs font-black text-saffron-dark uppercase tracking-widest">Vikram Samvat</p>
                <p className="font-black text-maroon text-2xl font-serif">{todayPanchang.samvatYear}</p>
              </div>
            </div>

            {/* Panchang rows */}
            {[
              { label: t('panchang_tithi'), value: todayPanchang.tithi, icon: '🌙', color: 'bg-gold-light text-gold', special: todayPanchang.isAuspicious || todayPanchang.isSpecial },
              { label: t('panchang_month'), value: `${todayPanchang.hindMonth} (${todayPanchang.hindMonthHindi})`, icon: '📅', color: 'bg-saffron-light text-saffron' },
              { label: t('panchang_nakshatra'), value: todayPanchang.nakshatra, icon: '⭐', color: 'bg-purpleTheme-light text-purpleTheme' },
              { label: t('panchang_yoga'), value: todayPanchang.yoga, icon: '🕉️', color: 'bg-maroon-light text-maroon' },
              { label: t('panchang_vara'), value: `${todayPanchang.vara} (${todayPanchang.varaEn})`, icon: '☀️', color: 'bg-gold-light text-gold' },
            ].map(({ label, value, icon, color, special }) => (
              <div key={label} className={`bg-white rounded-[20px] border ${special ? 'border-gold shadow-lg shadow-gold/10' : 'border-brandborder'} p-4 flex items-center gap-4 shadow-sm`}>
                <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center text-lg flex-shrink-0`}>{icon}</div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-textMuted">{label}</p>
                  <p className="font-bold text-maroon text-sm mt-0.5">{value}</p>
                </div>
                {special && <span className="ml-auto text-xs font-black text-gold bg-gold-light px-2 py-1 rounded-full">{t('panchang_auspicious')}</span>}
              </div>
            ))}

            {/* CTA */}
            <Link to="/pujas" className="flex items-center justify-center gap-2 bg-maroon text-white font-black py-4 px-6 rounded-2xl hover:bg-saffron transition-all duration-300 shadow-lg shadow-maroon/20">
              <Calendar size={18} /> {t('panchang_book_date')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

// ─── Reviews Section ─────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
};

const APP_REVIEWS = [
  {
    _id: 'ar1',
    rating: 5,
    comment: 'Booking a Pandit was always a stressful task for our family, but this app made it incredibly easy. Within 5 minutes, we booked a verified Pandit for our Griha Pravesh. The real-time updates and transparent pricing are fantastic!',
    devotee: { firstName: 'Aditya', lastName: 'Singhal' },
    tag: 'Verified User',
    date: '3 days ago'
  },
  {
    _id: 'ar2',
    rating: 5,
    comment: 'I am amazed by the quality of service. The Pandit arrived on time, brought all the required Samagri, and conducted the puja beautifully. The built-in chat and secure payments give total peace of mind. Excellent app!',
    devotee: { firstName: 'Meenakshi', lastName: 'Patel' },
    tag: 'Verified Devotee',
    date: '1 week ago'
  },
  {
    _id: 'ar3',
    rating: 5,
    comment: 'Finally, a modern platform for our spiritual needs. The interface is clean, and the booking process is seamless. The Panchang feature is also very useful for finding auspicious dates. Highly recommended app for everyone!',
    devotee: { firstName: 'Vikram', lastName: 'Malhotra' },
    tag: 'Verified Devotee',
    date: '2 weeks ago'
  }
];

const ReviewsSection = () => {
  const { user, token } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get('/reviews/app');
      if (res.data && res.data.data) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please enter your feedback comment');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/reviews/app', { rating, comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Convert DB user reviews to display format
  const dbReviewsFormatted = reviews.map(r => ({
    _id: r._id,
    rating: r.rating,
    comment: r.comment,
    devotee: {
      firstName: r.user?.firstName || 'User',
      lastName: r.user?.lastName || ''
    },
    tag: r.user?.role === 'pandit' ? 'Verified Pandit' : 'Verified Devotee',
    date: 'Just now'
  }));

  // Merge so we show user reviews first, then fallback reviews
  const displayReviews = [...dbReviewsFormatted, ...APP_REVIEWS];
  const featuredReviews = displayReviews.slice(0, 3); // Display only top 3 on home page

  // Calculate stats for Flipkart / Play Store style breakdown
  const totalCount = displayReviews.length;
  const sumRatings = displayReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalCount > 0 ? (sumRatings / totalCount).toFixed(1) : '0.0';

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  displayReviews.forEach(r => {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
    starCounts[rounded] = (starCounts[rounded] || 0) + 1;
  });

  return (
    <section className="py-20 px-4 bg-surface overflow-hidden relative">
      <div className="absolute top-0 left-0 w-96 h-96 bg-saffron-light rounded-full blur-[120px] -z-10 opacity-40" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-light rounded-full blur-[120px] -z-10 opacity-30" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 relative">
          <span className="text-saffron font-black text-sm uppercase tracking-widest mb-3 block">App Experience</span>
          <h2 className="text-4xl lg:text-5xl font-black text-maroon leading-tight font-serif mb-4">
            What Devotees <span className="text-saffron italic">Say About Us</span>
          </h2>
          <p className="text-textMid max-w-xl mx-auto mb-6">Hear from families who booked their sacred pujas seamlessly using the PanditJi app.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <button
                onClick={() => { setShowModal(true); setError(''); }}
                className="bg-saffron hover:bg-saffron-dark text-white font-bold px-6 py-3 rounded-full shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm flex items-center gap-2"
              >
                <MessageSquare size={16} /> Write an App Review
              </button>
            ) : (
              <p className="text-xs text-textMuted bg-saffron-light/50 px-4 py-2 rounded-full border border-brandborder/50">
                Logged in users can share their app experience here!
              </p>
            )}

            <button
              onClick={() => setShowAllModal(true)}
              className="border-2 border-maroon text-maroon hover:bg-maroon hover:text-white font-bold px-6 py-2.5 rounded-full transition-all text-sm flex items-center gap-2"
            >
              See All Reviews ({totalCount})
            </button>
          </div>
        </div>

        {/* Featured Reviews Grid (Showing top 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-[28px] border border-brandborder p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:shadow-saffron-light/40 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Quote icon */}
              <div className="w-10 h-10 bg-saffron-light rounded-2xl flex items-center justify-center flex-shrink-0">
                <Quote size={18} className="text-saffron" />
              </div>

              {/* Comment */}
              <p className="text-textMid text-sm leading-relaxed flex-1 font-medium">
                "{review.comment}"
              </p>

              {/* Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    size={14}
                    fill={s <= review.rating ? '#E8710A' : 'none'}
                    color={s <= review.rating ? '#E8710A' : '#d1d5db'}
                  />
                ))}
                <span className="ml-1 text-xs font-bold text-saffron">{review.rating}.0</span>
              </div>

              {/* Divider */}
              <div className="border-t border-brandborder pt-4 flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-maroon text-white flex items-center justify-center font-bold text-base flex-shrink-0 overflow-hidden">
                  {review.devotee.firstName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-maroon text-sm truncate">
                    {review.devotee.firstName} {review.devotee.lastName}
                  </p>
                  <p className="text-textMuted text-xs">{review.date}</p>
                </div>
                {/* Tag */}
                <span className="text-[10px] bg-saffron-light text-saffron border border-brandborder px-2 py-1 rounded-full font-black flex-shrink-0">
                  {review.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write App Review Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.72)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 18, maxWidth: 440, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #7B1D0E 0%, #E8710A 100%)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.6px' }}>App Experience</div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 900, fontSize: 18 }}>
                  Write an App Review
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>
              {/* Stars Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6B4C3B' }}>Rate your experience with the platform</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star
                        size={32}
                        color="#E8710A"
                        fill={(hoverRating || rating) >= star ? '#E8710A' : 'none'}
                        strokeWidth={2}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6B4C3B' }}>Your Feedback</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tell us what you like about the app, speed of booking, interface..."
                  rows={4}
                  maxLength={500}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #EAD9CC', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              {error && (
                <p style={{ color: '#7B1D0E', fontSize: 12, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
                  {error}
                </p>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #EAD9CC', background: '#f5f0eb', color: '#6B4C3B', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7B1D0E, #E8710A)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flipkart / Play Store Style "See All Reviews" Modal */}
      {showAllModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.72)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 24, maxWidth: 880, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #7B1D0E 0%, #E8710A 100%)', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '1px' }}>Feedback Center</span>
                <h2 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 900, fontSize: 22, marginTop: 2 }}>
                  App Experience Reviews
                </h2>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Split Content */}
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', overflowY: 'auto', flex: 1, padding: 24, gap: 24 }}>
              {/* Left Side: Rating Breakdown */}
              <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 16, borderRight: '1px solid #F2DFD8', paddingRight: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#7B1D0E' }}>Overall Ratings</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, color: '#E8710A', lineHeight: 1 }}>{averageRating}</span>
                  <span style={{ fontSize: 14, color: '#6B4C3B', fontWeight: 700 }}>out of 5</span>
                </div>

                {/* Stars row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={20}
                      fill={s <= Math.round(Number(averageRating)) ? '#E8710A' : 'none'}
                      color={s <= Math.round(Number(averageRating)) ? '#E8710A' : '#d1d5db'}
                    />
                  ))}
                  <span style={{ fontSize: 12, color: '#6B4C3B', marginLeft: 4, fontWeight: 700 }}>({totalCount} reviews)</span>
                </div>

                {/* Rating bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = starCounts[stars] || 0;
                    const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                    return (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#6B4C3B', width: 12 }}>{stars}</span>
                        <Star size={12} fill="#E8710A" color="#E8710A" />
                        <div style={{ flex: 1, height: 8, background: '#F9F4F0', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #E8710A, #7B1D0E)', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#6B4C3B', width: 24, textAlign: 'right', fontWeight: 600 }}>{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Scrollable List of All Reviews */}
              <div style={{ flex: '2 2 400px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 420, overflowY: 'auto', paddingRight: 8 }}>
                {displayReviews.map((review) => (
                  <div
                    key={review._id}
                    style={{ background: '#FAF6F2', border: '1px solid #F2DFD8', borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    {/* Header: Name, Stars, Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#7B1D0E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                          {review.devotee.firstName.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, color: '#7B1D0E', fontSize: 13, margin: 0 }}>
                            {review.devotee.firstName} {review.devotee.lastName}
                          </p>
                          <p style={{ fontSize: 11, color: '#6B4C3B', margin: 0, opacity: 0.8 }}>{review.date}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, background: '#FFF0E5', color: '#E8710A', border: '1px solid #FFD9C2', padding: '3px 8px', borderRadius: 12, fontWeight: 900 }}>
                        {review.tag}
                      </span>
                    </div>

                    {/* Stars */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          size={12}
                          fill={s <= review.rating ? '#E8710A' : 'none'}
                          color={s <= review.rating ? '#E8710A' : '#d1d5db'}
                        />
                      ))}
                    </div>

                    {/* Comment */}
                    <p style={{ fontSize: 13, color: '#6B4C3B', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────


const STATS = [
  { label: 'Verified Pandits', value: '500+' },
  { label: 'Pujas Completed', value: '12,000+' },
  { label: 'Cities Covered', value: '80+' },
  { label: 'Happy Devotees', value: '10,000+' },
];

const colorClasses = {
  saffron: 'bg-saffron-light text-saffron border-brandborder hover:bg-[#FDE8D5]',
  purpleTheme: 'bg-purpleTheme-light text-purpleTheme border-brandborder hover:bg-[#EAE1FF]',
  maroon: 'bg-maroon-light text-maroon border-brandborder hover:bg-[#F2DFD8]',
  gold: 'bg-gold-light text-gold border-brandborder hover:bg-[#FFF0CC]',
};

const Home = () => {
  const t = useT();

  const PUJA_TYPES = [
    { name: t('puja_griha'),   icon: HomeIcon,  color: 'saffron',      desc: t('puja_griha_desc') },
    { name: t('puja_satya'),   icon: BookOpen,  color: 'purpleTheme',  desc: t('puja_satya_desc') },
    { name: t('puja_vivah'),   icon: Heart,     color: 'maroon',       desc: t('puja_vivah_desc') },
    { name: t('puja_mundan'),  icon: Scissors,  color: 'gold',         desc: t('puja_mundan_desc') },
    { name: t('puja_havan'),   icon: Flame,     color: 'maroon',       desc: t('puja_havan_desc') },
    { name: t('puja_rudra'),   icon: Droplets,  color: 'purpleTheme',  desc: t('puja_rudra_desc') },
    { name: t('puja_ganesh'),  icon: Sparkles,  color: 'gold',         desc: t('puja_ganesh_desc') },
    { name: t('puja_lakshmi'), icon: Zap,       color: 'saffron',      desc: t('puja_lakshmi_desc') },
  ];

  const FEATURES = [
    { icon: Shield, title: t('feat1_title'), desc: t('feat1_desc') },
    { icon: Star,   title: t('feat2_title'), desc: t('feat2_desc') },
    { icon: Users,  title: t('feat3_title'), desc: t('feat3_desc') },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-surface min-h-[100dvh] flex flex-col justify-center py-12 px-4">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 -right-20 w-96 h-96 bg-saffron-light rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 -left-20 w-96 h-96 bg-gold-light rounded-full blur-3xl -z-10 opacity-70" />
        
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-saffron-light text-saffron-dark text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8 border border-brandborder shadow-sm">
            <Sparkles size={14} className="animate-pulse" />
            {t('home_badge')}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-[84px] font-black text-maroon leading-[0.95] tracking-[-0.04em] mb-8 font-serif">
            {t('home_h1_line1')}<br />
            <span className="text-saffron relative inline-block">
              {t('home_h1_line2')}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 358 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9C118.957 4.46351 239.428 3.24351 355 9" stroke="#E8710A" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-textMid mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            {t('home_hero_desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/pujas"
              className="group relative flex items-center gap-2 bg-saffron hover:bg-saffron-dark text-white text-base font-black py-3.5 px-8 sm:py-5 sm:px-10 rounded-2xl transition-all shadow-lg hover:-translate-y-1 active:translate-y-0"
            >
              {t('home_cta_book')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register?role=pandit"
              className="flex items-center gap-2 bg-white text-maroon text-base font-bold py-3.5 px-8 sm:py-5 sm:px-10 rounded-2xl border border-brandborder hover:border-saffron hover:text-saffron transition-all shadow-sm"
            >
              {t('home_cta_join')}
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-textMuted">
            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle size={16} className="text-[#1E7D3C]" /> {t('home_trust_verified')}
            </div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle size={16} className="text-[#1E7D3C]" /> {t('home_trust_payments')}
            </div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle size={16} className="text-[#1E7D3C]" /> {t('home_trust_vedic')}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-12 px-4 -mt-12 md:-mt-20 relative z-10">
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-brandborder shadow-xl shadow-saffron-light/50 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
          <div>
            <p className="text-4xl font-black text-maroon mb-1 font-serif">500+</p>
            <p className="text-xs font-black text-textMuted uppercase tracking-widest">{t('stat_pandits')}</p>
          </div>
          <div>
            <p className="text-4xl font-black text-maroon mb-1 font-serif">12k+</p>
            <p className="text-xs font-black text-textMuted uppercase tracking-widest">{t('stat_pujas')}</p>
          </div>
          <div>
            <p className="text-4xl font-black text-maroon mb-1 font-serif">80+</p>
            <p className="text-xs font-black text-textMuted uppercase tracking-widest">{t('stat_cities')}</p>
          </div>
          <div>
            <p className="text-4xl font-black text-maroon mb-1 font-serif">10k+</p>
            <p className="text-xs font-black text-textMuted uppercase tracking-widest">{t('stat_clients')}</p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 bg-white relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-saffron-light rounded-full blur-3xl" />
            <span className="text-saffron font-black text-sm uppercase tracking-widest mb-4 block">{t('about_label')}</span>
            <h2 className="text-4xl lg:text-5xl font-black text-maroon mb-8 leading-tight font-serif">{t('about_h2')}</h2>
            <div className="space-y-6 text-textMid text-lg leading-relaxed">
              <p>{t('about_p1')}</p>
              <p>{t('about_p2')}</p>
            </div>
            
            <div className="mt-10 p-6 bg-surface rounded-[28px] border border-brandborder flex items-center gap-5">
              <div className="w-14 h-14 bg-saffron text-white rounded-2xl flex items-center justify-center shadow-lg shadow-saffron-light">
                <MapPin size={28} />
              </div>
              <div>
                <p className="font-black text-maroon leading-none mb-1">{t('about_pan_india')}</p>
                <p className="text-sm text-textMid">{t('about_cities')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gradient-to-br from-gold-light to-white p-4 sm:p-6 md:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] text-center border border-brandborder">
               <p className="text-[10px] sm:text-xs font-black text-gold uppercase tracking-widest mb-2">Verified</p>
               <p className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-black text-maroon mb-1 font-serif">500+</p>
               <p className="font-bold text-textMid text-xs sm:text-sm">Pandits</p>
             </div>
             <div className="bg-gradient-to-br from-saffron-light to-white p-4 sm:p-6 md:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] text-center border border-brandborder">
               <p className="text-[10px] sm:text-xs font-black text-saffron uppercase tracking-widest mb-2">Success</p>
               <p className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-black text-maroon mb-1 font-serif">12k+</p>
               <p className="font-bold text-textMid text-xs sm:text-sm">Sacred Pujas</p>
             </div>
             <div className="bg-gradient-to-br from-maroon-light to-white p-4 sm:p-6 md:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] text-center border border-brandborder">
               <p className="text-[10px] sm:text-xs font-black text-maroon uppercase tracking-widest mb-2">Coverage</p>
               <p className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-black text-maroon mb-1 font-serif">80+</p>
               <p className="font-bold text-textMid text-xs sm:text-sm">Cities</p>
             </div>
             <div className="bg-gradient-to-br from-purpleTheme-light to-white p-4 sm:p-6 md:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] text-center border border-brandborder">
               <p className="text-[10px] sm:text-xs font-black text-purpleTheme uppercase tracking-widest mb-2">Rating</p>
               <p className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-black text-maroon mb-1 font-serif">4.9/5</p>
               <p className="font-bold text-textMid text-xs sm:text-sm">Happy Users</p>
             </div>
          </div>
        </div>
      </section>

      {/* Hindu Panchang Calendar */}
      <HinduCalendar />

      {/* Puja Categories Section */}
      <section className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 bg-surface overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-saffron-light rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 opacity-60" />
        
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-saffron font-black text-sm uppercase tracking-widest mb-3 block">{t('puja_section_label')}</span>
              <h2 className="text-4xl lg:text-5xl font-black text-maroon leading-tight font-serif">{t('puja_section_h2_line1')}<br />{t('puja_section_h2_line2')}</h2>
            </div>
            <Link to="/pujas" className="flex items-center gap-2 text-saffron font-black hover:gap-3 transition-all underline decoration-2 underline-offset-8">
              {t('puja_explore')} <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PUJA_TYPES.map(({ name, icon: Icon, color, desc }) => (
              <div key={name} className={`group bg-white p-8 rounded-[32px] border border-brandborder shadow-sm hover:shadow-xl hover:shadow-saffron-light transition-all duration-500 hover:-translate-y-2`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${colorClasses[color]}`}>
                  <Icon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black text-maroon mb-3 font-serif">{name}</h3>
                <p className="text-textMid text-sm leading-relaxed mb-6 font-medium">{desc}</p>
                <Link to="/pujas" className="inline-flex items-center gap-1 text-xs font-black text-maroon group-hover:text-saffron transition-colors uppercase tracking-widest">
                  {t('puja_learn_more')} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-maroon font-serif">{t('feat_h2')}</h2>
            <p className="text-textMid mt-3 max-w-xl mx-auto">{t('feat_desc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-surface rounded-[24px] p-8 border border-brandborder shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-saffron-light text-saffron rounded-2xl flex items-center justify-center mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-maroon mb-2">{title}</h3>
                <p className="text-textMid text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ReviewsSection />

      {/* CTA Banner */}
      <section className="flex flex-col items-center justify-center py-20 md:py-28 px-4 bg-maroon text-white text-center border-b-[8px] border-saffron">
        <h2 className="text-3xl md:text-4xl font-black mb-4 font-serif">{t('cta_h2')}</h2>
        <p className="text-maroon-light mb-8 max-w-xl mx-auto text-base md:text-lg">{t('cta_desc')}</p>
        <Link to="/pujas" className="inline-flex items-center gap-2 bg-saffron text-white font-bold py-3.5 px-8 rounded-xl hover:bg-saffron-dark transition-colors shadow-lg shadow-saffron/20 w-fit">
          {t('cta_btn')} <ArrowRight size={18} />
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
