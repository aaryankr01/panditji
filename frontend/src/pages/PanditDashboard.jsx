import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useT from '../hooks/useT';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  LogOut, Calendar, MessageSquare, CheckCircle, XCircle,
  MapPin, Clock, Bell, Phone, User, AlertCircle, Trash2, Headphones, Video, ShieldCheck, Save
} from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import SupportCare from '../components/SupportCare';
import LanguageToggle from '../components/common/LanguageToggle';
import api from '../utils/api';


/* ─── Design tokens from DevoteeDashboard ─── */
const C = {
  saffron: '#E8710A',
  saffronDk: '#C45F06',
  saffronLt: '#FFF3E8',
  maroon: '#7B1D0E',
  maroonLt: '#F9EDE8',
  gold: '#C8960C',
  goldLt: '#FFF8E1',
  purple: '#5B2D8E',
  purpleLt: '#F3EEFF',
  white: '#FFFFFF',
  surface: '#FAF7F2',
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

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');
  
  .dd-btn {
    display: inline-flex; align-items: center; gap: 8px; font-family: 'Poppins', sans-serif;
    font-weight: 700; font-size: 14px; padding: 10px 20px; border-radius: 12px;
    cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: none;
    text-decoration: none;
  }
  .dd-btn-primary { background: ${C.saffron}; color: #fff; box-shadow: 0 4px 12px rgba(232,113,10,0.25); }
  .dd-btn-primary:hover { background: ${C.saffronDk}; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(232,113,10,0.3); }
  .dd-btn-maroon { background: ${C.maroon}; color: #fff; }
  .dd-btn-maroon:hover { background: #5a140a; transform: translateY(-2px); }
  .dd-btn-ghost { background: ${C.saffronLt}; color: ${C.saffronDk}; }
  .dd-btn-ghost:hover { background: #FDE8D5; }
  .dd-btn-red { background: ${C.redLt}; color: ${C.red}; }
  .dd-btn-red:hover { background: #fadbd8; }
  .dd-btn-green { background: ${C.successLt}; color: ${C.success}; }
  .dd-btn-green:hover { background: #d4efdf; }
  
  .dd-stat { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 28px; color: ${C.maroon}; line-height: 1.1; }
  .dd-stat-lbl { font-size: 12px; font-weight: 700; color: ${C.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
  .bounce { animation: bounce 1s infinite; }
  @keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); } 50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); } }
`;

const SectionTitle = ({ children }) => (
  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.maroon, marginBottom: 16, borderBottom: `2px solid ${C.border}`, paddingBottom: 8 }}>{children}</h2>
);

const PanditDashboard = () => {
  const { user, token, logout, updateUser, isInitialized } = useAuthStore();
  const t = useT();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [daysToExpiry, setDaysToExpiry] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const [countdown, setCountdown] = useState(30);
  const [cancellationToast, setCancellationToast] = useState(null); // { pujaType, devotee }

  // Profile Edit State
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', city: '', bio: '', experience: 0, feePerPuja: 1500, specializations: [] });
  const [savingProfile, setSavingProfile] = useState(false);

  // Aadhar Upload State
  const [aadharNumber, setAadharNumber] = useState('');
  const [aadharFile, setAadharFile] = useState(null);
  const [verifyingAadhar, setVerifyingAadhar] = useState(false);

  // Switch to device-width viewport so hamburger/drawer works on phones
  useEffect(() => {
    const vp = document.querySelector('meta[name="viewport"]');
    const prev = vp ? vp.getAttribute('content') : null;
    if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    return () => { if (vp && prev) vp.setAttribute('content', prev); };
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    if (!token || user?.role !== 'pandit') { navigate('/'); return; }

    api.get('/bookings')
      .then(r => setBookings(r.data.data)).catch(console.error);

    api.get('/chat/conversations/list')
      .then(r => setConversations(r.data.data)).catch(console.error);

    api.get('/payments')
      .then(r => {
        const payments = r.data.data;
        const sum = payments.reduce((acc, curr) => acc + (curr.panditEarnings || 0), 0);
        setTotalEarnings(sum / 100);
      }).catch(console.error);

    const fetchProfile = async () => {
      try {
        const res = await api.get('/pandits/my-profile');
        const data = res.data.data;
        setProfileData(data);
        setEditForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          city: data.city || '',
          bio: data.panditProfile?.bio || '',
          experience: data.panditProfile?.experience || 0,
          feePerPuja: data.panditProfile?.feePerPuja || 1500,
          specializations: data.panditProfile?.specializations || []
        });

        const sub = data.panditProfile?.subscription;
        if (!sub || !sub.isActive || !sub.endDate || new Date(sub.endDate) < new Date()) {
          setSubscriptionStatus('inactive');
        } else {
          const msToExpiry = new Date(sub.endDate).getTime() - new Date().getTime();
          const days = Math.ceil(msToExpiry / (1000 * 60 * 60 * 24));
          setDaysToExpiry(days);
          if (days <= 3) setSubscriptionStatus('warning');
          else setSubscriptionStatus('active');
        }
      } catch (err) { console.error(err); }
    };
    fetchProfile();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://panditji-1tf8.onrender.com', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      const userId = user._id || user.id;
      socket.emit('join', { userId, role: 'pandit', city: user.city });
    });

    socket.on('newBookingRequest', (booking) => {
      setIncomingRequest(booking);
      setCountdown(30);
    });

    socket.on('bookingTaken', ({ bookingId }) => {
      setIncomingRequest(prev => prev?._id === bookingId ? null : prev);
    });

    socket.on('paymentConfirmed', ({ bookingId }) => {
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, paymentStatus: 'paid' } : b));
    });

    // Fired when a devotee cancels a booking the pandit already accepted
    socket.on('bookingCancelledByDevotee', ({ bookingId, pujaType, devotee }) => {
      // Update the booking status in the list
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      // Show a dismissible toast notification
      setCancellationToast({ pujaType, devotee });
      // Auto-dismiss after 8 seconds
      setTimeout(() => setCancellationToast(null), 8000);
    });

    return () => socket.disconnect();
  }, [token, user, isInitialized, navigate]);

  useEffect(() => {
    if (!incomingRequest) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current); setIncomingRequest(null); return 30; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [incomingRequest]);

  const handleAccept = async (bookingId) => {
    if (subscriptionStatus === 'inactive') {
      alert('You cannot accept bookings while your subscription is inactive.');
      return;
    }
    setAccepting(true);
    try {
      const res = await api.patch(`/bookings/${bookingId}/accept`);
      const accepted = res.data.data;

      setBookings(prev => {
        const exists = prev.find(b => b._id === bookingId);
        if (exists) {
          return prev.map(b => b._id === bookingId ? accepted : b);
        }
        return [accepted, ...prev];
      });

      // Do not auto-open chat until paid
      alert('Request accepted! Chat will unlock once the devotee completes the payment.');
      setIncomingRequest(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not accept – already taken');
      setIncomingRequest(null);
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: 'rejected' });
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'rejected' } : b));
      if (incomingRequest?._id === bookingId) setIncomingRequest(null);
    } catch {
      alert('Failed to reject request');
    }
  };

  const declineRequest = () => setIncomingRequest(null);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      updateUser({ avatar: res.data.avatarUrl });
    } catch (err) {
      console.error('Avatar upload failed', err);
      alert('Failed to upload profile picture');
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status } : b));
    } catch { alert('Failed to update status'); }
  };

  const handleAddMeetingLink = async (bookingId) => {
    const link = window.prompt('Enter Zoom/Meet link for this Puja:');
    if (!link) return;
    try {
      await api.patch(`/bookings/${bookingId}/link`, { videoLink: link });
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, videoLink: link } : b));
      alert('Link shared with devotee!');
    } catch { alert('Failed to share link'); }
  };

  const handleSubscriptionPayment = async () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    script.onload = async () => {
      try {
        const { data } = await api.post('/payments/create-subscription-order');
        if (!data.success) return alert('Failed to initiate subscription payment.');

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
          amount: data.amount,
          currency: 'INR',
          name: 'PanditJi Pro',
          description: 'Monthly Subscription',
          order_id: data.orderId,
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/payments/verify-subscription', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                alert('Subscription successful!');
                window.location.reload();
              }
            } catch (err) { alert('Verification failed.'); }
          },
          prefill: { name: `${user.firstName} ${user.lastName}`, email: user.email || '' },
          theme: { color: C.saffron },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) { alert('Error processing subscription payment'); }
    };
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking from your history?')) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings(bookings.filter(b => b._id !== bookingId));
    } catch (err) {
      console.error('[deleteBooking]', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to delete booking');
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await api.patch('/pandits/profile', editForm);
      setProfileData(res.data.data);
      updateUser(res.data.data); // Update local user state if needed
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadAadhar = async () => {
    if (aadharNumber.length !== 12) {
      alert('Please enter a valid 12-digit Aadhar number.');
      return;
    }
    if (!aadharFile) {
      alert('Please select an Aadhar card image to upload.');
      return;
    }
    setVerifyingAadhar(true);
    const formData = new FormData();
    formData.append('aadharNumber', aadharNumber);
    formData.append('document', aadharFile);

    try {
      const res = await api.post('/pandits/aadhar/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfileData(res.data.data);
      alert('Aadhar document uploaded successfully! Please wait up to 24 hours for admin verification.');
      setAadharFile(null);
      setAadharNumber('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setVerifyingAadhar(false);
    }
  };

  const renderBadge = (status) => {
    const map = {
      pending: { bg: C.goldLt, c: C.gold },
      confirmed: { bg: C.successLt, c: C.success },
      completed: { bg: C.purpleLt, c: C.purple },
      rejected: { bg: C.redLt, c: C.red },
      cancelled: { bg: '#F3F4F6', c: '#6B7280' },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{ background: s.bg, color: s.c, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.surface, fontFamily: "'Poppins', sans-serif" }}>
      <style>{G}</style>
      <style>{`
        .pd-sidebar { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
        .pd-mobile-btn { display: none !important; }
        .pd-close-btn { display: none !important; }
        @media (max-width: 1024px) {
          .pd-sidebar { position: fixed !important; top: 0; bottom: 0; left: 0; z-index: 2000; transform: translateX(-100%); box-shadow: 4px 0 24px rgba(123,29,14,0.15); width: 280px; }
          .pd-sidebar.open { transform: translateX(0) !important; }
          .pd-mobile-btn { display: flex !important; }
          .pd-close-btn { display: block !important; }
          .pd-header { padding: 0 16px !important; }
        }
        @media (max-width: 600px) {
          .pd-booking-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
      `}</style>

      {/* ═══ CANCELLATION TOAST (devotee cancelled a paid/accepted booking) ═══ */}
      {cancellationToast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 2000, background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: `1.5px solid ${C.red}`, maxWidth: 360, overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ background: C.redLt, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid rgba(192,57,43,0.15)` }}>
            <XCircle size={20} color={C.red} />
            <span style={{ fontWeight: 800, color: C.red, fontSize: 14 }}>Booking Cancelled by Devotee</span>
            <button onClick={() => setCancellationToast(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: C.red }}>
              ✕
            </button>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>
              <strong style={{ color: C.maroon }}>{cancellationToast.devotee}</strong> has cancelled their{' '}
              <strong style={{ color: C.maroon }}>{cancellationToast.pujaType}</strong> booking.
              The slot is now free.
            </p>
          </div>
        </div>
      )}

      {/* ═══ INCOMING BOOKING POPUP (Ola/Uber style) ═══ */}
      {incomingRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 420, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ background: `linear-gradient(135deg, ${C.saffron} 0%, ${C.saffronDk} 100%)`, color: '#fff', padding: 24, textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                {countdown}s
              </div>
              <Bell size={32} className="bounce" style={{ margin: '0 auto 12px' }} />
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, marginBottom: 4 }}>New Puja Request!</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Accept before someone else does</p>
            </div>

            <div style={{ height: 6, background: C.saffronLt }}>
              <div style={{ height: '100%', background: C.saffron, transition: 'width 1s linear', width: `${(countdown / 30) * 100}%` }} />
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, background: C.saffronLt, color: C.saffron, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>
                  {incomingRequest.devotee?.firstName?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: C.maroon }}>{incomingRequest.devotee?.firstName} {incomingRequest.devotee?.lastName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: C.textMid, marginTop: 4 }}>
                    <Phone size={14} /> {incomingRequest.devotee?.phone}
                  </div>
                </div>
              </div>

              <div style={{ background: C.surface, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                  <User size={16} color={C.saffron} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div><strong style={{ color: C.maroon }}>Puja:</strong> <span style={{ color: C.textMid }}>{incomingRequest.pujaType}</span></div>
                </div>
                <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                  <Video size={16} color={C.purple} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div><strong style={{ color: C.maroon }}>Mode:</strong> <span style={{ color: incomingRequest.pujaMode === 'online' ? C.purple : C.saffron, fontWeight: 700, textTransform: 'capitalize' }}>{incomingRequest.pujaMode || 'in-person'}</span></div>
                </div>
                <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                  <Clock size={16} color={C.saffron} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div><strong style={{ color: C.maroon }}>Date:</strong> <span style={{ color: C.textMid }}>{incomingRequest.scheduledDate ? new Date(incomingRequest.scheduledDate).toLocaleDateString() : '-'} at {incomingRequest.scheduledTime}</span></div>
                </div>
                <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                  <MapPin size={16} color={C.saffron} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div><strong style={{ color: C.maroon }}>Address:</strong> <span style={{ color: C.textMid }}>{incomingRequest.address}</span></div>
                </div>
                {incomingRequest.notes && (
                  <div style={{ fontSize: 13, color: C.textMuted, fontStyle: 'italic', borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 4 }}>
                    "{incomingRequest.notes}"
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 12 }}>
              <button onClick={declineRequest} style={{ flex: 1, padding: 16, background: C.surface, color: C.textMid, fontWeight: 700, borderRadius: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <XCircle size={20} /> Decline
              </button>
              <button onClick={() => handleAccept(incomingRequest._id)} disabled={accepting} style={{ flex: 1, padding: 16, background: C.success, color: '#fff', fontWeight: 700, borderRadius: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 20px rgba(30,125,60,0.25)' }}>
                {accepting ? <span className="spin" style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> : <><CheckCircle size={20} /> Accept</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobileSidebarOpen && <div onClick={() => setIsMobileSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.5)', zIndex: 1999, backdropFilter: 'blur(2px)' }} />}

      {/* ═══ SIDEBAR ═══ */}
      <div className={`pd-sidebar${isMobileSidebarOpen ? ' open' : ''}`} style={{ width: 280, background: '#fff', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 32, textAlign: 'center', borderBottom: `1px solid ${C.border}`, position: 'relative' }}>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="pd-close-btn"
            style={{ position: 'absolute', top: 12, right: 12, background: C.saffronLt, border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.maroon }}
          >
            <XCircle size={16} />
          </button>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${C.saffronLt}` }} />
            ) : (
              <div style={{ width: 80, height: 80, background: C.saffron, color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, border: `3px solid ${C.saffronLt}` }}>
                {user?.firstName?.charAt(0)}
              </div>
            )}
            <button onClick={() => document.getElementById('avatar-upload').click()} style={{ position: 'absolute', bottom: 0, right: 0, background: C.maroon, color: '#fff', width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </button>
            <input type="file" id="avatar-upload" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: C.maroon }}>Pt. {user?.firstName} {user?.lastName}</h2>
          <p style={{ fontSize: 11, color: C.saffron, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', background: C.saffronLt, padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginTop: 8 }}>{user?.role}</p>
          {user?.city && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, fontSize: 13, color: C.textMid }}>
              <MapPin size={14} color={C.saffron} /> {user.city}
            </div>
          )}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px dashed ${C.border}` }}>
            <p className="dd-stat-lbl">{t('pd_total_earnings')}</p>
            <p className="dd-stat" style={{ color: C.success }}>₹{totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { id: 'bookings', label: t('pd_booking_requests'), icon: Calendar },
            { id: 'chat', label: t('dd_messages'), icon: MessageSquare },
            { id: 'profile', label: t('dd_my_profile'), icon: User },
            { id: 'support', label: t('dd_support'), icon: Headphones },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMobileSidebarOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, transition: 'all 0.2s', textAlign: 'left',
                background: activeTab === tab.id ? C.maroon : 'transparent',
                color: activeTab === tab.id ? '#fff' : C.textMid,
              }}>
              <tab.icon size={20} color={activeTab === tab.id ? C.gold : C.textMuted} /> {tab.label}
              {tab.id === 'bookings' && bookings.filter(b => b.status === 'pending').length > 0 && (
                <span style={{ marginLeft: 'auto', background: C.gold, color: C.maroon, fontSize: 11, fontWeight: 800, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: 24, borderTop: `1px solid ${C.border}` }}>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: C.redLt, color: C.red, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14, transition: 'all 0.2s' }}>
            <LogOut size={20} /> {t('dd_logout')}
          </button>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header className="pd-header" style={{ height: 80, background: '#fff', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
          <button className="pd-mobile-btn" onClick={() => setIsMobileSidebarOpen(true)} style={{ alignItems: 'center', justifyContent: 'center', background: '#FAF7F2', border: '1px solid #EAD9CC', borderRadius: 12, padding: '8px 10px', cursor: 'pointer', color: '#7B1D0E', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 5H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><path d="M3 10H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><path d="M3 15H11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
          </button>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: C.maroon }}>
            {activeTab === 'bookings' ? t('pd_booking_requests') : activeTab === 'chat' ? t('dd_messages') : activeTab === 'profile' ? t('dd_my_profile') : t('dd_support')}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, fontWeight: 700 }}>
            {subscriptionStatus === 'inactive' ? (
              <span style={{ color: C.red, display: 'flex', alignItems: 'center', gap: 6 }}><XCircle size={16} /> {t('pd_offline_expired')}</span>
            ) : (
              <span style={{ color: C.success, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, background: C.success, borderRadius: '50%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} /> {t('pd_online_receiving')}</span>
            )}
            <LanguageToggle />
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: 32 }}>

          {/* SUBSCRIPTION ALERTS */}
          {subscriptionStatus === 'inactive' && (
            <div style={{ background: C.redLt, border: `1px solid rgba(192,57,43,0.2)`, borderRadius: 16, padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(192,57,43,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, background: 'rgba(192,57,43,0.1)', color: C.red, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.red, marginBottom: 4 }}>{t('pd_sub_inactive_title') || 'Subscription Inactive'}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(192,57,43,0.8)' }}>{t('pd_sub_inactive_desc') || 'Your profile is hidden from Devotees. You cannot receive or accept new bookings.'}</p>
                </div>
              </div>
              <button className="dd-btn" style={{ background: C.red, color: '#fff' }} onClick={handleSubscriptionPayment}>
                {t('pd_sub_activate_btn') || 'Pay ₹500 to Activate'}
              </button>
            </div>
          )}

          {subscriptionStatus === 'warning' && (
            <div style={{ background: C.goldLt, border: `1px solid rgba(200,150,12,0.2)`, borderRadius: 16, padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(200,150,12,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, background: 'rgba(200,150,12,0.1)', color: '#A67C00', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#A67C00', marginBottom: 4 }}>{t('pd_sub_warning_title') || 'Subscription Expiring Soon'}</h3>
                  <p style={{ fontSize: 14, color: '#8A6600' }}>{t('pd_sub_warning_desc') || `Your subscription expires in ${daysToExpiry} days. Renew now to stay visible to Devotees.`}</p>
                </div>
              </div>
              <button className="dd-btn" style={{ background: '#A67C00', color: '#fff' }} onClick={handleSubscriptionPayment}>
                {t('pd_sub_renew_btn') || 'Renew for ₹500'}
              </button>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900, margin: '0 auto' }}>
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 24, border: `1px solid ${C.border}` }}>
                  <Bell size={48} color={C.saffronLt} style={{ margin: '0 auto 16px' }} />
                  <p style={{ fontSize: 16, fontWeight: 700, color: C.maroon }}>{t('pd_no_bookings_title') || 'No booking requests yet.'}</p>
                  <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>{t('pd_no_bookings_desc') || 'Requests from your city will appear here instantly.'}</p>
                </div>
              ) : (
                bookings.map(booking => (
                  <div key={booking._id} style={{ background: '#fff', borderRadius: 20, padding: 24, border: `1px solid ${C.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 56, height: 56, background: C.saffronLt, color: C.saffron, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>
                          {booking.devotee?.firstName?.charAt(0)}
                        </div>
                        <div>
                          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: C.maroon, marginBottom: 4 }}>
                            {booking.devotee?.firstName} {booking.devotee?.lastName}
                          </h3>
                          {renderBadge(booking.status)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {booking.paymentStatus === 'paid' && (
                          <button className="dd-btn dd-btn-ghost" onClick={() => { setSelectedChatUser(booking.devotee); setActiveTab('chat'); }}>
                            <MessageSquare size={16} /> {t('dd_chat')}
                          </button>
                        )}

                        {booking.status === 'pending' && (
                          <>
                            <button className="dd-btn dd-btn-red" onClick={() => handleReject(booking._id)}>
                              <XCircle size={16} /> {t('pd_reject') || 'Reject'}
                            </button>
                            <button className="dd-btn dd-btn-green" onClick={() => handleAccept(booking._id)} disabled={accepting}>
                              {accepting ? <span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: C.success, borderRadius: '50%', display: 'inline-block' }} /> : <><CheckCircle size={16} /> {t('pd_accept') || 'Accept'}</>}
                            </button>
                          </>
                        )}

                        {booking.status === 'confirmed' && (
                          <>
                            {booking.pujaMode === 'online' && (
                              <button className="dd-btn" style={{ background: C.purpleLt, color: C.purple }} onClick={() => handleAddMeetingLink(booking._id)}>
                                <Video size={16} /> {booking.videoLink ? (t('pd_edit_link') || 'Edit Link') : (t('pd_add_link') || 'Add Link')}
                              </button>
                            )}
                            <button className="dd-btn dd-btn-green" onClick={() => updateBookingStatus(booking._id, 'completed')}>
                              <CheckCircle size={16} /> {t('pd_complete') || 'Complete'}
                            </button>
                          </>
                        )}

                        {(booking.status === 'completed' || booking.status === 'rejected' || booking.status === 'cancelled') && (
                          <button className="dd-btn dd-btn-red" onClick={() => deleteBooking(booking._id)} title="Delete History">
                            <Trash2 size={16} /> {t('dd_delete')}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pd-booking-grid" style={{ background: C.surface, borderRadius: 16, padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                        <Video size={16} color={C.purple} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div><strong style={{ color: C.maroon }}>{t('pd_mode') || 'Mode:'}</strong> <span style={{ color: booking.pujaMode === 'online' ? C.purple : C.saffron, fontWeight: 700, textTransform: 'capitalize' }}>{booking.pujaMode || 'in-person'}</span></div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                        <User size={16} color={C.saffron} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div><strong style={{ color: C.maroon }}>Puja:</strong> <span style={{ color: C.textMid }}>{booking.pujaType}</span></div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                        <Clock size={16} color={C.saffron} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div><strong style={{ color: C.maroon }}>{t('dd_date')}:</strong> <span style={{ color: C.textMid }}>{booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : '-'} {booking.scheduledTime && `at ${booking.scheduledTime}`}</span></div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: C.success, flexShrink: 0 }}>₹</span>
                        <div><strong style={{ color: C.maroon }}>{t('dd_booking_fee')}:</strong> <span style={{ color: C.success, fontWeight: 800 }}>₹{booking.fee}</span></div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, fontSize: 14, gridColumn: '1 / -1' }}>
                        <MapPin size={16} color={C.saffron} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div><strong style={{ color: C.maroon }}>{t('pd_address') || 'Address:'}</strong> <span style={{ color: C.textMid }}>{booking.address}</span></div>
                      </div>
                      {booking.videoLink && (
                        <div style={{ gridColumn: '1 / -1', background: C.purpleLt, padding: 12, borderRadius: 12, color: C.purple, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, wordBreak: 'break-all' }}>
                          <Video size={16} style={{ flexShrink: 0 }} /> <strong>{t('pd_meeting_link') || 'Meeting Link:'}</strong> <a href={booking.videoLink} target="_blank" rel="noopener noreferrer" style={{ color: C.purple, textDecoration: 'underline' }}>{booking.videoLink}</a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div style={{ display: 'flex', height: '100%', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ width: 340, background: '#fff', borderRadius: 24, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, color: C.maroon }}>
                  {t('pd_conversations') || 'Conversations'}
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {conversations.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', fontSize: 14, color: C.textMuted }}>{t('pd_no_conversations') || 'No conversations yet. Accept a booking to start chatting!'}</div>
                  ) : (
                    conversations.map(c => (
                      <div key={c._id} onClick={() => setSelectedChatUser(c)}
                        style={{ padding: '16px 24px', borderBottom: `1px solid ${C.surface}`, cursor: 'pointer', transition: 'all 0.2s', background: selectedChatUser?._id === c._id ? C.saffronLt : '#fff', borderLeft: `4px solid ${selectedChatUser?._id === c._id ? C.saffron : 'transparent'}` }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: C.maroon }}>{c.firstName} {c.lastName}</div>
                        <div style={{ fontSize: 11, color: C.saffron, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>{c.role}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div style={{ flex: 1, background: '#fff', borderRadius: 24, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                <ChatInterface otherUser={selectedChatUser} socket={socketRef.current} />
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              <SupportCare userRole="pandit" />
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Aadhar Verification Status */}
              <div style={{ background: '#fff', padding: 24, borderRadius: 24, border: `1px solid ${C.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.maroon, marginBottom: 16 }}>{t('pd_aadhar_title') || 'Aadhar eKYC Verification'}</h2>

                {profileData?.panditProfile?.isAadharVerified ? (
                  <div style={{ background: C.successLt, color: C.success, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700 }}>
                    <ShieldCheck size={24} />
                    {t('pd_aadhar_verified') || 'Aadhar Verified & Profile Approved'}
                  </div>
                ) : profileData?.panditProfile?.documents?.length > 0 ? (
                  <div style={{ background: C.goldLt, color: C.gold, padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700 }}>
                    <AlertCircle size={24} />
                    {t('pd_aadhar_pending') || 'Verification Pending (Please allow up to 24 hours for Admin approval)'}
                  </div>
                ) : (
                  <div style={{ background: C.surface, padding: 20, borderRadius: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <p style={{ fontSize: 14, color: C.textMid }}>{t('pd_aadhar_upload_desc') || 'Upload your Aadhar Card for manual verification by our Admin team.'}</p>
                      <input
                        type="text"
                        placeholder={t('pd_aadhar_placeholder') || 'Enter 12-digit Aadhar Number'}
                        value={aadharNumber}
                        onChange={e => setAadharNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none' }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setAadharFile(e.target.files[0])}
                        style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none', background: '#fff' }}
                      />
                      <button onClick={handleUploadAadhar} disabled={verifyingAadhar} className="dd-btn dd-btn-primary" style={{ width: 'fit-content' }}>
                        {verifyingAadhar ? (t('pd_uploading') || 'Uploading...') : (t('pd_upload_document') || 'Upload Document')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Profile Form */}
              <div style={{ background: '#fff', padding: 24, borderRadius: 24, border: `1px solid ${C.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.maroon, marginBottom: 20 }}>{t('pd_profile_details_title') || 'Personal & Professional Details'}</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: C.textMid }}>{t('dd_first_name')}</label>
                    <input type="text" value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: C.textMid }}>{t('dd_last_name')}</label>
                    <input type="text" value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: C.textMid }}>{t('dd_primary_phone')}</label>
                    <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: C.textMid }}>{t('dd_city')}</label>
                    <input type="text" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: C.textMid }}>{t('pd_experience') || 'Experience (Years)'}</label>
                    <input type="number" value={editForm.experience} onChange={e => setEditForm({ ...editForm, experience: parseInt(e.target.value) || 0 })} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: C.textMid }}>{t('pd_fee_per_puja') || 'Fee Per Puja (₹)'}</label>
                    <input type="number" value={editForm.feePerPuja} onChange={e => setEditForm({ ...editForm, feePerPuja: parseInt(e.target.value) || 0 })} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: C.textMid }}>{t('pd_bio') || 'Bio / About'}</label>
                    <textarea rows="4" value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, outline: 'none', resize: 'vertical' }} />
                  </div>
                </div>

                <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSaveProfile} disabled={savingProfile} className="dd-btn dd-btn-primary">
                    <Save size={18} /> {savingProfile ? (t('pd_saving') || 'Saving...') : (t('pd_save_profile') || 'Save Profile')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PanditDashboard;
