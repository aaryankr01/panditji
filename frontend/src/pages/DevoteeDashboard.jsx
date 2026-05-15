import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import axios from 'axios';
import { io } from 'socket.io-client';
import { LogOut, MessageSquare, Search, Star, MapPin, AlertCircle, CheckCircle, BadgeCheck, Clock, Navigation, X, Calendar, HeadphonesIcon, Video } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import SupportCare from '../components/SupportCare';

// Helper to load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PUJA_PRICES = {
    'Satyanarayan Katha': 2100,
    'Griha Pravesh': 5100,
    'Vivah Ceremony': 11000,
    'Mundan Ceremony': 2100,
    'Navratri Puja': 3100,
    'Durga Puja': 5100,
    'Havan & Yagya': 3100,
    'Naamkaran': 2100,
    'Ganesh Puja': 2100,
    'Lakshmi Puja': 2100,
    'Rudrabhishek': 3100,
    'Surya Puja': 2100,
    'Other': 1500
  };

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
    const [waitingBooking, setWaitingBooking] = useState(null); // booking waiting for pandit
    const [acceptedBooking, setAcceptedBooking] = useState(null);
    const [bookingModal, setBookingModal] = useState({ isOpen: false, pandit: null });
    const [bookingForm, setBookingForm] = useState({
      pujaType: 'Satyanarayan Katha',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      address: '',
      notes: '',
      pujaMode: 'in-person'
    });
    const socketRef = useRef(null);

    const fetchPandits = async (lat = null, lng = null) => {
      setLoading(true);
      try {
        let url = 'http://localhost:5000/api/pandits';
        if (lat && lng) {
          url += `?lat=${lat}&lng=${lng}`;
        } else if (user?.city) {
          url += `?city=${encodeURIComponent(user.city)}`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPandits(res.data.data);
        setIsLocal(res.data.isLocal ?? true);
        setLocationMessage(res.data.message || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const handleLocationRequest = () => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
      }

      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchPandits(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to retrieve your location. Searching by city instead.');
          fetchPandits();
        }
      );
    };

    useEffect(() => {
      if (!token || user?.role !== 'devotee') {
        navigate('/');
        return;
      }

      const fetchConversations = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/chat/conversations/list', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setConversations(res.data.data);
        } catch (err) {
          console.error(err);
        }
      };

      const fetchMyBookings = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/bookings', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const fetchedBookings = res.data.data;
          setBookings(fetchedBookings);
          // Find if there is any pending or accepted but unpaid booking
          const pending = fetchedBookings.find(b => b.status === 'pending');
          const accepted = fetchedBookings.find(b => b.status === 'confirmed' && b.paymentStatus === 'pending');

          if (accepted) {
            setAcceptedBooking(accepted);
          } else if (pending) {
            setWaitingBooking(pending);
          }
        } catch (err) {
          console.error(err);
        }
      };

      const fetchMyPayments = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/payments', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPayments(res.data.data);
        } catch (err) {
          console.error(err);
        }
      };

      fetchPandits();
      fetchConversations();
      fetchMyBookings();
      fetchMyPayments();

      // Socket for real-time booking updates
      const socket = io('http://localhost:5000', { transports: ['websocket'] });
      socketRef.current = socket;
      socket.on('connect', () => {
        socket.emit('join', { userId: user._id || user.id, role: 'devotee', city: user.city });
      });
      // Pandit accepted our booking
      socket.on('bookingAccepted', (booking) => {
        setAcceptedBooking(booking);
        setWaitingBooking(null);
        setSelectedChatUser(booking.pandit);
        setActiveTab('chat');
      });

      // Meeting link updated
      socket.on('bookingLinkUpdated', ({ bookingId, videoLink }) => {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, videoLink } : b));
      });

      return () => socket.disconnect();
    }, [token, user, navigate]);

    const handleLogout = () => {
      logout();
      navigate('/');
    };

    const startChat = (pandit) => {
      setSelectedChatUser(pandit);
      setActiveTab('chat');
    };

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
          panditId: pandit._id,
          pujaType,
          date,
          time,
          address,
          city: user?.city,
          notes,
          pujaMode: bookingForm.pujaMode,
          fee: bookingForm.pujaMode === 'online' ? (PUJA_PRICES[pujaType] || 1500) * 0.7 : (PUJA_PRICES[pujaType] || 1500)
        }, { headers: { Authorization: `Bearer ${token}` } });
        setBookingModal({ isOpen: false, pandit: null });
        setWaitingBooking(res.data.data);
      } catch (err) {
        alert('Failed to send booking request. Please try again.');
      }
    };

    const deleteBooking = async (bookingId) => {
      if (!window.confirm('Are you sure you want to remove this booking from your history?')) return;
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(bookings.filter(b => b._id !== bookingId));
      } catch {
        alert('Failed to delete booking');
      }
    };

    const handleAvatarUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await axios.post('http://localhost:5000/api/users/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });

        updateUser({ avatar: res.data.avatarUrl });
      } catch (err) {
        console.error('Avatar upload failed', err);
        alert('Failed to upload profile picture');
      }
    };

    const handlePayment = async (booking) => {
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      try {
        setLoading(true);
        // 1. Create Order
        const { data } = await axios.post('http://localhost:5000/api/payments/create-order',
          { bookingId: booking._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!data.success) {
          alert('Failed to initiate payment.');
          setLoading(false);
          return;
        }

        // 2. Open Razorpay Checkout
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere', // Should be in .env
          amount: data.amount,
          currency: 'INR',
          name: 'PanditJi',
          description: `Payment for ${booking.pujaType}`,
          order_id: data.orderId,
          handler: async function (response) {
            try {
              // 3. Verify Payment
              const verifyRes = await axios.post('http://localhost:5000/api/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking._id
              }, { headers: { Authorization: `Bearer ${token}` } });

              if (verifyRes.data.success) {
                alert('Payment Successful! You can now chat with the Pandit.');
                setAcceptedBooking(null); // Clear the payment prompt
                fetchMyBookings(); // Refresh bookings to remove 'Pay Now' button
                fetchMyPayments(); // Refresh payments list
                // Open chat
                setSelectedChatUser(booking.pandit);
                setActiveTab('chat');
              }
            } catch (err) {
              alert('Payment verification failed.');
            }
          },
          prefill: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email || '',
          },
          theme: {
            color: '#ea580c', // orange-600
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          alert('Payment failed. ' + response.error.description);
        });
        rzp.open();
      } catch (err) {
        alert(err.response?.data?.message || 'Error processing payment');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex h-screen bg-gray-50 font-sans relative">

        {/* ═══ WAITING FOR PANDIT OVERLAY ═══ */}
        {waitingBooking && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm text-center overflow-hidden">
              <div className="bg-orange-600 text-white p-6">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold">Finding a Pandit...</h2>
                <p className="text-orange-100 text-sm mt-1">Sending booking request...</p>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-600 mb-1">Puja: <strong>{waitingBooking.pujaType}</strong></div>
                <div className="text-sm text-gray-600 mb-4">Location: <strong>{waitingBooking.city}</strong></div>
                <p className="text-xs text-gray-400 mb-5">Waiting for acceptance. Please wait...</p>
                <button
                  onClick={() => setWaitingBooking(null)}
                  className="w-full py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ BOOKING MODAL ═══ */}
        {bookingModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Book {bookingModal.pandit ? `Pt. ${bookingModal.pandit.firstName}` : 'a Pandit'}</h2>
                <button onClick={() => setBookingModal({ isOpen: false, pandit: null })} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleBookSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Select Puja</label>
                    <select
                      value={bookingForm.pujaType}
                      onChange={(e) => setBookingForm({ ...bookingForm, pujaType: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      required
                    >
                    </select>
                  </div>

                  <div className="bg-orange-50 p-1 rounded-xl border border-orange-200 flex mb-2">
                    <button 
                      type="button"
                      onClick={() => setBookingForm({...bookingForm, pujaMode: 'in-person'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${bookingForm.pujaMode === 'in-person' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      In-Person
                    </button>
                    <button 
                      type="button"
                      onClick={() => setBookingForm({...bookingForm, pujaMode: 'online'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${bookingForm.pujaMode === 'online' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      Online <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded uppercase">-30%</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Address</label>
                    <input
                      type="text"
                      value={bookingForm.address}
                      onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                      placeholder="Enter your complete address"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Special Requirements (Optional)</label>
                    <textarea
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      placeholder="Any specific instructions for the pandit..."
                      rows="2"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    ></textarea>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-xl flex items-center justify-between border border-orange-100">
                    <span className="font-semibold text-orange-800">Booking Fee</span>
                    <div className="text-right">
                      {bookingForm.pujaMode === 'online' && (
                        <div className="text-xs text-orange-400 line-through">₹{(PUJA_PRICES[bookingForm.pujaType] || 1500).toLocaleString()}</div>
                      )}
                      <div className="text-2xl font-bold text-orange-600">
                        ₹{(bookingForm.pujaMode === 'online' ? (PUJA_PRICES[bookingForm.pujaType] || 1500) * 0.7 : (PUJA_PRICES[bookingForm.pujaType] || 1500)).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-colors"
                  >
                    Confirm Booking
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PANDIT ACCEPTED TOAST ═══ */}
        {acceptedBooking && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white rounded-2xl shadow-2xl p-5 flex flex-col gap-3 max-w-sm">
            <div className="flex items-start gap-3">
              <CheckCircle size={22} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Pandit Confirmed!</p>
                <p className="text-sm text-green-100 mb-2">
                  Pt. {acceptedBooking.pandit?.firstName} {acceptedBooking.pandit?.lastName} has accepted your booking for {acceptedBooking.pujaType}.
                </p>
                <p className="text-xs font-semibold bg-green-600/50 p-2 rounded text-white border border-green-400">
                  Please complete the payment to unlock chat and connect with your Pandit.
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => handlePayment(acceptedBooking)}
                disabled={loading}
                className="flex-1 bg-white text-green-700 font-bold py-2 rounded-xl hover:bg-green-50 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay ₹${acceptedBooking.fee?.toLocaleString() || '1,500'} Now`}
              </button>
              <button
                onClick={() => {
                  alert('You can pay later, but chat will be disabled until payment is complete.');
                  setAcceptedBooking(null);
                }}
                className="px-4 text-sm text-white font-medium hover:bg-green-600 rounded-xl transition-colors"
              >
                Pay Later
              </button>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100 text-center">
            <div className="relative inline-block mx-auto mb-3">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-orange-200" />
              ) : (
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {user?.firstName?.charAt(0)}
                </div>
              )}
              <button
                onClick={() => document.getElementById('avatar-upload').click()}
                className="absolute bottom-0 right-0 bg-orange-600 text-white p-1.5 rounded-full shadow-md hover:bg-orange-700 transition-colors"
                title="Upload Profile Picture"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              </button>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>
            <h2 className="font-bold text-gray-800">{user?.firstName} {user?.lastName}</h2>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            {user?.city && (
              <div className="flex items-center justify-center gap-1 mt-1 text-xs text-orange-600 font-medium">
                <MapPin size={12} /> {user.city}
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('discover')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'discover' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Search size={20} /> Find Pandit
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'bookings' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Calendar size={20} /> My Bookings
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'chat' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <MessageSquare size={20} /> Messages
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'payments' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <CheckCircle size={20} /> Bookings & Payments
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'support' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <HeadphonesIcon size={20} /> Support
            </button>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between">
            <h1 className="text-xl font-bold text-gray-800">
              {activeTab === 'discover' && 'Discover Pandits'}
              {activeTab === 'bookings' && 'My Bookings'}
              {activeTab === 'chat' && 'Messages'}
              {activeTab === 'payments' && 'My Bookings & Payments'}
              {activeTab === 'support' && 'Help & Support'}
            </h1>
            {activeTab === 'discover' && (
              <button
                onClick={handleLocationRequest}
                disabled={loading}
                className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-sm font-bold border border-orange-100 hover:bg-orange-100 transition-colors"
              >
                <Navigation size={16} /> Use My Location
              </button>
            )}
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            {activeTab === 'discover' && (
              <div>
                {/* Location banner */}
                {!loading && locationMessage && (
                  <div className={`flex items-start gap-3 p-4 rounded-2xl mb-6 border ${isLocal ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                    {isLocal
                      ? <CheckCircle size={20} className="text-green-500 mt-0.5 shrink-0" />
                      : <AlertCircle size={20} className="text-amber-500 mt-0.5 shrink-0" />
                    }
                    <div>
                      <p className="font-semibold text-sm">{isLocal ? `Pandits available near you!` : `No pandits in ${user?.city}`}</p>
                      <p className="text-xs mt-0.5 opacity-80">{locationMessage}</p>
                    </div>
                  </div>
                )}

                {/* Section title */}
                {!loading && !isLocal && pandits.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <BadgeCheck size={20} className="text-orange-500" />
                    <h2 className="font-bold text-gray-700">Top Trusted Pandits from Major Cities</h2>
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                  </div>
                ) : pandits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={36} className="text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Pandits Available</h3>
                    <p className="text-gray-500 max-w-sm">We couldn't find any pandits at the moment. Please try again later.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pandits.map(pandit => (
                      <div key={pandit._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
                        {!isLocal && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                            <BadgeCheck size={12} /> Trusted
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl">
                            {pandit.firstName?.charAt(0)}
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                            <Star size={16} fill="currentColor" /> 4.8
                          </div>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">Pt. {pandit.firstName} {pandit.lastName}</h3>
                        <div className="flex items-center flex-wrap gap-1 text-gray-500 text-sm mt-1 mb-3">
                          <MapPin size={14} />
                          <span>{pandit.city}</span>
                          {pandit.distance !== undefined && (
                            <span className="ml-1 text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-md">
                              {pandit.distance < 1 ? '< 1' : Math.round(pandit.distance)} km away
                            </span>
                          )}
                          {!isLocal && !pandit.distance && <span className="ml-1 text-orange-500 font-medium">(Nearby City)</span>}
                        </div>
                        <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg min-h-[40px]">
                          <span className="font-semibold text-gray-700">Expertise: </span>
                          {pandit.panditProfile?.specializations?.join(', ') || pandit.panditProfile?.specialization || 'All Pujas'}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleOpenBookingModal(pandit._id)}
                            className="flex-1 bg-orange-600 text-white font-bold py-2 rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Book Now
                          </button>
                          <button
                            onClick={() => startChat(pandit)}
                            className="px-4 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                          >
                            <MessageSquare size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                {bookings.length === 0 ? (
                  <div className="text-center py-20">
                    <Calendar size={40} className="text-orange-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">You haven't made any bookings yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Book a pandit from the 'Discover' tab to get started.</p>
                  </div>
                ) : (
                  bookings.map(booking => (
                    <div key={booking._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-lg text-gray-800">
                            {booking.pujaType}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-200' :
                                booking.status === 'completed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                  'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-orange-500" />
                            <span>{booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : '-'} at {booking.scheduledTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-orange-500" />
                            <span className="line-clamp-1">{booking.pujaMode === 'online' ? 'Online/Virtual' : booking.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Video size={14} className={booking.pujaMode === 'online' ? 'text-blue-500' : 'text-gray-300'} />
                            <span className={`font-medium ${booking.pujaMode === 'online' ? 'text-blue-600' : 'text-gray-400'}`}>
                              {booking.pujaMode === 'online' ? 'Distance Puja' : 'In-Person'}
                            </span>
                          </div>
                          {booking.videoLink && (
                            <div className="col-span-full mt-2 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs truncate">
                                <Video size={14} /> Link: {booking.videoLink}
                              </div>
                              <a href={booking.videoLink} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors">Join Now</a>
                            </div>
                          )}
                          {booking.pandit && (
                            <div className="flex items-center gap-2 col-span-full pt-1">
                              <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                                {booking.pandit.firstName?.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-700">Pandit: Pt. {booking.pandit.firstName} {booking.pandit.lastName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {booking.pandit && booking.paymentStatus === 'paid' && (
                          <button
                            onClick={() => startChat(booking.pandit)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-lg hover:bg-orange-100 transition-colors text-xs"
                          >
                            <MessageSquare size={14} /> Chat
                          </button>
                        )}
                        {(booking.status === 'completed' || booking.status === 'rejected' || booking.status === 'cancelled') && (
                          <button
                            onClick={() => deleteBooking(booking._id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 font-bold rounded-lg hover:bg-gray-100 transition-colors text-xs"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex h-full gap-6">
                <div className="w-1/3 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-gray-100 font-bold text-gray-800">Recent Chats</div>
                  <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 text-center">No recent conversations. Find a Pandit to start chatting!</div>
                    ) : (
                      conversations.map(c => (
                        <div
                          key={c._id}
                          onClick={() => setSelectedChatUser(c)}
                          className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${selectedChatUser?._id === c._id ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                        >
                          <div className="font-bold text-gray-800">{c.firstName} {c.lastName}</div>
                          <div className="text-xs text-orange-600 capitalize mt-1">{c.role}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="w-2/3">
                  <ChatInterface otherUser={selectedChatUser} />
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <SupportCare userRole="devotee" />
            )}

            {activeTab === 'payments' && (
              <div className="max-w-4xl mx-auto space-y-8">

                {/* Active / Unpaid Bookings */}
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Active & Unpaid Bookings</h2>
                  {bookings.filter(b => b.status === 'confirmed' && b.paymentStatus === 'pending').length === 0 ? (
                    <p className="text-gray-500 text-sm">No pending payments for any active bookings.</p>
                  ) : (
                    <div className="space-y-4">
                      {bookings.filter(b => b.status === 'confirmed' && b.paymentStatus === 'pending').map(booking => (
                        <div key={booking._id} className="bg-orange-50 rounded-2xl p-6 border border-orange-200 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle size={18} className="text-orange-600" />
                              <div className="font-bold text-orange-800 text-lg">
                                Pt. {booking.pandit?.firstName} {booking.pandit?.lastName}
                              </div>
                            </div>
                            <div className="text-sm text-orange-700">
                              <strong>{booking.pujaType}</strong> • {new Date(booking.scheduledDate || booking.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-orange-600 mt-1">Payment required to unlock chat</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-orange-800 mb-2">₹{booking.fee?.toLocaleString() || '1,500'}</div>
                            <button
                              onClick={() => handlePayment(booking)}
                              disabled={loading}
                              className="bg-orange-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                              {loading ? 'Processing...' : 'Pay Now'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment History */}
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Past Transactions</h2>
                  {payments.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-gray-200">
                      <CheckCircle size={40} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No payment history found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {payments.map(payment => (
                        <div key={payment._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-800 text-lg mb-1">
                              Pt. {payment.pandit?.firstName} {payment.pandit?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Date: {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Transaction ID: {payment.razorpayPaymentId}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">₹{(payment.amount / 100).toLocaleString()}</div>
                            <div className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">SUCCESS</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* ═══ BOOKING MODAL ═══ */}
        {bookingModal.isOpen && bookingModal.pandit && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
              <button
                onClick={() => setBookingModal({ isOpen: false, pandit: null })}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <X size={24} />
              </button>
              <div className="bg-orange-50 p-6 border-b border-orange-100">
                <h2 className="text-2xl font-bold text-gray-800">Book Pandit</h2>
                <p className="text-orange-600 font-medium">Pt. {bookingModal.pandit.firstName} {bookingModal.pandit.lastName}</p>
              </div>
              <form onSubmit={handleBookSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Select Puja</label>
                  <select
                    required
                    value={bookingForm.pujaType}
                    onChange={(e) => setBookingForm({ ...bookingForm, pujaType: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    {Object.keys(PUJA_PRICES).map(puja => (
                      <option key={puja} value={puja}>{puja} - ₹{PUJA_PRICES[puja].toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Time</label>
                    <div className="relative">
                      <Clock size={18} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="time"
                        required
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Address</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={bookingForm.address}
                      onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                      placeholder="Enter complete address"
                      className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Additional Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="Any specific requirements..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
                  >
                    Confirm Booking • ₹{PUJA_PRICES[bookingForm.pujaType].toLocaleString()}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default DevoteeDashboard;

