import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import {
  HeadphonesIcon, MessageCircle, ChevronDown, ChevronUp,
  Send, CheckCircle, Phone, Mail, BookOpen, AlertCircle,
  Zap, Shield, CreditCard, Calendar, User, ExternalLink,
  Ticket, Clock, RefreshCw, CheckSquare, XSquare, Inbox
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const faqs = [
  {
    category: 'Booking',
    icon: Calendar,
    color: 'orange',
    questions: [
      { q: 'How do I book a Pandit?', a: 'Go to the "Find Pandit" tab, browse available Pandits in your city, and click "Book Now" on any Pandit\'s card. Fill in the puja details, date, time, and address, then confirm.' },
      { q: 'Can I cancel a booking?', a: 'You can cancel a pending booking by going to "My Bookings" tab. Once a Pandit has accepted and payment is made, please contact support to discuss cancellation options.' },
      { q: 'What if no Pandit is available in my city?', a: 'We will show you trusted Pandits from nearby cities. You can also use "Use My Location" to find the closest available Pandits.' },
    ]
  },
  {
    category: 'Payments',
    icon: CreditCard,
    color: 'green',
    questions: [
      { q: 'When do I pay?', a: 'Payment is made after a Pandit accepts your booking. Payment unlocks the chat feature so you can coordinate directly with your Pandit.' },
      { q: 'What payment methods are supported?', a: 'We use Razorpay which supports UPI, Credit/Debit Cards, Net Banking, and Wallets. All transactions are secure and encrypted.' },
      { q: 'I made a payment but it failed. What happens?', a: 'If your payment was deducted but the transaction shows failed, the amount will be automatically refunded within 5-7 business days. Contact support with your booking ID for faster resolution.' },
    ]
  },
  {
    category: 'Account',
    icon: User,
    color: 'blue',
    questions: [
      { q: 'How do I update my profile picture?', a: 'Click the camera icon on your profile avatar in the sidebar. Select any image and it will be uploaded automatically.' },
      { q: 'I forgot my password. How do I reset it?', a: 'Please log out and click "Forgot Password" on the Login page. A reset link will be sent to your registered email.' },
    ]
  },
  {
    category: 'Technical',
    icon: Zap,
    color: 'purple',
    questions: [
      { q: 'Chat is not working. What should I do?', a: 'Ensure payment is completed for the booking — chat is locked until payment. Also check your internet connection. If the issue persists, try refreshing the page.' },
      { q: 'The app is slow or not loading.', a: 'Try clearing your browser cache and refreshing. If the problem continues, please report it using the contact form below.' },
    ]
  },
];

const contactChannels = [
  { icon: Mail, label: 'Email Support', value: 'support@panditji.com', href: 'mailto:support@panditji.com', color: 'orange' },
  { icon: Phone, label: 'Call Us', value: '+91 98765 43210', href: 'tel:+919876543210', color: 'green' },
  { icon: MessageCircle, label: 'WhatsApp', value: 'Chat on WhatsApp', href: 'https://wa.me/919876543210', color: 'emerald' },
];

const colorMap = {
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
};

const statusConfig = {
  open: { label: 'Open', badge: 'bg-yellow-100 text-yellow-700', icon: Inbox },
  in_progress: { label: 'In Progress', badge: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  resolved: { label: 'Resolved', badge: 'bg-green-100 text-green-700', icon: CheckSquare },
  closed: { label: 'Closed', badge: 'bg-gray-100 text-gray-600', icon: XSquare },
};

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 ${open ? 'shadow-md' : 'shadow-sm'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left gap-3">
        <span className="font-semibold text-gray-800 text-sm">{question}</span>
        {open ? <ChevronUp size={18} className="text-orange-500 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 bg-orange-50 border-t border-orange-100">
          <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

const SupportCare = ({ userRole = 'devotee' }) => {
  const { token, user } = useAuthStore();
  const [view, setView] = useState('faq'); // 'faq' | 'submit' | 'mytickets'
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'Booking', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [replyNotification, setReplyNotification] = useState(null);

  const fetchMyTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await axios.get(`${API}/support/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTickets(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  // Socket: listen for admin replies in real-time
  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.on('connect', () => {
      socket.emit('join', { userId: user._id || user.id, role: userRole });
    });
    socket.on('supportTicketReplied', (data) => {
      setReplyNotification(data);
      // If user is on My Tickets tab, refresh it
      setMyTickets(prev => prev.map(t =>
        t._id === data.ticketId
          ? { ...t, adminReply: data.adminReply, status: data.status, repliedAt: data.repliedAt }
          : t
      ));
      // Clear notification after 6 seconds
      setTimeout(() => setReplyNotification(null), 6000);
    });
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    if (view === 'mytickets') fetchMyTickets();
  }, [view]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/support`, ticketForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmitted(true);
      setTicketForm({ subject: '', category: 'Booking', message: '' });
      setTimeout(() => {
        setSubmitted(false);
        setView('mytickets');
      }, 2500);
    } catch (err) {
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const allCategories = ['All', ...faqs.map(f => f.category)];
  const visibleFaqs = activeCategory === 'All' ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Real-time Admin Reply Notification ── */}
      {replyNotification && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-orange-200 rounded-2xl shadow-2xl p-5 max-w-sm w-full animate-bounce-once">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
              <HeadphonesIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm">Support Team Replied!</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">Re: {replyNotification.subject}</p>
              <p className="text-sm text-gray-700 mt-1 line-clamp-2">{replyNotification.adminReply}</p>
            </div>
            <button onClick={() => setReplyNotification(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0">×</button>
          </div>
          <button
            onClick={() => { setView('mytickets'); setReplyNotification(null); }}
            className="mt-3 w-full py-2 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition-colors"
          >
            View Reply in My Tickets
          </button>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <HeadphonesIcon size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Support Center</h2>
            <p className="text-orange-100 text-sm">We're here to help you 24/7</p>
          </div>
        </div>
        <p className="text-orange-100 text-sm leading-relaxed max-w-xl">
          {userRole === 'devotee'
            ? 'Find answers about bookings, payments, and connecting with the right Pandit for your puja.'
            : 'Get help with bookings, subscription, earnings, and serving devotees better.'}
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {contactChannels.map(({ icon: Icon, label, value, href, color }) => {
          const c = colorMap[color];
          return (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-4 p-4 rounded-2xl border ${c.bg} ${c.border} hover:shadow-md transition-all group`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.badge}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className={`text-sm font-bold ${c.text} truncate`}>{value}</p>
              </div>
              <ExternalLink size={14} className="text-gray-400 group-hover:text-gray-600 shrink-0" />
            </a>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl">
        {[
          { key: 'faq', label: 'FAQs', icon: BookOpen },
          { key: 'submit', label: 'Submit a Ticket', icon: Send },
          { key: 'mytickets', label: 'My Tickets', icon: Ticket },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setView(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              view === key ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* FAQ View */}
      {view === 'faq' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              {allCategories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    activeCategory === cat ? 'bg-orange-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 space-y-6">
            {visibleFaqs.map(({ category, icon: Icon, color, questions }) => {
              const c = colorMap[color];
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>
                      <Icon size={13} /> {category}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {questions.map(({ q, a }) => <FAQItem key={q} question={q} answer={a} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Ticket View */}
      {view === 'submit' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <AlertCircle size={22} className="text-orange-500" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Submit a Support Ticket</h3>
              <p className="text-xs text-gray-500 mt-0.5">Our team will respond within 24 hours.</p>
            </div>
          </div>
          <div className="p-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-lg font-bold text-gray-800">Ticket Submitted!</h4>
                <p className="text-gray-500 text-sm max-w-sm">
                  Your ticket has been saved. We'll respond within 24 hours. Redirecting to your tickets...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                    <input type="text" required value={ticketForm.subject}
                      onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                    <select value={ticketForm.category}
                      onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition">
                      <option>Booking</option>
                      <option>Payments</option>
                      <option>Account</option>
                      <option>Technical</option>
                      {userRole === 'pandit' && <option>Subscription</option>}
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Describe Your Issue</label>
                  <textarea required rows={5} value={ticketForm.message}
                    onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder="Please describe the issue in detail. Include any booking IDs or error messages..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition resize-none" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Shield size={14} />
                    <span>Your information is private and secure.</span>
                  </div>
                  <button type="submit" disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50">
                    {submitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
                    {submitting ? 'Sending...' : 'Send Ticket'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* My Tickets View */}
      {view === 'mytickets' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ticket size={22} className="text-orange-500" />
              <h3 className="text-lg font-bold text-gray-800">My Support Tickets</h3>
            </div>
            <button onClick={fetchMyTickets} className="flex items-center gap-1.5 text-sm text-orange-600 font-semibold hover:text-orange-700">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
          <div className="p-6">
            {loadingTickets ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox size={28} className="text-orange-300" />
                </div>
                <p className="text-gray-500 font-medium">No tickets submitted yet.</p>
                <button onClick={() => setView('submit')}
                  className="mt-4 px-5 py-2 bg-orange-600 text-white font-bold rounded-xl text-sm hover:bg-orange-700 transition-colors">
                  Submit Your First Ticket
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map(ticket => {
                  const s = statusConfig[ticket.status] || statusConfig.open;
                  const StatusIcon = s.icon;
                  return (
                    <div key={ticket._id} className="border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h4 className="font-bold text-gray-800">{ticket.subject}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{ticket.category}</span>
                            <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${s.badge}`}>
                          <StatusIcon size={11} /> {s.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{ticket.message}</p>
                      {ticket.adminReply && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-3">
                          <p className="text-xs font-bold text-orange-700 mb-1 flex items-center gap-1">
                            <HeadphonesIcon size={12} /> Support Team Reply
                          </p>
                          <p className="text-sm text-gray-700">{ticket.adminReply}</p>
                          {ticket.repliedAt && (
                            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                              <Clock size={10} /> {new Date(ticket.repliedAt).toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportCare;
