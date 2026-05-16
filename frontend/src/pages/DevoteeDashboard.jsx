import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import axios from 'axios';
import { io } from 'socket.io-client';
import { LogOut, MessageSquare, Search, Star, MapPin, AlertCircle, CheckCircle, BadgeCheck, Clock, Navigation, X, Calendar, Headphones, Video } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import SupportCare from '../components/SupportCare';

/* ─── Razorpay loader (unchanged) ─── */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/* ─── Puja prices (unchanged) ─── */
const PUJA_PRICES = {
  'Rudrabhishek': 3100,
  'Sunderkand Path': 3500,
  'Griha Pravesh': 5100,
  'Vivah Ceremony': 11000,
  'Satyanarayan Katha': 2100,
  'Mundan Ceremony': 2100,
  'Navratri Puja': 3100,
  'Durga Puja': 5100,
  'Havan & Yagya': 3100,
  'Naamkaran': 2100,
  'Ganesh Puja': 2100,
  'Lakshmi Puja': 2100,
  'Surya Puja': 2100,
  'Kaal Sarp Dosh': 5500,
  'Vastu Shanti': 6100,
  'Maha Mrityunjaya': 3100,
  'Annaprashan': 1500,
  'Navagraha Puja': 3500,
  'Lakshmi Narayan': 2500,
  'Janmashtami Puja': 3100,
  'Other': 1500,
};

/* ─── Design tokens inspired by 99pandit.com ─── */
const C = {
  saffron: '#E8710A',   // main brand — 99pandit's CTA orange
  saffronDk: '#C45F06',
  saffronLt: '#FFF3E8',
  maroon: '#7B1D0E',   // 99pandit's heading color
  maroonLt: '#F9EDE8',
  gold: '#C8960C',   // Om symbol accent
  goldLt: '#FFF8E1',
  purple: '#5B2D8E',   // 99pandit top nav purple
  purpleLt: '#F3EEFF',
  white: '#FFFFFF',
  surface: '#FAF7F2',   // warm off-white page bg
  card: '#FFFFFF',
  border: '#EAD9CC',
  text: '#2C1A0E',
  textMid: '#6B4C3B',
  textMuted: '#A07060',
  success: '#1E7D3C',
  successLt: '#E8F5EE',
  red: '#C0392B',
  redLt: '#FDECEC',
};

