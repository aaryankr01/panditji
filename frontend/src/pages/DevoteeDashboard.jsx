import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useT from '../hooks/useT';
import axios from 'axios';
import { io } from 'socket.io-client';
import { LogOut, MessageSquare, Search, Star, MapPin, AlertCircle, CheckCircle, BadgeCheck, Clock, Navigation, X, Calendar, Headphones, Video, Briefcase, Languages, Users, User } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import SupportCare from '../components/SupportCare';
import LanguageToggle from '../components/common/LanguageToggle';
import ImageCropperModal from '../components/common/ImageCropperModal';
import api from '../utils/api';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PUJA_PRICES = {
  'Rudrabhishek': 3100,
  'Sunderkand Path': 3500,
  'Griha Pravesh': 11,
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

const SectionTitle = ({ children }) => {
  const t = useT();
  return (
    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.maroon, marginBottom: 16, borderBottom: `2px solid ${C.border}`, paddingBottom: 8 }}>
      {children}
    </h2>
  );
};
const lbl = { display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 6 };
const inp = { width: '100%', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', background: C.surface, fontFamily: "'Poppins',sans-serif", color: C.text };
const sel = { ...inp, cursor: 'pointer' };

// *** UPDATE THIS with your real admin phone number (country code + number, no +) ***
const ADMIN_PHONE = '919999999999';

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .dd-root { font-family: 'Poppins', sans-serif; background: #FAF7F2; height: 100vh; display: flex; overflow: hidden; position: relative; }
  .dd-sidebar { width: 236px; background: #FFFFFF; border-right: 1px solid #EAD9CC; display: flex; flex-direction: column; flex-shrink: 0; }
  .dd-sidebar-top { background: linear-gradient(160deg, #7B1D0E 0%, #5B2D8E 100%); padding: 0 0 20px; }
  .dd-brand { display: flex; align-items: center; gap: 10px; padding: 18px 20px 14px; border-bottom: 1px solid rgba(255,255,255,0.12); margin-bottom: 16px; }
  .dd-brand-om { font-size: 26px; line-height: 1; }
  .dd-brand-name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 900; color: #fff; letter-spacing: 0.3px; line-height: 1.1; }
  .dd-brand-sub { font-size: 9px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-top: 2px; }
  .dd-profile-area { text-align: center; padding: 0 20px; }
  .dd-avatar-wrap { position: relative; display: inline-block; margin-bottom: 10px; }
  .dd-avatar-img { width: 62px; height: 62px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.4); }
  .dd-avatar-initials { width: 62px; height: 62px; border-radius: 50%; background: rgba(255,255,255,0.18); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; border: 3px solid rgba(255,255,255,0.3); }
  .dd-cam-btn { position: absolute; bottom: 0; right: 0; width: 22px; height: 22px; border-radius: 50%; background: #E8710A; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .dd-user-name { font-weight: 700; font-size: 14px; color: #fff; }
  .dd-user-city { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 4px; }
  .dd-nav { flex: 1; padding: 8px 12px; }
  .dd-nav-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 14px; border-radius: 10px; font-size: 13.5px; font-weight: 500; color: #6B4C3B; background: transparent; border: none; cursor: pointer; text-align: left; transition: all 0.15s; margin-bottom: 2px; }
  .dd-nav-item:hover { background: #FFF3E8; color: #E8710A; }
  .dd-nav-item.active { background: #FFF3E8; color: #E8710A; font-weight: 700; border-left: 3px solid #E8710A; }
  .dd-nav-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #F9EDE8; flex-shrink: 0; }
  .dd-nav-item.active .dd-nav-icon { background: #E8710A; color: #fff !important; }
  .dd-nav-item:hover .dd-nav-icon { background: #E8710A; color: #fff !important; }
  .dd-logout { padding: 12px 16px; border-top: 1px solid #EAD9CC; }
  .dd-logout-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; color: #A07060; background: transparent; border: none; cursor: pointer; transition: all 0.15s; }
  .dd-logout-btn:hover { background: #FDECEC; color: #C0392B; }
  .dd-topbar { height: 58px; background: #FFFFFF; border-bottom: 1px solid #EAD9CC; display: flex; align-items: center; padding: 0 28px; justify-content: space-between; flex-shrink: 0; }
  .dd-topbar-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #7B1D0E; display: flex; align-items: center; gap: 8px; }
  .dd-topbar-title::before { content: '🕉'; font-size: 18px; }
  .dd-pandit-card { background: #FFFFFF; border-radius: 14px; padding: 22px; border: 1px solid #EAD9CC; box-shadow: 0 2px 8px rgba(123,29,14,0.06); transition: all 0.2s; position: relative; overflow: hidden; }
  .dd-pandit-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #E8710A, #C8960C); }
  .dd-pandit-card:hover { box-shadow: 0 8px 24px rgba(123,29,14,0.12); transform: translateY(-2px); }
  .dd-booking-card { background: #FFFFFF; border-radius: 12px; border: 1px solid #EAD9CC; box-shadow: 0 1px 4px rgba(123,29,14,0.06); transition: box-shadow 0.2s; overflow: hidden; }
  .dd-booking-card:hover { box-shadow: 0 4px 16px rgba(123,29,14,0.10); }
  .dd-badge { display: inline-block; border-radius: 4px; font-size: 10px; font-weight: 800; padding: 3px 10px; text-transform: uppercase; letter-spacing: 0.8px; }
  .dd-badge-pending   { background: #FFF3CD; color: #856404; }
  .dd-badge-confirmed { background: #E8F5EE; color: #1E7D3C; }
  .dd-badge-completed { background: #F3EEFF; color: #5B2D8E; }
  .dd-badge-rejected  { background: #FDECEC; color: #C0392B; }
  .dd-badge-cancelled { background: #F3F4F6; color: #6B7280; }
  .dd-badge-cancellation_requested { background: #FEE2E2; color: #991B1B; }
  .dd-btn { display: inline-flex; align-items: center; gap: 6px; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 13px; border: none; cursor: pointer; border-radius: 8px; padding: 9px 18px; transition: all 0.15s; letter-spacing: 0.2px; }
  .dd-btn:active { transform: scale(0.97); }
  .dd-btn-primary { background: #E8710A; color: #fff; box-shadow: 0 3px 10px rgba(232,113,10,0.30); }
  .dd-btn-primary:hover { background: #C45F06; }
  .dd-btn-ghost { background: #FFF3E8; color: #E8710A; border: 1.5px solid #E8710A; }
  .dd-btn-ghost:hover { background: #ffe3cc; }
  .dd-btn-success { background: #1E7D3C; color: #fff; }
  .dd-btn-danger  { background: #C0392B; color: #fff; }
  .dd-btn-maroon  { background: #7B1D0E; color: #fff; }
  .dd-btn-maroon:hover { background: #5c1208; }
  .dd-puja-pill { display: inline-flex; align-items: center; gap: 5px; background: #FFF8E1; border: 1px solid #E6C87A; color: #7B1D0E; font-size: 12px; font-weight: 600; padding: 5px 14px; border-radius: 24px; cursor: pointer; transition: all 0.15s; }
  .dd-puja-pill:hover { background: #C8960C; color: #fff; border-color: #C8960C; }
  .dd-stat { background: #FFFFFF; border-radius: 12px; border: 1px solid #EAD9CC; padding: 16px 18px; display: flex; align-items: center; gap: 14px; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #FAF7F2; }
  ::-webkit-scrollbar-thumb { background: #EAD9CC; border-radius: 3px; }
  .spin { animation: ddSpin 0.8s linear infinite; }
  @keyframes ddSpin { to { transform: rotate(360deg); } }
  .pulse { animation: ddPulse 1.6s ease-in-out infinite; }
  @keyframes ddPulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
`;

const NavItem = ({ icon, label, tab, activeTab, setActiveTab, onClick }) => (
  <button className={`dd-nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); if (onClick) onClick(); }}>
    <span className="dd-nav-icon" style={{ color: activeTab === tab ? '#fff' : C.saffron }}>{icon}</span>
    {label}
  </button>
);

const StatusBadge = ({ status }) => (
  <span className={`dd-badge dd-badge-${status}`}>{status}</span>
);

// ── Confirmation modal before cancelling an UNPAID booking ──
const ConfirmCancelModal = ({ booking, onConfirm, onClose }) => {
  const t = useT();
  if (!booking) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.72)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 18, maxWidth: 380, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #7B1D0E 0%, #C0392B 100%)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>✕</div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{t('dd_cancel_confirm_title')}</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 900, fontSize: 17, margin: 0 }}>🕉 {booking.pujaType}</h2>
          </div>
        </div>
        {/* Body */}
        <div style={{ padding: '22px 24px' }}>
          <div style={{ background: '#FFF9E0', border: '1px solid #E6C87A', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#856404', fontWeight: 600, marginBottom: 20, lineHeight: 1.6 }}>
            {t('dd_cancel_confirm_msg')}
          </div>
          <div style={{ background: '#fcfaf7', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 13, color: C.textMid, marginBottom: 22, lineHeight: 1.7 }}>
            <div><span style={{ fontWeight: 700, color: C.maroon }}>{t('bap_step_choose')}:</span> {booking.pujaType}</div>
            <div><span style={{ fontWeight: 700, color: C.maroon }}>{t('dd_date')}:</span> {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString('en-IN') : '-'}</div>
            {booking.pandit && <div><span style={{ fontWeight: 700, color: C.maroon }}>Pandit:</span> Pt. {booking.pandit.firstName} {booking.pandit.lastName}</div>}
            <div style={{ marginTop: 6, fontSize: 12, color: '#16a34a', fontWeight: 700 }}>{t('dd_cancel_free_msg')}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: '#f5f0eb', color: C.textMid, fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              {t('dd_cancel_keep')}
            </button>
            <button
              onClick={onConfirm}
              style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7B1D0E, #C0392B)', color: '#fff', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              {t('dd_cancel_yes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal shown when devotee tries to cancel a PAID booking
const CancelContactModal = ({ booking, onClose, onGoToChat, onRequestCancel }) => {
  const t = useT();
  if (!booking) return null;
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bookingDateStr = booking.scheduledDate
    ? new Date(booking.scheduledDate).toLocaleDateString('en-IN')
    : '';
  const waAdminMsg = encodeURIComponent(
    `Hi, I need to cancel my booking.\n\nPuja: ${booking.pujaType}\nDate: ${bookingDateStr}\nBooking ID: ${booking._id}\n\nKindly assist with the cancellation and refund process.`
  );
  const waPanditMsg = booking.pandit ? encodeURIComponent(
    `Namaste Panditji, I would like to request a cancellation for my booking.\n\nPuja: ${booking.pujaType}\nDate: ${bookingDateStr}\nBooking ID: ${booking._id}\n\nPlease guide me on the cancellation process.`
  ) : '';

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for cancellation.');
      return;
    }
    setSubmitting(true);
    await onRequestCancel(booking._id, reason);
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.72)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 18, maxWidth: 440, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #7B1D0E 0%, #5B2D8E 100%)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>{t('dd_cancel_paid_title')}</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", color: '#fff', fontWeight: 900, fontSize: 18 }}>
              🕉 {booking.pujaType}
            </h2>
          </div>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '22px 24px', maxHeight: 'calc(90vh - 80px)', overflowY: 'auto' }}>
          {/* Warning notice */}
          <div style={{ background: '#FFF9E0', border: '1px solid #E6C87A', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#856404', fontWeight: 600, marginBottom: 20, lineHeight: 1.6 }}>
            {t('dd_cancel_paid_msg')}
          </div>

          {/* Refund/Cancel Form */}
          <form onSubmit={handleRequestSubmit} style={{ marginBottom: 20, background: '#fcfaf7', border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.maroon, display: 'block', marginBottom: 6 }}>{t('dd_cancel_reason_lbl')}</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Health issue, Date changed, Personal reasons..."
              required
              rows={2}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 12, resize: 'none', marginBottom: 12, outline: 'none', boxSizing: 'border-box' }}
            />
            <button
              type="submit"
              disabled={submitting}
              className="dd-btn"
              style={{ width: '100%', justifyContent: 'center', background: C.red, color: '#fff', fontSize: 12, border: 'none', cursor: 'pointer' }}
            >
              {submitting ? 'Submitting Request...' : t('dd_cancel_submit')}
            </button>
          </form>

          <p style={{ fontSize: 13, color: C.textMid, marginBottom: 14, fontWeight: 600 }}>{t('dd_contact_direct')}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* WhatsApp Admin */}
            <a
              href={`https://wa.me/${ADMIN_PHONE}?text=${waAdminMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#E8F9EE', border: '1.5px solid #25D366', borderRadius: 12, padding: '14px 16px', textDecoration: 'none' }}
            >
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
                📲
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#1A6632', fontSize: 14 }}>{t('dd_wa_admin')}</div>
                <div style={{ fontSize: 12, color: '#4CAF76', marginTop: 2 }}>Opens WhatsApp with pre-filled cancellation message</div>
              </div>
            </a>

            {/* Call Admin */}
            <a
              href={`tel:+${ADMIN_PHONE}`}
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F3EEFF', border: '1.5px solid #5B2D8E', borderRadius: 12, padding: '14px 16px', textDecoration: 'none' }}
            >
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#5B2D8E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
                📞
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#5B2D8E', fontSize: 14 }}>{t('dd_call_admin')}</div>
                <div style={{ fontSize: 12, color: '#7B5BB5', marginTop: 2 }}>Available 9 AM – 8 PM daily</div>
              </div>
            </a>

            {/* WhatsApp Pandit (if phone available) */}
            {booking.pandit?.phone && (
              <a
                href={`https://wa.me/${booking.pandit.phone.replace(/[^0-9]/g, '')}?text=${waPanditMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#FFF8E1', border: '1.5px solid #C8960C', borderRadius: 12, padding: '14px 16px', textDecoration: 'none' }}
              >
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#C8960C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
                  🧘
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#7B1D0E', fontSize: 14 }}>{t('dd_wa_pandit')}</div>
                  <div style={{ fontSize: 12, color: '#A07060', marginTop: 2 }}>
                    Pt. {booking.pandit.firstName} {booking.pandit.lastName}
                  </div>
                </div>
              </a>
            )}

            {/* Message Pandit via in-app chat */}
            {booking.pandit && (
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#FFF3E8', border: '1.5px solid #E8710A', borderRadius: 12, padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => { onClose(); if (onGoToChat) onGoToChat(booking.pandit); }}
              >
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#E8710A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
                  💬
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#7B1D0E', fontSize: 14 }}>{t('dd_chat_pandit')}</div>
                  <div style={{ fontSize: 12, color: '#A07060', marginTop: 2 }}>
                    Pt. {booking.pandit.firstName} {booking.pandit.lastName} — opens in Messages tab
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DevoteeDashboard = () => {
  const { user, token, logout, updateUser, isInitialized } = useAuthStore();
  const t = useT();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pandits, setPandits] = useState([]);
  const [cropFile, setCropFile] = useState(null);
  const [isLocal, setIsLocal] = useState(true);
  const [locationMessage, setLocationMessage] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [mobileChatView, setMobileChatView] = useState('list'); // 'list' | 'chat'
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waitingBooking, setWaitingBooking] = useState(null);
  const [acceptedBooking, setAcceptedBooking] = useState(null);
  const [bookingModal, setBookingModal] = useState({ isOpen: false, pandit: null });
  const [cancelContactModal, setCancelContactModal] = useState(null);
  const [cancelConfirmModal, setCancelConfirmModal] = useState(null); // unpaid cancel confirm
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const intentCity = searchParams.get('city');
  const intentPuja = searchParams.get('puja');
  const intentMode = searchParams.get('mode');

  const filteredPandits = pandits.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [bookingForm, setBookingForm] = useState({
    pujaType: intentPuja || 'Satyanarayan Katha',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    address: '',
    notes: '',
    pujaMode: intentMode || 'in-person',
  });
  const socketRef = useRef(null);
  const [clientType, setClientType] = useState('domestic');

  // Switch to device-width viewport so hamburger/drawer works on phones
  useEffect(() => {
    const vp = document.querySelector('meta[name="viewport"]');
    const prev = vp ? vp.getAttribute('content') : null;
    if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    return () => { if (vp && prev) vp.setAttribute('content', prev); };
  }, []);



  useEffect(() => {
    if (intentPuja) {
      setBookingForm(prev => ({
        ...prev,
        pujaType: intentPuja,
        pujaMode: intentMode || prev.pujaMode
      }));
    }
  }, [intentPuja, intentMode]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let calculatedClient = (latitude >= 8.0 && latitude <= 38.0 && longitude >= 68.0 && longitude <= 98.0)
            ? "domestic" : "international";
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const countryCode = data.address?.country_code?.toLowerCase();
            if (countryCode) calculatedClient = countryCode === "in" ? "domestic" : "international";
          } catch (err) { console.error("Reverse geocoding error:", err); }
          setClientType(calculatedClient);
        },
        () => {
          const intlCities = ['london', 'new york', 'dubai', 'singapore', 'toronto', 'sydney', 'california', 'new jersey', 'paris', 'tokyo'];
          const userCity = user?.city?.toLowerCase() || '';
          setClientType(intlCities.some(c => userCity.includes(c)) ? 'international' : 'domestic');
        }
      );
    } else {
      const intlCities = ['london', 'new york', 'dubai', 'singapore', 'toronto', 'sydney', 'california', 'new jersey', 'paris', 'tokyo'];
      const userCity = user?.city?.toLowerCase() || '';
      setClientType(intlCities.some(c => userCity.includes(c)) ? 'international' : 'domestic');
    }
  }, [user]);

  const getCalculatedOnlineFee = (baseFee) => {
    if (clientType === 'international') return baseFee * 2;
    return Math.round(baseFee * 0.7);
  };

  const fetchPandits = async (lat = null, lng = null) => {
    setLoading(true);
    try {
      let url = 'https://panditji-1tf8.onrender.com/api/pandits';
      if (lat && lng) url += `?lat=${lat}&lng=${lng}`;
      else if (intentCity) url += `?city=${encodeURIComponent(intentCity)}`;
      else if (user?.city) url += `?city=${encodeURIComponent(user.city)}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setPandits(res.data.data);
      setIsLocal(res.data.isLocal ?? true);
      setLocationMessage(res.data.message || '');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/chat/conversations/list', { headers: { Authorization: `Bearer ${token}` } });
      setConversations(res.data.data);
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchMyBookings = useCallback(async () => {
    try {
      const res = await api.get('/bookings', { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await api.get('/payments', { headers: { Authorization: `Bearer ${token}` } });
      setPayments(res.data.data);
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => {
    if (!isInitialized || !token || user?.role !== 'devotee') return;
    fetchPandits();
  }, [intentCity, isInitialized, token, user?.city]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!token || user?.role !== 'devotee') { navigate('/'); return; }
    fetchConversations();
    fetchMyBookings();
    fetchMyPayments();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://panditji-1tf8.onrender.com', { transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('join', { userId: user._id || user.id, role: 'devotee', city: user.city });
    });
    socket.on('bookingAccepted', (booking) => {
      setAcceptedBooking(booking);
      setWaitingBooking(null);
      setBookings(prev => {
        const exists = prev.find(b => b._id === booking._id);
        if (exists) return prev.map(b => b._id === booking._id ? booking : b);
        return [booking, ...prev];
      });
      setSelectedChatUser(booking.pandit);
      setMobileChatView('chat');
      setActiveTab('chat');
    });
    socket.on('bookingLinkUpdated', ({ bookingId, videoLink }) => {
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, videoLink } : b));
    });
    socket.on('bookingCompletionOtpGenerated', ({ bookingId, completionOtp }) => {
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, completionOtp } : b));
    });
    return () => socket.disconnect();
  }, [token, user, isInitialized, navigate, fetchConversations, fetchMyBookings, fetchMyPayments]);

  const handleLogout = () => { logout(); navigate('/'); };
  const startChat = (pandit) => { setSelectedChatUser(pandit); setMobileChatView('chat'); setActiveTab('chat'); };

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
      const res = await api.post('/bookings', {
        panditId: pandit._id, pujaType, date, time, address, city: user?.city, notes,
        pujaMode: bookingForm.pujaMode,
        fee: bookingForm.pujaMode === 'online'
          ? getCalculatedOnlineFee(PUJA_PRICES[pujaType] || 1500)
          : (PUJA_PRICES[pujaType] || 1500),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setBookingModal({ isOpen: false, pandit: null });
      setWaitingBooking(res.data.data);
    } catch { alert('Failed to send booking request. Please try again.'); }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to remove this booking from your history?')) return;
    try {
      await api.delete(`/bookings/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(bookings.filter(b => b._id !== bookingId));
    } catch { alert('Failed to delete booking'); }
  };

  const cancelBooking = async (bookingId) => {
    // confirmation is now handled by ConfirmCancelModal — this runs after user clicks "Yes"
    try {
      await axios.patch(
        `https://panditji-1tf8.onrender.com/api/bookings/${bookingId}/cancel`,
        { reason: 'Cancelled by devotee' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      setCancelConfirmModal(null);
    } catch (err) {
      const data = err.response?.data;
      setCancelConfirmModal(null);
      if (data?.requiresAdminContact) {
        // Payment was made — show the contact modal instead of a plain error
        const booking = bookings.find(b => b._id === bookingId);
        if (booking) { setCancelContactModal(booking); return; }
      }
      alert(data?.message || 'Failed to cancel booking. Please try again.');
    }
  };

  const requestCancelBooking = async (bookingId, reason) => {
    try {
      const booking = bookings.find(b => b._id === bookingId);
      if (!booking) return;

      await axios.patch(
        `https://panditji-1tf8.onrender.com/api/bookings/${bookingId}/request-cancel`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.post(
        'https://panditji-1tf8.onrender.com/api/support',
        {
          subject: `Cancellation Request: Booking #${bookingId}`,
          category: 'Booking',
          message: `Dear Admin,\n\nI want to cancel my booking for ${booking.pujaType} scheduled on ${new Date(booking.scheduledDate).toLocaleDateString('en-IN')}.\n\nReason: ${reason}\n\nPlease cancel this booking and initiate a 90% refund.`,
          booking: bookingId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancellation_requested', cancellationReason: reason } : b));
      alert('Cancellation & refund support ticket submitted successfully! Admin will review the ticket and process your refund shortly.');
      setCancelContactModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit cancellation request. Please try again.');
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCropFile(file);
    e.target.value = '';
  };

  const handleCroppedUpload = async (croppedFile) => {
    setCropFile(null);
    const formData = new FormData();
    formData.append('file', croppedFile);
    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      updateUser({ avatar: res.data.avatarUrl });
      alert('Profile picture updated successfully!');
    } catch {
      alert('Failed to upload profile picture');
    }
  };

  const handlePayment = async (booking) => {
    const res = await loadRazorpayScript();
    if (!res) { alert('Razorpay SDK failed to load. Are you online?'); return; }
    try {
      setLoading(true);
      const { data } = await api.post('/payments/create-order', { bookingId: booking._id }, { headers: { Authorization: `Bearer ${token}` } });
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
            const verifyRes = await api.post('/payments/verify', {
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
              setMobileChatView('chat');
              setActiveTab('chat');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            alert('Payment verification failed.');
          }
        },
        prefill: { name: `${user.firstName} ${user.lastName}`, email: user.email || '' },
        theme: { color: '#E8710A' }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => alert('Payment failed. ' + r.error.description));
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing payment');
    } finally { setLoading(false); }
  };

  const feeForForm = bookingForm.pujaMode === 'online'
    ? getCalculatedOnlineFee(PUJA_PRICES[bookingForm.pujaType] || 1500)
    : (PUJA_PRICES[bookingForm.pujaType] || 1500);

  // Returns true only if the booking's scheduled date+time is still in the future
  const isBookingUpcoming = (booking) => {
    if (!booking.scheduledDate) return false;
    try {
      const dateStr = new Date(booking.scheduledDate).toISOString().split('T')[0];
      const time = booking.scheduledTime || '23:59';
      const scheduledAt = new Date(`${dateStr}T${time}:00`);
      return scheduledAt > new Date();
    } catch { return false; }
  };

  return (
    <>
      <style>{G}</style>
      <style>{`
        .dd-sidebar { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
        .dd-mobile-btn { display: none !important; }
        .dd-close-btn { display: none !important; }
        .dd-chat-back { display: none !important; }
        @media (max-width: 1024px) {
          .dd-sidebar { position: fixed; top: 0; bottom: 0; left: 0; z-index: 2000; transform: translateX(-100%); box-shadow: 4px 0 24px rgba(123,29,14,0.15); width: 250px !important; }
          .dd-sidebar.open { transform: translateX(0); }
          .dd-topbar { padding: 0 12px !important; }
          .dd-topbar-title { font-size: 15px !important; }
          .dd-mobile-btn { display: flex !important; }
          .dd-close-btn { display: block !important; }
          .dd-lang-hide { display: none !important; }
          .dd-chat-back { display: flex !important; }
          .dd-chat-list-panel { flex-shrink: 0; }
          .dd-chat-list-panel.mobile-hidden { display: none !important; }
          .dd-chat-window-panel { flex: 1; }
          .dd-chat-window-panel.mobile-hidden { display: none !important; }
        }
        @media (max-width: 640px) {
          /* Profile form grids → single column */
          .dd-form-grid { grid-template-columns: 1fr !important; }
          /* Booking card: stack info + actions vertically */
          .dd-booking-row { flex-direction: column !important; align-items: stretch !important; }
          /* Booking detail info grid → single column */
          .dd-booking-info-grid { grid-template-columns: 1fr !important; }
          /* Action buttons → horizontal row at bottom */
          .dd-booking-actions { flex-direction: row !important; flex-wrap: wrap !important; min-width: unset !important; }
          .dd-booking-actions .dd-btn { flex: 1 !important; min-width: 120px !important; }
          /* Payment active card → stack */
          .dd-payment-active-card { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .dd-payment-active-card > div:last-child { width: 100% !important; text-align: left !important; }
          .dd-payment-active-card .dd-btn { width: 100% !important; justify-content: center !important; }
          /* Payment history card → stack */
          .dd-payment-hist-card { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          /* Pandit finder cards → reduce padding */
          .dd-pandit-card { padding: 14px !important; }
          /* Main content padding reduction */
          main { padding: 12px !important; }
        }
      `}</style>
      <div className="dd-root">

        {/* Confirm cancel modal for UNPAID bookings */}
        {cancelConfirmModal && (
          <ConfirmCancelModal
            booking={cancelConfirmModal}
            onClose={() => setCancelConfirmModal(null)}
            onConfirm={() => cancelBooking(cancelConfirmModal._id)}
          />
        )}

        {/* Cancel contact modal for PAID bookings */}
        {cancelContactModal && (
          <CancelContactModal
            booking={cancelContactModal}
            onClose={() => setCancelContactModal(null)}
            onGoToChat={(pandit) => { setSelectedChatUser(pandit); setMobileChatView('chat'); setActiveTab('chat'); }}
            onRequestCancel={requestCancelBooking}
          />
        )}

        {/* Waiting overlay */}
        {waitingBooking && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, maxWidth: 360, width: '100%', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
              <div style={{ background: 'linear-gradient(135deg, #7B1D0E, #5B2D8E)', padding: '28px 24px', textAlign: 'center' }}>
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

        {/* Pandit accepted toast */}
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

        {/* Booking modal */}
        {bookingModal.isOpen && bookingModal.pandit && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.72)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 18, maxWidth: 480, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ background: 'linear-gradient(135deg, #7B1D0E 0%, #5B2D8E 100%)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <div>
                  <label style={lbl}>Select Puja Type</label>
                  <select required value={bookingForm.pujaType}
                    onChange={e => setBookingForm({ ...bookingForm, pujaType: e.target.value })} style={sel}>
                    {Object.keys(PUJA_PRICES).map(p => (
                      <option key={p} value={p}>{p} — ₹{PUJA_PRICES[p].toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div style={{ background: C.saffronLt, borderRadius: 10, padding: 4, display: 'flex', border: `1px solid ${C.border}` }}>
                  {['in-person', 'online'].map(mode => (
                    <button key={mode} type="button"
                      onClick={() => setBookingForm({ ...bookingForm, pujaMode: mode })}
                      style={{ flex: 1, padding: '9px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, transition: 'all 0.15s', background: bookingForm.pujaMode === mode ? C.saffron : 'transparent', color: bookingForm.pujaMode === mode ? '#fff' : C.textMid }}>
                      {mode === 'in-person' ? '🏠 In-Person' : '💻 Online'}
                      {mode === 'online' && <span style={{ fontSize: 10, marginLeft: 6, background: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: 10 }}>-30%</span>}
                    </button>
                  ))}
                </div>
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
                <div>
                  <label style={lbl}>📍 Full Address</label>
                  <input type="text" required value={bookingForm.address}
                    onChange={e => setBookingForm({ ...bookingForm, address: e.target.value })}
                    placeholder="Enter your complete address" style={inp} />
                </div>
                <div>
                  <label style={lbl}>📝 Special Requirements (Optional)</label>
                  <textarea rows={2} value={bookingForm.notes}
                    onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="Any specific instructions for the pandit..."
                    style={{ ...inp, resize: 'none', lineHeight: 1.5 }} />
                </div>
                <div style={{ background: C.goldLt, border: `1px solid #E6C87A`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Booking Fee</div>
                    {bookingForm.pujaMode === 'online' && (
                      <>
                        <div style={{ fontSize: 12, color: C.textMuted, textDecoration: 'line-through' }}>₹{(PUJA_PRICES[bookingForm.pujaType] || 1500).toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: clientType === 'international' ? '#dc2626' : '#16a34a', fontWeight: 700, marginTop: 2 }}>
                          {clientType === 'international' ? '🌐 International Rate (Double)' : '🪔 Domestic Discount (30% Off)'}
                        </div>
                      </>
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

        {isMobileSidebarOpen && <div onClick={() => setIsMobileSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.5)', zIndex: 1999, backdropFilter: 'blur(2px)' }} />}

        {/* ════ SIDEBAR ════ */}
        <div className={`dd-sidebar${isMobileSidebarOpen ? ' open' : ''}`}>
          <div className="dd-sidebar-top">
            <div className="dd-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '10px' }}>
              <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="dd-brand-om">🕉</span>
                <div>
                  <div className="dd-brand-name">पंडितजी</div>
                  <div className="dd-brand-sub">Sacred Services</div>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsMobileSidebarOpen(false); }}
                className="dd-close-btn"
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', marginRight: '16px' }}
              >
                <X size={16} />
              </button>
            </div>
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
              {user?.city && <div className="dd-user-city"><MapPin size={11} /> {user.city}</div>}
            </div>
          </div>
          <nav className="dd-nav">
            <NavItem icon={<User size={16} />} label={t('dd_my_profile')} tab="profile" activeTab={activeTab} setActiveTab={setActiveTab} onClick={() => setIsMobileSidebarOpen(false)} />
            <NavItem icon={<Calendar size={16} />} label={t('dd_my_bookings')} tab="bookings" activeTab={activeTab} setActiveTab={setActiveTab} onClick={() => setIsMobileSidebarOpen(false)} />
            <NavItem icon={<MessageSquare size={16} />} label={t('dd_messages')} tab="chat" activeTab={activeTab} setActiveTab={setActiveTab} onClick={() => setIsMobileSidebarOpen(false)} />
            <NavItem icon={<CheckCircle size={16} />} label={t('dd_bookings_payments')} tab="payments" activeTab={activeTab} setActiveTab={setActiveTab} onClick={() => setIsMobileSidebarOpen(false)} />
            <NavItem icon={<Headphones size={16} />} label={t('dd_support')} tab="support" activeTab={activeTab} setActiveTab={setActiveTab} onClick={() => setIsMobileSidebarOpen(false)} />
          </nav>
          <div className="dd-logout" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button className="dd-nav-item" onClick={() => navigate('/')} style={{ padding: '11px 14px' }}>
              <span className="dd-nav-icon" style={{ background: 'transparent', color: C.textMid }}><Navigation size={16} /></span>
              {t('dd_back_home')}
            </button>
            <button className="dd-logout-btn" onClick={handleLogout} style={{ borderTop: `1px solid ${C.border}`, borderRadius: 0, marginTop: 4, paddingTop: 16 }}>
              <LogOut size={16} /> {t('dd_logout')}
            </button>
          </div>
        </div>

        {/* ════ MAIN ════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <header className="dd-topbar">
            <button className="dd-mobile-btn" onClick={() => setIsMobileSidebarOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F2', border: '1px solid #EAD9CC', borderRadius: 12, padding: '8px 10px', cursor: 'pointer', color: '#7B1D0E', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 5H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><path d="M3 10H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><path d="M3 15H11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
            </button>
            <div className="dd-topbar-title">
              {activeTab === 'profile' && t('dd_my_profile')}
              {activeTab === 'bookings' && t('dd_my_bookings')}
              {activeTab === 'chat' && t('dd_messages')}
              {activeTab === 'payments' && t('dd_bookings_payments')}
              {activeTab === 'support' && t('dd_support')}
            </div>
            <LanguageToggle />
          </header>

          <main style={{ flex: 1, overflowY: activeTab === 'chat' ? 'hidden' : 'auto', padding: activeTab === 'chat' ? 0 : 24, display: 'flex', flexDirection: 'column' }}>

            {/* FIND PANDIT */}
            {false && (
              <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
                <SectionTitle>{t('dd_available_pandits') || 'Available Pandits'}</SectionTitle>
                
                {/* Search Bar / Location Message */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: 13, color: C.textMuted }}><Search size={18} /></span>
                      <input 
                        type="text" 
                        placeholder={t('dd_search_by_name') || "Search pandits by name..."}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ ...inp, paddingLeft: 42 }}
                      />
                    </div>
                  </div>
                  
                  {locationMessage && (
                    <div style={{
                      background: isLocal ? '#E8F5EE' : '#FFF9E0',
                      border: `1.5px solid ${isLocal ? C.success : C.gold}`,
                      color: isLocal ? C.success : '#856404',
                      padding: '12px 16px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      {isLocal ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                      {locationMessage}
                    </div>
                  )}
                </div>

                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                    <div className="spin" style={{ width: 40, height: 40, border: `4px solid ${C.border}`, borderTopColor: C.saffron, borderRadius: '50%' }} />
                  </div>
                ) : filteredPandits.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 14, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>🧘</div>
                    <p style={{ fontWeight: 700, color: C.maroon, fontSize: 16 }}>{t('dd_no_pandits_found') || 'No Pandits Found'}</p>
                    <p style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>{t('dd_no_pandits_sub') || 'Try searching with a different name or location.'}</p>
                  </div>
                ) : (
                  <div className="dd-pandits-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {filteredPandits.map(pandit => (
                      <div key={pandit._id} className="dd-pandit-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
                          <div style={{ width: 50, height: 50, borderRadius: '50%', background: C.saffronLt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: C.saffron, overflow: 'hidden', border: `1.5px solid ${C.border}` }}>
                            {pandit.avatar ? (
                              <img src={pandit.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              pandit.firstName?.charAt(0)
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: C.surface, color: C.maroon, padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: `1px solid ${C.border}` }}>
                            <Star size={12} fill="#C8960C" color="#C8960C" /> 4.8
                          </div>
                        </div>

                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 17, color: C.maroon, marginBottom: 4 }}>
                          Pt. {pandit.firstName} {pandit.lastName}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.textMid, marginBottom: 12 }}>
                          <MapPin size={12} />
                          {pandit.city || 'Location unavailable'}
                        </div>

                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 12, color: C.textMid, marginBottom: 16, flex: 1 }}>
                          <span style={{ fontWeight: 700, color: C.maroon, display: 'block', marginBottom: 2 }}>Specializations:</span>
                          {Array.isArray(pandit.panditProfile?.specializations) && pandit.panditProfile.specializations.length > 0
                            ? pandit.panditProfile.specializations.join(', ')
                            : (pandit.panditProfile?.specialization || 'All Pujas')}
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                          <button 
                            onClick={() => startChat(pandit)}
                            className="dd-btn" 
                            style={{ background: '#f5f0eb', color: C.textMid, fontSize: 12, flex: 1, justifyContent: 'center' }}
                          >
                            <MessageSquare size={14} /> Chat
                          </button>
                          <button 
                            onClick={() => handleOpenBookingModal(pandit._id)}
                            className="dd-btn dd-btn-primary" 
                            style={{ fontSize: 12, flex: 1, justifyContent: 'center' }}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, padding: 24 }}>
                <SectionTitle>{t('dd_profile_details')}</SectionTitle>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const data = Object.fromEntries(formData);
                  try {
                    const res = await api.patch('/devotees/profile', data, { headers: { Authorization: `Bearer ${token}` } });
                    updateUser(res.data.data);
                    alert('Profile updated successfully!');
                  } catch { alert('Failed to update profile'); }
                }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="dd-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div><label style={lbl}>{t('dd_first_name')}</label><input name="firstName" defaultValue={user?.firstName} required style={inp} /></div>
                    <div><label style={lbl}>{t('dd_last_name')}</label><input name="lastName" defaultValue={user?.lastName} required style={inp} /></div>
                  </div>
                  <div className="dd-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div><label style={lbl}>{t('dd_primary_phone')}</label><input name="phone" defaultValue={user?.phone} required style={inp} /></div>
                    <div><label style={lbl}>{t('dd_alt_phone')}</label><input name="alternatePhone" defaultValue={user?.alternatePhone} placeholder="Optional" style={inp} /></div>
                  </div>
                  <div className="dd-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div><label style={lbl}>{t('dd_city')}</label><input name="city" defaultValue={user?.city} required style={inp} /></div>
                    <div><label style={lbl}>{t('dd_state')}</label><input name="state" defaultValue={user?.state} style={inp} /></div>
                  </div>
                  <div>
                    <label style={lbl}>{t('dd_pinned_location')}</label>
                    <input name="pinnedLocation" defaultValue={user?.pinnedLocation} placeholder="e.g., Block A, Phase 1..." style={inp} />
                  </div>
                  <button type="submit" className="dd-btn dd-btn-primary" style={{ marginTop: 8, justifyContent: 'center' }}>{t('dd_save_changes')}</button>
                </form>
              </div>
            )}

            {/* MY BOOKINGS */}
            {activeTab === 'bookings' && (
              <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 14, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>📿</div>
                    <p style={{ fontWeight: 700, color: C.maroon, fontSize: 16 }}>{t('dd_no_bookings')}</p>
                    <p style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>{t('dd_no_bookings_sub')}</p>
                  </div>
                ) : bookings.map(booking => (
                  <div key={booking._id} className="dd-booking-card">
                    <div style={{ height: 4, background: booking.status === 'pending' ? C.gold : booking.status === 'confirmed' ? C.success : booking.status === 'completed' ? C.purple : C.red }} />
                    <div className="dd-booking-row" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                          <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, color: C.maroon }}>
                            🕉 {booking.pujaType}
                          </h3>
                          <StatusBadge status={booking.status} />
                          {booking.pujaMode === 'online' && (
                            <span className="dd-badge" style={{ background: C.purpleLt, color: C.purple }}>{t('dd_online')}</span>
                          )}
                        </div>
                        <div className="dd-booking-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 13, color: C.textMid }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Clock size={13} color={C.saffron} />
                            {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString('en-IN') : '-'}
                            {booking.scheduledTime && ` · ${booking.scheduledTime}`}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <MapPin size={13} color={C.saffron} />
                            {booking.pujaMode === 'online' ? (t('dd_online_virtual') || 'Online / Virtual Puja') : booking.address}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Video size={13} color={booking.pujaMode === 'online' ? C.purple : C.border} />
                            <span style={{ color: booking.pujaMode === 'online' ? C.purple : C.textMuted, fontWeight: 600 }}>
                              {booking.pujaMode === 'online' ? (t('dd_distance_puja') || 'Distance Puja') : t('dd_in_person')}
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
                              <Video size={13} /> {t('dd_meeting_ready')}
                            </div>
                            <a href={booking.videoLink} target="_blank" rel="noopener noreferrer"
                              style={{ background: C.purple, color: '#fff', padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 800, textDecoration: 'none' }}>
                              {t('dd_join_now')}
                            </a>
                          </div>
                        )}
                        {booking.status === 'confirmed' && booking.completionOtp && (
                          <div style={{ marginTop: 10, background: C.goldLt, border: `1.5px dashed ${C.gold}`, borderRadius: 8, padding: '8px 12px', color: C.maroon, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, width: 'fit-content' }}>
                            🔑 Completion OTP: <span style={{ color: C.saffron, fontSize: 15, fontFamily: 'monospace', letterSpacing: 1, fontWeight: 800 }}>{booking.completionOtp}</span>
                          </div>
                        )}
                      </div>

                      {/* ── ACTION BUTTONS ── */}
                      <div className="dd-booking-actions" style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, minWidth: 124, alignItems: 'stretch' }}>

                        {/* CASE 1: confirmed + UNPAID */}
                        {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
                          <>
                            {/* Pay Now always shown — even for past (so they can settle) */}
                            <button className="dd-btn dd-btn-primary" style={{ fontSize: 12, justifyContent: 'center' }}
                              onClick={() => handlePayment(booking)} disabled={loading}>
                              {t('dd_pay_now')}
                            </button>
                            {/* Cancel always shown for unpaid bookings — opens confirm modal */}
                            <button
                              className="dd-btn"
                              style={{ fontSize: 12, justifyContent: 'center', background: '#FDECEC', color: C.red, border: `1.5px solid ${C.red}` }}
                              onClick={() => setCancelConfirmModal(booking)}
                            >
                              {t('dd_cancel_booking')}
                            </button>
                          </>
                        )}

                        {/* CASE 2: confirmed + PAID */}
                        {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
                          <>
                            {booking.pandit && (
                              <button className="dd-btn dd-btn-ghost" style={{ fontSize: 12, justifyContent: 'center' }}
                                onClick={() => startChat(booking.pandit)}>
                                <MessageSquare size={14} /> {t('dd_chat')}
                              </button>
                            )}
                            {/* Cancel only if the puja hasn't happened yet */}
                            {isBookingUpcoming(booking) && (
                              <button
                                className="dd-btn"
                                style={{ fontSize: 11, justifyContent: 'center', background: '#FDECEC', color: C.red, border: `1.5px solid ${C.red}` }}
                                onClick={() => setCancelContactModal(booking)}
                              >
                                {t('dd_cancel_booking')}
                              </button>
                            )}
                          </>
                        )}

                        {/* CASE 3: completed → Chat */}
                        {booking.status === 'completed' && booking.pandit && (
                          <button className="dd-btn dd-btn-ghost" style={{ fontSize: 12, justifyContent: 'center' }}
                            onClick={() => startChat(booking.pandit)}>
                            <MessageSquare size={14} /> {t('dd_chat')}
                          </button>
                        )}

                        {/* CASE 4: pending → Cancel only if still upcoming */}
                        {booking.status === 'pending' && isBookingUpcoming(booking) && (
                          <button
                            className="dd-btn"
                            style={{ fontSize: 12, justifyContent: 'center', background: '#FDECEC', color: C.red, border: `1.5px solid ${C.red}` }}
                            onClick={() => cancelBooking(booking._id)}
                          >
                            {t('dd_cancel_booking')}
                          </button>
                        )}

                        {/* CASE 5: rejected / cancelled → Delete from history */}
                        {(booking.status === 'rejected' || booking.status === 'cancelled') && (
                          <button className="dd-btn" onClick={() => deleteBooking(booking._id)}
                            style={{ background: '#f5f0eb', color: C.textMid, fontSize: 12, justifyContent: 'center' }}>
                            {t('dd_delete')}
                          </button>
                        )}

                        {/* CASE 6: cancellation_requested */}
                        {booking.status === 'cancellation_requested' && (
                          <div style={{ fontSize: 11, color: C.textMid, fontWeight: 600, textAlign: 'center', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 8, padding: '8px 6px' }}>
                            {t('dd_cancellation_pending') || '⏳ Cancellation Request Pending Review'}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CHAT */}
            {activeTab === 'chat' && (
              <div style={{ display: 'flex', height: '100%', gap: 16, padding: 16, boxSizing: 'border-box' }}>

                {/* ── Conversation list panel ── */}
                <div
                  className={`dd-chat-list-panel${mobileChatView === 'chat' ? ' mobile-hidden' : ''}`}
                  style={{ width: 240, background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}
                >
                  <div style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14, color: C.maroon, borderBottom: `1px solid ${C.border}`, background: C.saffronLt, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🕉 {t('dd_recent_chats') || 'Recent Chats'}
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {conversations.length === 0 ? (
                      <div style={{ padding: 20, textAlign: 'center', color: C.textMuted, fontSize: 13, marginTop: 16 }}>
                        {t('dd_no_conversations') || 'No conversations yet. Find a Pandit to start!'}
                      </div>
                    ) : conversations.map(c => (
                      <div key={c._id}
                        onClick={() => { setSelectedChatUser(c); setMobileChatView('chat'); }}
                        style={{ padding: '12px 16px', borderBottom: `1px solid ${C.surface}`, cursor: 'pointer', transition: 'background 0.12s', background: selectedChatUser?._id === c._id ? C.saffronLt : '#fff', borderLeft: selectedChatUser?._id === c._id ? `3px solid ${C.saffron}` : '3px solid transparent' }}
                      >
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

                {/* ── Chat window panel ── */}
                <div
                  className={`dd-chat-window-panel${mobileChatView === 'list' ? ' mobile-hidden' : ''}`}
                  style={{ flex: 1, background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}
                >
                  {/* Back button – only visible on mobile */}
                  <div className="dd-chat-back" style={{ alignItems: 'center', gap: 8, padding: '10px 14px', background: C.saffronLt, borderBottom: `1px solid ${C.border}` }}>
                    <button
                      onClick={() => setMobileChatView('list')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.maroon, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, padding: 0 }}
                    >
                      ← {t('dd_back_to_chats') || 'Back to Chat'}
                    </button>
                    {selectedChatUser && (
                      <span style={{ fontWeight: 600, color: C.maroon, fontSize: 14, marginLeft: 8 }}>
                        {selectedChatUser.firstName} {selectedChatUser.lastName}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                    <ChatInterface otherUser={selectedChatUser} socket={socketRef.current} />
                  </div>
                </div>

              </div>
            )}

            {/* SUPPORT */}
            {activeTab === 'support' && (
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <SupportCare userRole="devotee" />
              </div>
            )}

            {/* PAYMENTS */}
            {activeTab === 'payments' && (
              <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div>
                  <SectionTitle>{t('dd_active_unpaid') || 'Active & Unpaid Bookings'}</SectionTitle>
                  {bookings.filter(b => b.status === 'confirmed' && b.paymentStatus === 'pending').length === 0 ? (
                    <p style={{ color: C.textMuted, fontSize: 14 }}>{t('dd_no_pending_payments') || 'No pending payments for active bookings.'}</p>
                  ) : bookings.filter(b => b.status === 'confirmed' && b.paymentStatus === 'pending').map(booking => (
                    <div key={booking._id} className="dd-payment-active-card" style={{ background: C.saffronLt, border: `1.5px solid ${C.saffron}`, borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <AlertCircle size={17} color={C.saffron} />
                          <span style={{ fontWeight: 800, color: C.maroon, fontSize: 16 }}>Pt. {booking.pandit?.firstName} {booking.pandit?.lastName}</span>
                        </div>
                        <div style={{ fontSize: 13, color: C.textMid }}>
                          <strong>{booking.pujaType}</strong> · {new Date(booking.scheduledDate || booking.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        <div style={{ fontSize: 12, color: C.saffron, marginTop: 4, fontWeight: 600 }}>{t('dd_payment_required_chat') || '🔒 Payment required to unlock chat'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: C.maroon, marginBottom: 8 }}>
                          ₹{booking.fee?.toLocaleString() || '1,500'}
                        </div>
                        <button className="dd-btn dd-btn-primary" onClick={() => handlePayment(booking)} disabled={loading}>
                          {loading ? (t('dd_processing') || 'Processing...') : (t('dd_pay_now') || 'Pay Now')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <SectionTitle>{t('dd_past_transactions') || 'Past Transactions'}</SectionTitle>
                  {payments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 14, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
                      <p style={{ color: C.textMuted, fontSize: 14 }}>{t('dd_no_payment_history') || 'No payment history found.'}</p>
                    </div>
                  ) : payments.map(payment => (
                    <div key={payment._id} className="dd-payment-hist-card" style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, boxShadow: '0 1px 4px rgba(123,29,14,0.05)' }}>
                      <div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: C.maroon, fontSize: 16, marginBottom: 4 }}>
                          Pt. {payment.pandit?.firstName} {payment.pandit?.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: C.textMid }}>
                          {new Date(payment.createdAt).toLocaleDateString('en-IN')} · {new Date(payment.createdAt).toLocaleTimeString()}
                        </div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>TXN: {payment.razorpayPaymentId}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: C.success }}>
                          ₹{(payment.amount / 100).toLocaleString()}
                        </div>
                        <div style={{ background: C.successLt, color: C.success, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 4, display: 'inline-block', marginTop: 4, letterSpacing: '0.6px' }}>
                          ✓ {t('dd_payment_success') || 'SUCCESS'}
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