import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import {
  Headphones, MessageCircle, ChevronDown, ChevronUp,
  Send, CheckCircle, Phone, Mail, BookOpen, AlertCircle,
  Zap, Shield, CreditCard, Calendar, User, ExternalLink,
  Ticket, Clock, RefreshCw, XCircle, Inbox
} from 'lucide-react';

const API = 'http://localhost:5000/api';

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

const SectionTitle = ({ children }) => (
  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.maroon, marginBottom: 16, borderBottom: `2px solid ${C.border}`, paddingBottom: 8 }}>{children}</h2>
);
const lbl = { display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 6 };
const inp = { width: '100%', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', background: C.surface, fontFamily: "'Poppins',sans-serif", color: C.text };
const sel = { ...inp, cursor: 'pointer' };

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
  { icon: Mail, label: 'Email Support', value: 'support@panditji.com', href: 'mailto:support@panditji.com', bg: C.saffronLt, text: C.saffron, border: C.saffron },
  { icon: Phone, label: 'Call Us', value: '+91 98765 43210', href: 'tel:+919876543210', bg: C.successLt, text: C.success, border: C.success },
  { icon: MessageCircle, label: 'WhatsApp', value: 'Chat on WhatsApp', href: 'https://wa.me/919876543210', bg: C.purpleLt, text: C.purple, border: C.purple },
];

const statusConfig = {
  open: { label: 'Open', bg: C.goldLt, text: C.gold, icon: Inbox },
  in_progress: { label: 'In Progress', bg: C.purpleLt, text: C.purple, icon: RefreshCw },
  resolved: { label: 'Resolved', bg: C.successLt, text: C.success, icon: CheckCircle },
  closed: { label: 'Closed', bg: C.maroonLt, text: C.maroon, icon: XCircle },
};

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s', marginBottom: 8, background: '#fff' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: open ? C.surface : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
        <span style={{ fontWeight: 700, color: C.maroon, fontSize: 14 }}>{question}</span>
        {open ? <ChevronUp size={18} color={C.saffron} style={{ flexShrink: 0 }} /> : <ChevronDown size={18} color={C.textMuted} style={{ flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ padding: '0 20px 16px', background: C.surface }}>
          <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>{answer}</p>
        </div>
      )}
    </div>
  );
};