/* ─── Shared UI Helpers ─── */
const SectionTitle = ({ children }) => (
  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.maroon, marginBottom: 16, borderBottom: `2px solid ${C.border}`, paddingBottom: 8 }}>{children}</h2>
);
const lbl = { display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 6 };
const inp = { width: '100%', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', background: C.surface, fontFamily: "'Poppins',sans-serif", color: C.text };
const sel = { ...inp, cursor: 'pointer' };

/* ─── Global styles ─── */
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dd-root { font-family: 'Poppins', sans-serif; background: ${C.surface}; height: 100vh; display: flex; overflow: hidden; position: relative; }

  /* Sidebar */
  .dd-sidebar { width: 236px; background: ${C.white}; border-right: 1px solid ${C.border}; display: flex; flex-direction: column; flex-shrink: 0; }
  .dd-sidebar-top { background: linear-gradient(160deg, ${C.maroon} 0%, ${C.purple} 100%); padding: 0 0 20px; }
  .dd-brand { display: flex; align-items: center; gap: 10px; padding: 18px 20px 14px; border-bottom: 1px solid rgba(255,255,255,0.12); margin-bottom: 16px; }
  .dd-brand-om { font-size: 26px; line-height: 1; }
  .dd-brand-name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 900; color: #fff; letter-spacing: 0.3px; line-height: 1.1; }
  .dd-brand-sub { font-size: 9px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-top: 2px; }

  .dd-profile-area { text-align: center; padding: 0 20px; }
  .dd-avatar-wrap { position: relative; display: inline-block; margin-bottom: 10px; }
  .dd-avatar-img { width: 62px; height: 62px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.4); }
  .dd-avatar-initials { width: 62px; height: 62px; border-radius: 50%; background: rgba(255,255,255,0.18); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; border: 3px solid rgba(255,255,255,0.3); }
  .dd-cam-btn { position: absolute; bottom: 0; right: 0; width: 22px; height: 22px; border-radius: 50%; background: ${C.saffron}; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .dd-user-name { font-weight: 700; font-size: 14px; color: #fff; }
  .dd-user-city { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 4px; }

  /* Nav */
  .dd-nav { flex: 1; padding: 8px 12px; }
  .dd-nav-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 14px; border-radius: 10px; font-size: 13.5px; font-weight: 500; color: ${C.textMid}; background: transparent; border: none; cursor: pointer; text-align: left; transition: all 0.15s; margin-bottom: 2px; }
  .dd-nav-item:hover { background: ${C.saffronLt}; color: ${C.saffron}; }
  .dd-nav-item.active { background: ${C.saffronLt}; color: ${C.saffron}; font-weight: 700; border-left: 3px solid ${C.saffron}; }
  .dd-nav-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: ${C.maroonLt}; flex-shrink: 0; }
  .dd-nav-item.active .dd-nav-icon { background: ${C.saffron}; color: #fff !important; }
  .dd-nav-item:hover .dd-nav-icon { background: ${C.saffron}; color: #fff !important; }

  .dd-logout { padding: 12px 16px; border-top: 1px solid ${C.border}; }
  .dd-logout-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; color: ${C.textMuted}; background: transparent; border: none; cursor: pointer; transition: all 0.15s; }
  .dd-logout-btn:hover { background: ${C.redLt}; color: ${C.red}; }

  /* Topbar */
  .dd-topbar { height: 58px; background: ${C.white}; border-bottom: 1px solid ${C.border}; display: flex; align-items: center; padding: 0 28px; justify-content: space-between; flex-shrink: 0; }
  .dd-topbar-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: ${C.maroon}; display: flex; align-items: center; gap: 8px; }
  .dd-topbar-title::before { content: '🕉'; font-size: 18px; }
  .dd-loc-btn { display: flex; align-items: center; gap: 7px; background: ${C.saffron}; color: #fff; font-size: 13px; font-weight: 700; padding: 8px 18px; border-radius: 24px; border: none; cursor: pointer; transition: background 0.15s; font-family: 'Poppins', sans-serif; }
  .dd-loc-btn:hover { background: ${C.saffronDk}; }
  .dd-loc-btn:disabled { opacity: 0.6; }

  /* Cards */
  .dd-pandit-card { background: ${C.white}; border-radius: 14px; padding: 22px; border: 1px solid ${C.border}; box-shadow: 0 2px 8px rgba(123,29,14,0.06); transition: all 0.2s; position: relative; overflow: hidden; }
  .dd-pandit-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${C.saffron}, ${C.gold}); }
  .dd-pandit-card:hover { box-shadow: 0 8px 24px rgba(123,29,14,0.12); transform: translateY(-2px); }

  .dd-booking-card { background: ${C.white}; border-radius: 12px; border: 1px solid ${C.border}; box-shadow: 0 1px 4px rgba(123,29,14,0.06); transition: box-shadow 0.2s; overflow: hidden; }
  .dd-booking-card:hover { box-shadow: 0 4px 16px rgba(123,29,14,0.10); }

  /* Status badges */
  .dd-badge { display: inline-block; border-radius: 4px; font-size: 10px; font-weight: 800; padding: 3px 10px; text-transform: uppercase; letter-spacing: 0.8px; }
  .dd-badge-pending   { background: #FFF3CD; color: #856404; }
  .dd-badge-confirmed { background: ${C.successLt}; color: ${C.success}; }
  .dd-badge-completed { background: ${C.purpleLt}; color: ${C.purple}; }
  .dd-badge-rejected  { background: ${C.redLt}; color: ${C.red}; }

  /* Buttons */
  .dd-btn { display: inline-flex; align-items: center; gap: 6px; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 13px; border: none; cursor: pointer; border-radius: 8px; padding: 9px 18px; transition: all 0.15s; letter-spacing: 0.2px; }
  .dd-btn:active { transform: scale(0.97); }
  .dd-btn-primary { background: ${C.saffron}; color: #fff; box-shadow: 0 3px 10px rgba(232,113,10,0.30); }
  .dd-btn-primary:hover { background: ${C.saffronDk}; }
  .dd-btn-ghost { background: ${C.saffronLt}; color: ${C.saffron}; border: 1.5px solid ${C.saffron}; }
  .dd-btn-ghost:hover { background: #ffe3cc; }
  .dd-btn-success { background: ${C.success}; color: #fff; }
  .dd-btn-danger  { background: ${C.red}; color: #fff; }
  .dd-btn-maroon  { background: ${C.maroon}; color: #fff; }
  .dd-btn-maroon:hover { background: #5c1208; }

  /* Om pill tags for pujas */
  .dd-puja-pill { display: inline-flex; align-items: center; gap: 5px; background: ${C.goldLt}; border: 1px solid #E6C87A; color: ${C.maroon}; font-size: 12px; font-weight: 600; padding: 5px 14px; border-radius: 24px; cursor: pointer; transition: all 0.15s; }
  .dd-puja-pill:hover { background: ${C.gold}; color: #fff; border-color: ${C.gold}; }

  /* Stat strip */
  .dd-stat { background: ${C.white}; border-radius: 12px; border: 1px solid ${C.border}; padding: 16px 18px; display: flex; align-items: center; gap: 14px; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${C.surface}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

  .spin { animation: ddSpin 0.8s linear infinite; }
  @keyframes ddSpin { to { transform: rotate(360deg); } }

  .pulse { animation: ddPulse 1.6s ease-in-out infinite; }
  @keyframes ddPulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
`;

/* ─── Reusable nav item ─── */
const NavItem = ({ icon, label, tab, activeTab, setActiveTab }) => (
  <button className={`dd-nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
    <span className="dd-nav-icon" style={{ color: activeTab === tab ? '#fff' : C.saffron }}>{icon}</span>
    {label}
  </button>
);

/* ─── Status badge ─── */
const StatusBadge = ({ status }) => (
  <span className={`dd-badge dd-badge-${status}`}>{status}</span>
);

const DevoteeDashboard = () => {
  const { user, token, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [pandits, setPandits] = useState([]);
  const [isLocal, setIsLocal] = useState(true);
  const [locationMessage, setLocationMessage] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waitingBooking, setWaitingBooking] = useState(null);
  const [acceptedBooking, setAcceptedBooking] = useState(null);
  const [bookingModal, setBookingModal] = useState({ isOpen: false, pandit: null });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const intentCity = searchParams.get('city');
  const intentPuja = searchParams.get('puja');
  const intentMode = searchParams.get('mode');

  const [bookingForm, setBookingForm] = useState({
    pujaType: intentPuja || 'Satyanarayan Katha',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    address: '',
    notes: '',
    pujaMode: intentMode || 'in-person',
  });
  const socketRef = useRef(null);

  /* ─── All logic below is UNCHANGED ─── */
  const fetchPandits = async (lat = null, lng = null) => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/pandits';
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}`;
      } else if (intentCity) {
        url += `?city=${encodeURIComponent(intentCity)}`;
      } else if (user?.city) {
        url += `?city=${encodeURIComponent(user.city)}`;
      }
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setPandits(res.data.data);
      setIsLocal(res.data.isLocal ?? true);
      setLocationMessage(res.data.message || '');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLocationRequest = () => {
    if (!navigator.geolocation) { alert('Geolocation is not supported by your browser'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchPandits(pos.coords.latitude, pos.coords.longitude),
      () => { alert('Unable to retrieve your location. Searching by city instead.'); fetchPandits(); }
    );
  };

  const fetchConversations = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chat/conversations/list', { headers: { Authorization: `Bearer ${token}` } });
      setConversations(res.data.data);
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchMyBookings = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
      const fetchedBookings = res.data.data;
      setBookings(fetchedBookings);
      const accepted = fetchedBookings.find(b => b.status === 'confirmed' && b.paymentStatus === 'pending');
      const pending = fetchedBookings.find(b => b.status === 'pending');
      if (accepted) setAcceptedBooking(accepted);
      else if (pending) setWaitingBooking(pending);
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchMyPayments = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/payments', { headers: { Authorization: `Bearer ${token}` } });
      setPayments(res.data.data);
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => {
    if (!token || user?.role !== 'devotee') { navigate('/'); return; }
    
    fetchPandits();
    fetchConversations();
    fetchMyBookings();
    fetchMyPayments();

    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('join', { userId: user._id || user.id, role: 'devotee', city: user.city });
    });
    
    socket.on('bookingAccepted', (booking) => {
      setAcceptedBooking(booking);
      setWaitingBooking(null);
      // Update local state to avoid refresh
      setBookings(prev => {
        const exists = prev.find(b => b._id === booking._id);
        if (exists) return prev.map(b => b._id === booking._id ? booking : b);
        return [booking, ...prev];
      });
      setSelectedChatUser(booking.pandit);
      setActiveTab('chat');
    });

    socket.on('bookingLinkUpdated', ({ bookingId, videoLink }) => {
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, videoLink } : b));
    });

    return () => socket.disconnect();
  }, [token, user, navigate, fetchConversations, fetchMyBookings, fetchMyPayments]);

  const handleLogout = () => { logout(); navigate('/'); };
  const startChat = (pandit) => { setSelectedChatUser(pandit); setActiveTab('chat'); };
  const handleOpenBookingModal = (panditId) => {
    const pandit = pandits.find(p => p._id === panditId);
    setBookingModal({ isOpen: true, pandit });
    setBookingForm(prev => ({ ...prev, address: user?.city || '' }));
  };
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const { pandit } = bookingModal;
      const { pujaType, date, time, address, notes } = bookingForm;
      const res = await axios.post('http://localhost:5000/api/bookings', {
        panditId: pandit._id, pujaType, date, time, address, city: user?.city, notes,
        pujaMode: bookingForm.pujaMode,
        fee: bookingForm.pujaMode === 'online' ? (PUJA_PRICES[pujaType] || 1500) * 0.7 : (PUJA_PRICES[pujaType] || 1500),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setBookingModal({ isOpen: false, pandit: null });
      setWaitingBooking(res.data.data);
    } catch { alert('Failed to send booking request. Please try again.'); }
  };
  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to remove this booking from your history?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(bookings.filter(b => b._id !== bookingId));
    } catch { alert('Failed to delete booking'); }
  };
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
      updateUser({ avatar: res.data.avatarUrl });
    } catch { alert('Failed to upload profile picture'); }
  };
  const handlePayment = async (booking) => {
    const res = await loadRazorpayScript();
    if (!res) { alert('Razorpay SDK failed to load. Are you online?'); return; }
    try {
      setLoading(true);
      const { data } = await axios.post('http://localhost:5000/api/payments/create-order', { bookingId: booking._id }, { headers: { Authorization: `Bearer ${token}` } });
      if (!data.success) { alert('Failed to initiate payment.'); setLoading(false); return; }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
        amount: data.amount,
        currency: 'INR',
        name: 'PanditJi',
        description: `Payment for ${booking.pujaType}`,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post('http://localhost:5000/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (verifyRes.data.success) {
              alert('Payment Successful! You can now chat with the Pandit.');
              setAcceptedBooking(null);
              fetchMyBookings();
              fetchMyPayments();
              fetchConversations();
              setSelectedChatUser(booking.pandit);
              setActiveTab('chat');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email || ''
        },
        theme: { color: C.saffron }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => alert('Payment failed. ' + r.error.description));
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing payment');
    } finally {
      setLoading(false);
    }
  };

  const feeForForm = bookingForm.pujaMode === 'online'
    ? Math.round((PUJA_PRICES[bookingForm.pujaType] || 1500) * 0.7)
    : (PUJA_PRICES[bookingForm.pujaType] || 1500);

  /* ─── RENDER ─── */
  return (
    <>
      <style>{G}</style>
      <div className="dd-root">

        {/* ════════════ WAITING OVERLAY ════════════ */}
        {waitingBooking && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, maxWidth: 360, width: '100%', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
              <div style={{ background: `linear-gradient(135deg, ${C.maroon}, ${C.purple})`, padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🕉</div>
                <div style={{ width: 40, height: 40, border: '4px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', margin: '0 auto 14px' }} className="spin" />
                <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>Finding a Pandit...</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>Sending your puja request</p>
              </div>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: C.textMid, marginBottom: 4 }}>Puja: <strong style={{ color: C.maroon }}>{waitingBooking.pujaType}</strong></div>
                <div style={{ fontSize: 14, color: C.textMid, marginBottom: 16 }}>Location: <strong style={{ color: C.maroon }}>{waitingBooking.city}</strong></div>
                <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Waiting for pandit acceptance. This may take a moment...</p>
                <button className="dd-btn" onClick={() => setWaitingBooking(null)}
                  style={{ width: '100%', justifyContent: 'center', background: '#f5f0eb', color: C.textMid }}>
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ PANDIT ACCEPTED TOAST ════════════ */}
        {acceptedBooking && (
          <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200, background: '#fff', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.18)', border: `1.5px solid ${C.success}`, maxWidth: 340, overflow: 'hidden' }}>
            <div style={{ background: C.success, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={20} color="#fff" />
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>Pandit Confirmed! 🎉</span>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: C.textMid, marginBottom: 8 }}>
                <strong style={{ color: C.maroon }}>Pt. {acceptedBooking.pandit?.firstName} {acceptedBooking.pandit?.lastName}</strong> has accepted your {acceptedBooking.pujaType} booking.
              </p>
              <div style={{ background: '#FFF9E0', border: '1px solid #E6C87A', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: C.gold, fontWeight: 600, marginBottom: 12 }}>
                🔒 Complete payment to unlock chat with your Pandit
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="dd-btn dd-btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}
                  onClick={() => handlePayment(acceptedBooking)} disabled={loading}>
                  {loading ? 'Processing...' : `Pay ₹${acceptedBooking.fee?.toLocaleString() || '1,500'}`}
                </button>
                <button className="dd-btn" style={{ background: '#f5f0eb', color: C.textMid, fontSize: 12 }}
                  onClick={() => { alert('Chat disabled until payment is complete.'); setAcceptedBooking(null); }}>
                  Later
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ════════════ BOOKING MODAL ════════════ */}
        {bookingModal.isOpen && bookingModal.pandit && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.72)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 18, maxWidth: 480, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>

              {/* Modal header */}
              <div style={{ background: `linear-gradient(135deg, ${C.maroon} 0%, ${C.purple} 100%)`, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>Booking with</div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 900, fontSize: 20 }}>
                    🕉 Pt. {bookingModal.pandit.firstName} {bookingModal.pandit.lastName}
                  </h2>
                </div>
                <button onClick={() => setBookingModal({ isOpen: false, pandit: null })}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBookSubmit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Puja selector */}
                <div>
                  <label style={lbl}>Select Puja Type</label>
                  <select required value={bookingForm.pujaType}
                    onChange={e => setBookingForm({ ...bookingForm, pujaType: e.target.value })}
                    style={sel}>
                    {Object.keys(PUJA_PRICES).map(p => (
                      <option key={p} value={p}>{p} — ₹{PUJA_PRICES[p].toLocaleString()}</option>
                    ))}
                  </select>
                </div>

                {/* Mode toggle */}
                <div style={{ background: C.saffronLt, borderRadius: 10, padding: 4, display: 'flex', border: `1px solid ${C.border}` }}>
                  {['in-person', 'online'].map(mode => (
                    <button key={mode} type="button"
                      onClick={() => setBookingForm({ ...bookingForm, pujaMode: mode })}
                      style={{
                        flex: 1, padding: '9px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, transition: 'all 0.15s',
                        background: bookingForm.pujaMode === mode ? C.saffron : 'transparent',
                        color: bookingForm.pujaMode === mode ? '#fff' : C.textMid
                      }}>
                      {mode === 'in-person' ? '🏠 In-Person' : '💻 Online'}
                      {mode === 'online' && <span style={{ fontSize: 10, marginLeft: 6, background: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: 10 }}>-30%</span>}
                    </button>
                  ))}
                </div>

                {/* Date & time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={lbl}>📅 Date</label>
                    <input type="date" required value={bookingForm.date}
                      onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>⏰ Time</label>
                    <input type="time" required value={bookingForm.time}
                      onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })} style={inp} />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label style={lbl}>📍 Full Address</label>
                  <input type="text" required value={bookingForm.address}
                    onChange={e => setBookingForm({ ...bookingForm, address: e.target.value })}
                    placeholder="Enter your complete address" style={inp} />
                </div>

                {/* Notes */}
                <div>
                  <label style={lbl}>📝 Special Requirements (Optional)</label>
                  <textarea rows={2} value={bookingForm.notes}
                    onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="Any specific instructions for the pandit..."
                    style={{ ...inp, resize: 'none', lineHeight: 1.5 }} />
                </div>

                {/* Fee display */}
                <div style={{ background: C.goldLt, border: `1px solid #E6C87A`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Booking Fee</div>
                    {bookingForm.pujaMode === 'online' && (
                      <div style={{ fontSize: 12, color: C.textMuted, textDecoration: 'line-through' }}>₹{(PUJA_PRICES[bookingForm.pujaType] || 1500).toLocaleString()}</div>
                    )}
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: C.maroon }}>
                    ₹{feeForForm.toLocaleString()}
                  </div>
                </div>

                <button type="submit" className="dd-btn dd-btn-maroon"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px', borderRadius: 10 }}>
                  🕉 Confirm Booking
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ════════════ SIDEBAR ════════════ */}
        <div className="dd-sidebar">
          <div className="dd-sidebar-top">
            {/* Brand */}
            <div className="dd-brand">
              <span className="dd-brand-om">🕉</span>
              <div>
                <div className="dd-brand-name">PanditJi</div>
                <div className="dd-brand-sub">Sacred Services</div>
              </div>
            </div>

            {/* Profile */}
            <div className="dd-profile-area">
              <div className="dd-avatar-wrap">
                {user?.avatar
                  ? <img src={user.avatar} alt="Profile" className="dd-avatar-img" />
                  : <div className="dd-avatar-initials">{user?.firstName?.charAt(0)}</div>}
                <button className="dd-cam-btn" onClick={() => document.getElementById('dd-avatar-upload').click()}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </button>
                <input type="file" id="dd-avatar-upload" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
              </div>
              <div className="dd-user-name">{user?.firstName} {user?.lastName}</div>
              {user?.city && (
                <div className="dd-user-city">
                  <MapPin size={11} /> {user.city}
                </div>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav className="dd-nav">
            <NavItem icon={<Search size={16} />} label="Find Pandit" tab="discover" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem icon={<Calendar size={16} />} label="My Bookings" tab="bookings" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem icon={<MessageSquare size={16} />} label="Messages" tab="chat" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem icon={<CheckCircle size={16} />} label="Bookings & Payments" tab="payments" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem icon={<Headphones size={16} />} label="Support" tab="support" activeTab={activeTab} setActiveTab={setActiveTab} />
          </nav>

          <div className="dd-logout">
            <button className="dd-logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* ════════════ MAIN ════════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Topbar */}
          <header className="dd-topbar">
            <div className="dd-topbar-title">
              {activeTab === 'discover' && 'Discover Pandits'}
              {activeTab === 'bookings' && 'My Bookings'}
              {activeTab === 'chat' && 'Messages'}
              {activeTab === 'payments' && 'Bookings & Payments'}
              {activeTab === 'support' && 'Help & Support'}
            </div>
            {activeTab === 'discover' && (
              <button className="dd-loc-btn" onClick={handleLocationRequest} disabled={loading}>
                <Navigation size={15} /> Use My Location
              </button>
            )}
          </header>

          {/* Content */}
          <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

            {/* ─── DISCOVER ─── */}
            {activeTab === 'discover' && (
              <div>
                {/* Location banner */}
                {!loading && locationMessage && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 12, marginBottom: 20, border: '1px solid',
                    background: isLocal ? C.successLt : C.goldLt,
                    borderColor: isLocal ? '#A3D9B1' : '#E6C87A',
                    color: isLocal ? C.success : C.gold
                  }}>
                    {isLocal ? <CheckCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />}
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{isLocal ? 'Pandits available near you!' : `No pandits found in ${user?.city}`}</p>
                      <p style={{ fontSize: 12, marginTop: 2, opacity: 0.85 }}>{locationMessage}</p>
                    </div>
                  </div>
                )}

                {/* Popular puja pills — 99pandit style */}
                <div style={{ marginBottom: 22 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Popular Pujas</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['Griha Pravesh', 'Satyanarayan Katha', 'Vivah Ceremony', 'Havan & Yagya', 'Ganesh Puja', 'Durga Puja', 'Rudrabhishek'].map(p => (
                      <span key={p} className="dd-puja-pill">🕉 {p}</span>
                    ))}
                  </div>
                </div>

                {!loading && !isLocal && pandits.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <BadgeCheck size={18} color={C.saffron} />
                    <h2 style={{ fontWeight: 700, fontSize: 14, color: C.textMid }}>Top Trusted Pandits from Major Cities</h2>
                  </div>
                )}

                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 16 }}>
                    <div style={{ fontSize: 48 }} className="pulse">🕉</div>
                    <div style={{ width: 36, height: 36, border: `4px solid ${C.border}`, borderTopColor: C.saffron, borderRadius: '50%' }} className="spin" />
                    <p style={{ color: C.textMuted, fontSize: 13 }}>Finding Pandits near you...</p>
                  </div>
                ) : pandits.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🔱</div>
                    <h3 style={{ fontWeight: 700, color: C.maroon, fontSize: 18, marginBottom: 8 }}>No Pandits Available</h3>
                    <p style={{ color: C.textMuted, fontSize: 14 }}>We couldn't find any pandits at the moment. Please try again later.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                    {pandits.map(pandit => (
                      <div key={pandit._id} className="dd-pandit-card">
                        {!isLocal && (
                          <div style={{ position: 'absolute', top: 14, right: 14, background: C.saffronLt, border: `1px solid ${C.saffron}`, color: C.saffron, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <BadgeCheck size={11} /> Trusted
                          </div>
                        )}

                        {/* Avatar + rating */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                          <div style={{ width: 54, height: 54, borderRadius: '50%', background: `linear-gradient(135deg,${C.saffron},${C.gold})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, flexShrink: 0 }}>
                            {pandit.firstName?.charAt(0)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: C.goldLt, border: `1px solid ${C.gold}`, borderRadius: 20, padding: '4px 10px' }}>
                            <Star size={13} fill={C.gold} color={C.gold} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: C.maroon }}>4.8</span>
                          </div>
                        </div>

                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, color: C.maroon, marginBottom: 4 }}>
                          Pt. {pandit.firstName} {pandit.lastName}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, fontSize: 12, color: C.textMid, marginBottom: 10 }}>
                          <MapPin size={13} color={C.saffron} />
                          <span>{pandit.city}</span>
                          {pandit.distance !== undefined && (
                            <span style={{ background: C.saffronLt, color: C.saffron, fontWeight: 700, padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>
                              {pandit.distance < 1 ? '< 1' : Math.round(pandit.distance)} km
                            </span>
                          )}
                          {!isLocal && !pandit.distance && (
                            <span style={{ color: C.saffron, fontWeight: 600, fontSize: 11 }}>(Nearby City)</span>
                          )}
                        </div>

                        <div style={{ background: C.surface, borderRadius: 8, padding: '9px 12px', fontSize: 12, color: C.textMid, marginBottom: 14, minHeight: 38 }}>
                          <span style={{ fontWeight: 700, color: C.maroon }}>Expertise: </span>
                          {pandit.panditProfile?.specializations?.join(', ') || pandit.panditProfile?.specialization || 'All Pujas'}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="dd-btn dd-btn-maroon" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}
                            onClick={() => handleOpenBookingModal(pandit._id)}>
                            Book Now
                          </button>
                          <button className="dd-btn dd-btn-ghost" style={{ padding: '9px 14px' }} onClick={() => startChat(pandit)}>
                            <MessageSquare size={17} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── MY BOOKINGS ─── */}
            {activeTab === 'bookings' && (
              <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 14, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>📿</div>
                    <p style={{ fontWeight: 700, color: C.maroon, fontSize: 16 }}>No bookings yet</p>
                    <p style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>Find a Pandit from the Discover tab to make your first booking.</p>
                  </div>
                ) : bookings.map(booking => (
                  <div key={booking._id} className="dd-booking-card">
                    {/* Color strip based on status */}
                    <div style={{
                      height: 4, background:
                        booking.status === 'pending' ? C.gold :
                          booking.status === 'confirmed' ? C.success :
                            booking.status === 'completed' ? C.purple : C.red
                    }} />
                    <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                          <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, color: C.maroon }}>
                            🕉 {booking.pujaType}
                          </h3>
                          <StatusBadge status={booking.status} />
                          {booking.pujaMode === 'online' && (
                            <span className="dd-badge" style={{ background: C.purpleLt, color: C.purple }}>Online</span>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 13, color: C.textMid }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Clock size={13} color={C.saffron} />
                            {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString('en-IN') : '-'}
                            {booking.scheduledTime && ` · ${booking.scheduledTime}`}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <MapPin size={13} color={C.saffron} />
                            {booking.pujaMode === 'online' ? 'Online / Virtual Puja' : booking.address}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Video size={13} color={booking.pujaMode === 'online' ? C.purple : C.border} />
                            <span style={{ color: booking.pujaMode === 'online' ? C.purple : C.textMuted, fontWeight: 600 }}>
                              {booking.pujaMode === 'online' ? 'Distance Puja' : 'In-Person'}
                            </span>
                          </span>
                          {booking.pandit && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.saffronLt, color: C.saffron, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {booking.pandit.firstName?.charAt(0)}
                              </div>
                              <span style={{ fontWeight: 600, color: C.maroon }}>Pt. {booking.pandit.firstName} {booking.pandit.lastName}</span>
                            </span>
                          )}
                        </div>
                        {booking.videoLink && (
                          <div style={{ marginTop: 10, background: C.purpleLt, border: `1px solid ${C.purple}`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.purple, fontWeight: 700 }}>
                              <Video size={13} /> Meeting Link Ready
                            </div>
                            <a href={booking.videoLink} target="_blank" rel="noopener noreferrer"
                              style={{ background: C.purple, color: '#fff', padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 800, textDecoration: 'none' }}>
                              Join Now →
                            </a>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                        {booking.pandit && booking.paymentStatus === 'paid' && (
                          <button className="dd-btn dd-btn-ghost" style={{ fontSize: 12 }} onClick={() => startChat(booking.pandit)}>
                            <MessageSquare size={14} /> Chat
                          </button>
                        )}
                        {(booking.status === 'completed' || booking.status === 'rejected' || booking.status === 'cancelled') && (
                          <button className="dd-btn" onClick={() => deleteBooking(booking._id)}
                            style={{ background: '#f5f0eb', color: C.textMid, fontSize: 12 }}>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── CHAT ─── */}
            {activeTab === 'chat' && (
              <div style={{ display: 'flex', height: 'calc(100vh - 106px)', gap: 16 }}>
                <div style={{ width: 240, background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14, color: C.maroon, borderBottom: `1px solid ${C.border}`, background: C.saffronLt, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🕉 Recent Chats
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {conversations.length === 0 ? (
                      <div style={{ padding: 20, textAlign: 'center', color: C.textMuted, fontSize: 13, marginTop: 16 }}>
                        No conversations yet. Find a Pandit to start!
                      </div>
                    ) : conversations.map(c => (
                      <div key={c._id} onClick={() => setSelectedChatUser(c)}
                        style={{
                          padding: '12px 16px', borderBottom: `1px solid ${C.surface}`, cursor: 'pointer', transition: 'background 0.12s',
                          background: selectedChatUser?._id === c._id ? C.saffronLt : '#fff',
                          borderLeft: selectedChatUser?._id === c._id ? `3px solid ${C.saffron}` : '3px solid transparent'
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${C.saffron},${C.gold})`, color: '#fff', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {c.firstName?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: C.maroon }}>{c.firstName} {c.lastName}</div>
                            <div style={{ fontSize: 11, color: C.saffron, textTransform: 'capitalize', marginTop: 1 }}>{c.role}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', display: 'flex' }}>
                  <ChatInterface otherUser={selectedChatUser} socket={socketRef.current} />
                </div>
              </div>
            )}

            {/* ─── SUPPORT ─── */}
            {activeTab === 'support' && (
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <SupportCare userRole="devotee" />
              </div>
            )}

            {/* ─── PAYMENTS ─── */}
            {activeTab === 'payments' && (
              <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* Unpaid bookings */}
                <div>
                  <SectionTitle>Active & Unpaid Bookings</SectionTitle>
                  {bookings.filter(b => b.status === 'confirmed' && b.paymentStatus === 'pending').length === 0 ? (
                    <p style={{ color: C.textMuted, fontSize: 14 }}>No pending payments for active bookings.</p>
                  ) : bookings.filter(b => b.status === 'confirmed' && b.paymentStatus === 'pending').map(booking => (
                    <div key={booking._id} style={{ background: C.saffronLt, border: `1.5px solid ${C.saffron}`, borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <AlertCircle size={17} color={C.saffron} />
                          <span style={{ fontWeight: 800, color: C.maroon, fontSize: 16 }}>Pt. {booking.pandit?.firstName} {booking.pandit?.lastName}</span>
                        </div>
                        <div style={{ fontSize: 13, color: C.textMid }}>
                          <strong>{booking.pujaType}</strong> · {new Date(booking.scheduledDate || booking.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        <div style={{ fontSize: 12, color: C.saffron, marginTop: 4, fontWeight: 600 }}>🔒 Payment required to unlock chat</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: C.maroon, marginBottom: 8 }}>
                          ₹{booking.fee?.toLocaleString() || '1,500'}
                        </div>
                        <button className="dd-btn dd-btn-primary" onClick={() => handlePayment(booking)} disabled={loading}>
                          {loading ? 'Processing...' : 'Pay Now'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment history */}
                <div>
                  <SectionTitle>Past Transactions</SectionTitle>
                  {payments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 14, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
                      <p style={{ color: C.textMuted, fontSize: 14 }}>No payment history found.</p>
                    </div>
                  ) : payments.map(payment => (
                    <div key={payment._id} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, boxShadow: '0 1px 4px rgba(123,29,14,0.05)' }}>
                      <div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: C.maroon, fontSize: 16, marginBottom: 4 }}>
                          Pt. {payment.pandit?.firstName} {payment.pandit?.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: C.textMid }}>
                          {new Date(payment.createdAt).toLocaleDateString('en-IN')} · {new Date(payment.createdAt).toLocaleTimeString()}
                        </div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                          TXN: {payment.razorpayPaymentId}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: C.success }}>
                          ₹{(payment.amount / 100).toLocaleString()}
                        </div>
                        <div style={{ background: C.successLt, color: C.success, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 4, display: 'inline-block', marginTop: 4, letterSpacing: '0.6px' }}>
                          ✓ SUCCESS
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default DevoteeDashboard;