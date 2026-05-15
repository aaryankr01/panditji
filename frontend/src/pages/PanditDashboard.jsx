import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  LogOut, Calendar, MessageSquare, CheckCircle, XCircle,
  MapPin, Clock, Bell, Phone, User, AlertCircle, Trash2, HeadphonesIcon
} from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import SupportCare from '../components/SupportCare';

const SOCKET_URL = 'http://localhost:5000';
const API = 'http://localhost:5000/api';

const PanditDashboard = () => {
  const { user, token, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [incomingRequest, setIncomingRequest] = useState(null); // Ola-style popup
  const [accepting, setAccepting] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [daysToExpiry, setDaysToExpiry] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('active'); // active, warning, inactive
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!token || user?.role !== 'pandit') { navigate('/'); return; }

    // Fetch existing bookings
    axios.get(`${API}/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setBookings(r.data.data)).catch(console.error);

    axios.get(`${API}/chat/conversations/list`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setConversations(r.data.data)).catch(console.error);

    axios.get(`${API}/payments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        const payments = r.data.data;
        const sum = payments.reduce((acc, curr) => acc + (curr.panditEarnings || 0), 0);
        setTotalEarnings(sum / 100); // Convert paise to INR
      }).catch(console.error);

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/pandits/my-profile`, { headers: { Authorization: `Bearer ${token}` } });
        const data = res.data.data;
        setProfileData(data);
        
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

    // Connect socket
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', { userId: user._id, role: 'pandit', city: user.city });
    });

    // NEW BOOKING BROADCAST — Ola/Uber style
    socket.on('newBookingRequest', (booking) => {
      setIncomingRequest(booking);
      setCountdown(30);
    });

    // Booking was taken by another pandit
    socket.on('bookingTaken', ({ bookingId }) => {
      setIncomingRequest(prev => prev?._id === bookingId ? null : prev);
    });

    return () => socket.disconnect();
  }, [token, user, navigate]);

  // Countdown timer when popup shows
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
      const res = await axios.patch(
        `${API}/bookings/${bookingId}/accept`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const accepted = res.data.data;
      
      // Update the booking in the list
      setBookings(prev => {
        const exists = prev.find(b => b._id === bookingId);
        if (exists) {
          return prev.map(b => b._id === bookingId ? accepted : b);
        }
        return [accepted, ...prev];
      });

      // Auto-open chat with devotee
      setSelectedChatUser(accepted.devotee);
      setActiveTab('chat');
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
      await axios.patch(`${API}/bookings/${bookingId}/status`, 
        { status: 'rejected' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.patch(`${API}/bookings/${bookingId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status } : b));
    } catch { alert('Failed to update status'); }
  };

  const handleSubscriptionPayment = async () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    script.onload = async () => {
      try {
        const { data } = await axios.post(`${API}/payments/create-subscription-order`, {}, { headers: { Authorization: `Bearer ${token}` } });
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
              const verifyRes = await axios.post(`${API}/payments/verify-subscription`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }, { headers: { Authorization: `Bearer ${token}` } });

              if (verifyRes.data.success) {
                alert('Subscription successful!');
                window.location.reload(); // Refresh to clear inactive state
              }
            } catch (err) { alert('Verification failed.'); }
          },
          prefill: { name: `${user.firstName} ${user.lastName}`, email: user.email || '' },
          theme: { color: '#ea580c' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) { alert('Error processing subscription payment'); }
    };
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking from your history?')) return;
    try {
      await axios.delete(`${API}/bookings/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(bookings.filter(b => b._id !== bookingId));
    } catch { alert('Failed to delete booking'); }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans relative">

      {/* ═══ INCOMING BOOKING POPUP (Ola/Uber style) ═══ */}
      {incomingRequest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Orange header */}
            <div className="bg-orange-600 text-white p-5 text-center relative">
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-bold text-sm">
                {countdown}s
              </div>
              <Bell size={28} className="mx-auto mb-2 animate-bounce" />
              <h2 className="text-xl font-bold">New Puja Request!</h2>
              <p className="text-orange-100 text-sm mt-1">Accept before someone else does</p>
            </div>

            {/* Countdown bar */}
            <div className="h-1.5 bg-orange-100">
              <div
                className="h-full bg-orange-500 transition-all duration-1000"
                style={{ width: `${(countdown / 30) * 100}%` }}
              />
            </div>

            {/* Booking details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl">
                  {incomingRequest.devotee?.firstName?.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">
                    {incomingRequest.devotee?.firstName} {incomingRequest.devotee?.lastName}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Phone size={13} /> {incomingRequest.devotee?.phone}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User size={15} className="text-orange-500" />
                  <span className="font-semibold text-gray-700">Puja:</span>
                  <span className="text-gray-600">{incomingRequest.pujaType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={15} className="text-orange-500" />
                  <span className="font-semibold text-gray-700">Date & Time:</span>
                  <span className="text-gray-600">
                    {incomingRequest.scheduledDate ? new Date(incomingRequest.scheduledDate).toLocaleDateString() : '-'} at {incomingRequest.scheduledTime}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={15} className="text-orange-500 mt-0.5 shrink-0" />
                  <span className="font-semibold text-gray-700">Address:</span>
                  <span className="text-gray-600">{incomingRequest.address}</span>
                </div>
                {incomingRequest.notes && (
                  <div className="text-sm text-gray-500 italic border-t border-gray-200 pt-3">
                    "{incomingRequest.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={declineRequest}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={20} /> Decline
              </button>
              <button
                onClick={() => handleAccept(incomingRequest._id)}
                disabled={accepting}
                className="flex-1 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                {accepting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><CheckCircle size={20} /> Accept</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SIDEBAR ═══ */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100 text-center">
          <div className="relative inline-block mx-auto mb-3">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-orange-200" />
            ) : (
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                {user?.firstName?.charAt(0)}
              </div>
            )}
            <button 
              onClick={() => document.getElementById('avatar-upload').click()}
              className="absolute bottom-0 right-0 bg-orange-600 text-white p-1.5 rounded-full shadow-md hover:bg-orange-700 transition-colors border border-white"
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
          <h2 className="font-bold text-gray-800">Pt. {user?.firstName} {user?.lastName}</h2>
          <p className="text-xs text-orange-600 font-bold capitalize mt-1 border border-orange-200 bg-orange-50 inline-block px-2 py-1 rounded-full">{user?.role}</p>
          {user?.city && (
            <div className="flex items-center justify-center gap-1 mt-1 text-xs text-gray-500">
              <MapPin size={11} /> {user.city}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total Earnings</p>
            <p className="text-2xl font-black text-green-600">₹{totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'bookings' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Calendar size={20} /> My Bookings
            {bookings.filter(b => b.status === 'pending').length > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'chat' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
            <MessageSquare size={20} /> Messages
          </button>
          <button onClick={() => setActiveTab('support')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'support' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
            <HeadphonesIcon size={20} /> Support
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            {activeTab === 'bookings' ? 'Booking Requests' : activeTab === 'chat' ? 'Messages' : 'Help & Support'}
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {subscriptionStatus === 'inactive' ? (
              <span className="text-red-600 flex items-center gap-1"><XCircle size={14}/> Offline — Subscription Expired</span>
            ) : (
              <span className="text-green-600 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Online — Receiving Requests</span>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          
          {/* SUBSCRIPTION ALERTS */}
          {subscriptionStatus === 'inactive' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-red-800 text-lg">Subscription Inactive</h3>
                  <p className="text-red-700 text-sm mt-0.5">Your profile is hidden from Devotees. You cannot receive or accept new bookings.</p>
                </div>
              </div>
              <button onClick={handleSubscriptionPayment} className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shrink-0 shadow-sm">
                Pay ₹500 to Activate
              </button>
            </div>
          )}

          {subscriptionStatus === 'warning' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-yellow-800 text-lg">Subscription Expiring Soon</h3>
                  <p className="text-yellow-700 text-sm mt-0.5">Your subscription expires in {daysToExpiry} days. Renew now to stay visible to Devotees.</p>
                </div>
              </div>
              <button onClick={handleSubscriptionPayment} className="px-6 py-2.5 bg-yellow-600 text-white font-bold rounded-xl hover:bg-yellow-700 transition-colors shrink-0 shadow-sm">
                Renew for ₹500
              </button>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {bookings.length === 0 ? (
                <div className="text-center py-20">
                  <Bell size={40} className="text-orange-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No booking requests yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Requests from your city will appear here instantly.</p>
                </div>
              ) : (
                bookings.map(booking => (
                  <div key={booking._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-bold text-lg text-gray-800">
                          {booking.devotee?.firstName} {booking.devotee?.lastName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>{booking.status}</span>
                      </div>
                      <div className="text-sm text-gray-600 grid grid-cols-2 gap-x-8 gap-y-1.5">
                        <div><span className="font-semibold text-gray-700">Puja:</span> {booking.pujaType}</div>
                        <div><span className="font-semibold text-gray-700">Date:</span> {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : '-'} {booking.scheduledTime && `at ${booking.scheduledTime}`}</div>
                        <div className="col-span-2"><span className="font-semibold text-gray-700">Address:</span> {booking.address}</div>
                      </div>
                    </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedChatUser(booking.devotee); setActiveTab('chat'); }}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-lg hover:bg-orange-100 transition-colors text-sm"
                        >
                          <MessageSquare size={16} /> Chat
                        </button>

                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReject(booking._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors text-sm"
                            >
                              <XCircle size={16} /> Reject
                            </button>
                            <button
                              onClick={() => handleAccept(booking._id)}
                              disabled={accepting}
                              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 font-bold rounded-lg hover:bg-green-100 transition-colors text-sm shadow-sm"
                            >
                              {accepting ? (
                                  <span className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                  <><CheckCircle size={16} /> Accept</>
                              )}
                            </button>
                          </>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 font-bold rounded-lg hover:bg-green-100 transition-colors text-sm"
                          >
                            <CheckCircle size={16} /> Complete
                          </button>
                        )}

                        {(booking.status === 'completed' || booking.status === 'rejected') && (
                          <button
                            onClick={() => deleteBooking(booking._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors text-sm"
                            title="Delete History"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        )}
                      </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex h-full gap-6 max-w-6xl mx-auto">
              <div className="w-1/3 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 font-bold text-gray-800">Conversations</div>
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">No conversations yet. Accept a booking to start chatting!</div>
                  ) : (
                    conversations.map(c => (
                      <div key={c._id} onClick={() => setSelectedChatUser(c)}
                        className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${selectedChatUser?._id === c._id ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
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
            <SupportCare userRole="pandit" />
          )}
        </main>
      </div>
    </div>
  );
};

export default PanditDashboard;