const SupportCare = ({ userRole = 'devotee' }) => {
  const { token, user } = useAuthStore();
  const [view, setView] = useState('faq');
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

  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.on('connect', () => {
      socket.emit('join', { userId: user._id || user.id, role: userRole });
    });
    socket.on('supportTicketReplied', (data) => {
      setReplyNotification(data);
      setMyTickets(prev => prev.map(t =>
        t._id === data.ticketId
          ? { ...t, adminReply: data.adminReply, status: data.status, repliedAt: data.repliedAt }
          : t
      ));
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {replyNotification && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200, background: '#fff', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.18)', border: `1.5px solid ${C.saffron}`, maxWidth: 340, overflow: 'hidden' }}>
          <div style={{ background: C.saffron, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Headphones size={20} color="#fff" />
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>Support Team Replied!</span>
            </div>
            <button onClick={() => setReplyNotification(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: C.textMuted }}>Re: {replyNotification.subject}</p>
            <p style={{ fontSize: 13, color: C.textMid, marginTop: 4, marginBottom: 12 }}>{replyNotification.adminReply}</p>
            <button className="dd-btn dd-btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
              onClick={() => { setView('mytickets'); setReplyNotification(null); }}>
              View in My Tickets
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div style={{ background: `linear-gradient(135deg, ${C.maroon} 0%, ${C.purple} 100%)`, borderRadius: 16, padding: '32px', color: '#fff', boxShadow: '0 10px 30px rgba(123,29,14,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Headphones size={28} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Support Center</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>We're here to help you 24/7</p>
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 600, lineHeight: 1.5 }}>
          {userRole === 'devotee'
            ? 'Find answers about bookings, payments, and connecting with the right Pandit for your puja.'
            : 'Get help with bookings, subscription, earnings, and serving devotees better.'}
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {contactChannels.map(({ icon: Icon, label, value, href, bg, text, border }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: '#fff', borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.2s, box-shadow 0.2s', ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, color: text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: C.maroon, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
            </div>
            <ExternalLink size={14} color={C.border} />
          </a>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, background: C.saffronLt, padding: 6, borderRadius: 16, border: `1px solid ${C.border}` }}>
        {[
          { key: 'faq', label: 'FAQs', icon: BookOpen },
          { key: 'submit', label: 'Submit Ticket', icon: Send },
          { key: 'mytickets', label: 'My Tickets', icon: Ticket },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setView(key)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
              background: view === key ? '#fff' : 'transparent',
              color: view === key ? C.saffron : C.textMid,
              boxShadow: view === key ? '0 2px 8px rgba(232,113,10,0.1)' : 'none'
            }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* FAQ View */}
      {view === 'faq' && (
        <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 16px', borderRadius: 20, border: `1px solid ${activeCategory === cat ? C.saffron : C.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
                  background: activeCategory === cat ? C.saffron : C.surface,
                  color: activeCategory === cat ? '#fff' : C.textMid
                }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {visibleFaqs.map(({ category, icon: Icon, color, questions }) => (
              <div key={category}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', background: C.saffronLt, color: C.saffron, padding: '4px 12px', borderRadius: 20 }}>
                    <Icon size={12} /> {category}
                  </span>
                </div>
                <div>
                  {questions.map(({ q, a }) => <FAQItem key={q} question={q} answer={a} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Ticket View */}
      {view === 'submit' && (
        <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={24} color={C.saffron} />
            <div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.maroon }}>Submit a Support Ticket</h3>
              <p style={{ fontSize: 12, color: C.textMuted }}>Our team will respond within 24 hours.</p>
            </div>
          </div>
          <div style={{ padding: 24 }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.successLt, color: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle size={32} />
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: C.maroon, marginBottom: 8 }}>Ticket Submitted!</h4>
                <p style={{ fontSize: 14, color: C.textMid }}>Your ticket has been saved. We'll respond within 24 hours. Redirecting...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={lbl}>Subject</label>
                    <input type="text" required value={ticketForm.subject}
                      onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      placeholder="Brief description" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Category</label>
                    <select value={ticketForm.category}
                      onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })} style={sel}>
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
                  <label style={lbl}>Describe Your Issue</label>
                  <textarea required rows={5} value={ticketForm.message}
                    onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder="Include any booking IDs or error messages..." style={{ ...inp, resize: 'none' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textMuted }}>
                    <Shield size={14} /> Your information is private and secure.
                  </div>
                  <button type="submit" disabled={submitting} className="dd-btn dd-btn-maroon" style={{ padding: '12px 24px', fontSize: 14 }}>
                    {submitting ? <span className="spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> : <Send size={16} />}
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
        <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Ticket size={24} color={C.saffron} />
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.maroon }}>My Tickets</h3>
            </div>
            <button onClick={fetchMyTickets} style={{ background: 'transparent', border: 'none', color: C.saffron, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
          <div style={{ padding: 24 }}>
            {loadingTickets ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <span className="spin" style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTopColor: C.saffron, borderRadius: '50%', display: 'inline-block' }} />
              </div>
            ) : myTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.saffronLt, color: C.saffron, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Inbox size={32} />
                </div>
                <p style={{ fontSize: 14, color: C.textMid, fontWeight: 600, marginBottom: 16 }}>No tickets submitted yet.</p>
                <button className="dd-btn dd-btn-primary" onClick={() => setView('submit')}>Submit Your First Ticket</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {myTickets.map(ticket => {
                  const s = statusConfig[ticket.status] || statusConfig.open;
                  const StatusIcon = s.icon;
                  return (
                    <div key={ticket._id} style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, background: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <div>
                          <h4 style={{ fontWeight: 800, fontSize: 15, color: C.maroon }}>{ticket.subject}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <span style={{ fontSize: 11, background: C.surface, padding: '2px 8px', borderRadius: 12, color: C.textMid, fontWeight: 600 }}>{ticket.category}</span>
                            <span style={{ fontSize: 11, color: C.textMuted }}>{new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, background: s.bg, color: s.text, padding: '4px 10px', borderRadius: 20, flexShrink: 0 }}>
                          <StatusIcon size={12} /> {s.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.5 }}>{ticket.message}</p>
                      {ticket.booking && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div>
                            <span style={{ fontWeight: 700, color: C.maroon }}>Linked Booking: </span>
                            <span style={{ fontWeight: 600, color: C.text }}>{ticket.booking.pujaType}</span>
                            <span style={{ color: C.textMuted }}> (₹{ticket.booking.fee?.toLocaleString()})</span>
                          </div>
                          <span className={`dd-badge dd-badge-${ticket.booking.status}`} style={{ fontSize: 9.5 }}>
                            {ticket.booking.status}
                          </span>
                        </div>
                      )}
                      {ticket.adminReply && (
                        <div style={{ background: C.saffronLt, border: `1px solid ${C.saffron}`, borderRadius: 10, padding: 16, marginTop: 16 }}>
                          <p style={{ fontSize: 12, fontWeight: 800, color: C.saffronDk, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Headphones size={14} /> Support Team Reply
                          </p>
                          <p style={{ fontSize: 13, color: C.textMid }}>{ticket.adminReply}</p>
                          {ticket.repliedAt && (
                            <p style={{ fontSize: 11, color: C.textMuted, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={12} /> {new Date(ticket.repliedAt).toLocaleString('en-IN')}
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
