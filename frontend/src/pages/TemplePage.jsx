import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../utils/api';
import useT from '../hooks/useT';

// ── Static image map: name keywords → local asset path ─────────
const TEMPLE_IMAGE_MAP = {
  'shirdi':        '/pictures/temples/sai_baba.jpg',
  'sai baba':      '/pictures/temples/sai_baba.jpg',
  'kedarnath':     '/pictures/temples/kedarnath.jpg',
  'somnath':       '/pictures/temples/somnath.jpg',
  'kashi':         '/pictures/temples/kashi_vishwanath.jpg',
  'vishwanath':    '/pictures/temples/kashi_vishwanath.jpg',
  'siddhivinayak': '/pictures/temples/siddhivinayak.jpg',
  'jagannath':     '/pictures/temples/jagannath.jpg',
  'puri':          '/pictures/temples/jagannath.jpg',
  'tirupati':      '/pictures/temples/tirupati.jpg',
  'balaji':        '/pictures/temples/tirupati.jpg',
  'vaishno':       '/pictures/temples/vaishno_devi.jpg',
};

/** Resolve the best image for a temple: prefer local map, then DB value */
function resolveTempleImage(temple) {
  const nameLower = (temple.name || '').toLowerCase();
  for (const [keyword, path] of Object.entries(TEMPLE_IMAGE_MAP)) {
    if (nameLower.includes(keyword)) return path;
  }
  return temple.image || '/pictures/temples/sai_baba.jpg';
}

const DELIVERY_STATUS_CONFIG = {
  placed:     { label: 'Order Placed',   cls: 'bg-blue-100 text-blue-700'   },
  processing: { label: 'Processing',     cls: 'bg-yellow-100 text-yellow-700' },
  shipped:    { label: 'Shipped',        cls: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Delivered',      cls: 'bg-green-100 text-green-700'  },
};

export default function TemplePage() {
  const { isAuthenticated, token, user } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();

  const [activeTab, setActiveTab] = useState('chadava');
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // Chadava modal
  const [chadavaModal, setChadavaModal] = useState(null);
  const [chadavaAmount, setChadavaAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [dedicatedTo, setDedicatedTo] = useState('');
  const [chadavaLoading, setChadavaLoading] = useState(false);

  // Prasad modal
  const [prasadModal, setPrasadModal] = useState(null);
  const [prasadForm, setPrasadForm] = useState({ name: '', address: '', city: '', pincode: '', phone: '' });
  const [prasadLoading, setPrasadLoading] = useState(false);

  const fetchTemples = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await api.get('/temple');
      setTemples(res.data.data || []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemples(); }, [fetchTemples]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchWallet = async () => {
      try {
        const res = await api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } });
        setWalletBalance(res.data.data?.walletBalance || 0);
      } catch {}
    };
    fetchWallet();
  }, [isAuthenticated, token]);

  const fetchMyOrders = async () => {
    if (!isAuthenticated) return;
    setOrdersLoading(true);
    try {
      const res = await api.get('/temple/my-orders', { headers: { Authorization: `Bearer ${token}` } });
      setMyOrders(res.data.data || []);
    } catch {}
    finally { setOrdersLoading(false); }
  };

  useEffect(() => { if (activeTab === 'myorders') fetchMyOrders(); }, [activeTab]);

  const requireAuth = () => {
    if (!isAuthenticated) { toast.error('Please login to continue'); navigate('/login'); return false; }
    if (user?.role !== 'devotee') { toast.error('Only devotees can place orders'); return false; }
    return true;
  };

  // ── Chadava ──────────────────────────────────────
  const openChadava = (temple) => {
    if (!requireAuth()) return;
    setChadavaModal(temple);
    setChadavaAmount(temple.chadavaPresets?.[0] || 51);
    setCustomAmount('');
    setDedicatedTo('');
  };

  const handleChadava = async () => {
    const amt = customAmount ? Number(customAmount) : chadavaAmount;
    if (!amt || amt < 11) return toast.error('Minimum Chadava amount is ₹11');
    if (walletBalance < amt) return toast.error(`Insufficient wallet balance. Available: ₹${walletBalance}`);
    setChadavaLoading(true);
    try {
      const res = await api.post('/temple/chadava',
        { templeId: chadavaModal._id, amount: amt, dedicatedTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || 'Chadava offered successfully 🙏');
      setWalletBalance(res.data.newWalletBalance ?? walletBalance - amt);
      setChadavaModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setChadavaLoading(false); }
  };

  // ── Prasad ──────────────────────────────────────
  const openPrasad = (temple) => {
    if (!requireAuth()) return;
    setPrasadModal(temple);
    setPrasadForm({ name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '', address: '', city: '', pincode: '', phone: user?.phone || '' });
  };

  const handlePrasad = async () => {
    const { name, address, city, pincode, phone } = prasadForm;
    if (!name || !address || !city || !pincode || !phone) return toast.error('All delivery fields are required');
    if (walletBalance < prasadModal.prasadItem.price) return toast.error(`Insufficient wallet balance. Available: ₹${walletBalance}`);
    setPrasadLoading(true);
    try {
      const res = await api.post('/temple/prasad',
        { templeId: prasadModal._id, deliveryName: name, deliveryAddress: address, deliveryCity: city, deliveryPincode: pincode, deliveryPhone: phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || 'Prasad ordered! 🎁');
      setWalletBalance(res.data.newWalletBalance ?? walletBalance - prasadModal.prasadItem.price);
      setPrasadModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setPrasadLoading(false); }
  };

  const chadavaTemples = temples.filter(tmpl => tmpl.chadavaEnabled);
  const prasadTemples = temples.filter(tmpl => tmpl.prasadEnabled);

  return (
    <div style={{ minHeight: '100vh', background: '#f9f5f0', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar />

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #7c1a0a 0%, #b5451b 50%, #4a1a0a 100%)',
        padding: '48px 24px 36px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,160,60,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,100,0,0.08) 0%, transparent 50%)' }} />
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px', fontFamily: "'Georgia', serif" }}>
            {t('temple_portal_title')}
          </h1>
          <p 
            style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '0 0 20px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}
            dangerouslySetInnerHTML={{ __html: t('temple_portal_subtitle') }}
          />
          {isAuthenticated && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 16px' }}>
              <span style={{ color: '#fde68a', fontWeight: 700, fontSize: 14 }}>{t('temple_wallet_balance')}{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', padding: '0 16px' }}>
          {[
            { id: 'chadava', label: t('temple_chadava_tab'), count: chadavaTemples.length },
            { id: 'prasad', label: t('temple_prasad_tab'), count: prasadTemples.length },
            ...(isAuthenticated ? [{ id: 'myorders', label: t('temple_my_orders_tab'), count: null }] : []),
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 20px', fontSize: 14, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid #b5451b' : '3px solid transparent',
                color: activeTab === tab.id ? '#b5451b' : '#6b7280',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>
              {tab.label}
              {tab.count !== null && <span style={{ marginLeft: 6, background: activeTab === tab.id ? '#b5451b' : '#e5e7eb', color: activeTab === tab.id ? '#fff' : '#6b7280', borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>

        {/* ─── CHADAVA TAB ─────────────────────────────── */}
        {activeTab === 'chadava' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 }}>{t('temple_offer_chadava_title')}</h2>
              <p style={{ color: '#6b7280', fontSize: 14, margin: '4px 0 0' }}>{t('temple_offer_chadava_desc')}</p>
            </div>
            {loading ? (
              <LoadingSkeleton />
            ) : loadError ? (
              <ErrorState onRetry={fetchTemples} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {chadavaTemples.length === 0
                  ? <EmptyState message={t('temple_no_temples_chadava')} />
                  : chadavaTemples.map(temple => (
                    <TempleCard key={temple._id} temple={temple} actionLabel={t('temple_offer_chadava_btn')} actionColor="#b5451b" onAction={() => openChadava(temple)} />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ─── PRASAD TAB ─────────────────────────────── */}
        {activeTab === 'prasad' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 }}>{t('temple_order_prasad_title')}</h2>
              <p style={{ color: '#6b7280', fontSize: 14, margin: '4px 0 0' }}>{t('temple_order_prasad_desc')}</p>
            </div>
            {loading ? (
              <LoadingSkeleton />
            ) : loadError ? (
              <ErrorState onRetry={fetchTemples} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {prasadTemples.length === 0
                  ? <EmptyState message={t('temple_no_temples_prasad')} />
                  : prasadTemples.map(temple => (
                    <TempleCard key={temple._id} temple={temple}
                      actionLabel={t('temple_order_prasad_btn', { price: temple.prasadItem?.price || 0 })}
                      actionColor="#1d4ed8"
                      onAction={() => openPrasad(temple)}
                      badge={t('temple_order_prasad_est_days', { days: temple.prasadItem?.deliveryDays || 7 })}
                      subLabel={temple.prasadItem?.name}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ─── MY ORDERS TAB ─────────────────────────────── */}
        {activeTab === 'myorders' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>{t('temple_my_orders_title')}</h2>
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>{t('temple_loading_orders')}</div>
            ) : myOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb' }}>
                <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 16 }}>{t('temple_no_orders_yet')}</p>
                <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>{t('temple_no_orders_yet_desc')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myOrders.map(order => (
                  <div key={order._id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: order.orderType === 'chadava' ? '#fef3c7' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: order.orderType === 'chadava' ? '#92400e' : '#1e40af', flexShrink: 0 }}>{order.orderType === 'chadava' ? 'CDV' : 'PSD'}</div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontWeight: 700, color: '#1f2937', fontSize: 15 }}>{order.templeName}</div>
                      <div style={{ color: '#6b7280', fontSize: 13 }}>
                        {order.orderType === 'chadava'
                          ? `${t('temple_chadhava_offering')}${order.dedicatedTo ? ` · ${t('temple_dedicated_to_for')}${order.dedicatedTo}` : ''}`
                          : `${t('temple_prasad_label')}${order.prasadItem}`}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#1f2937' }}>₹{order.amount.toLocaleString('en-IN')}</div>
                      {order.orderType === 'chadava' ? (
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 20 }}>{t('temple_order_placed')}</span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: DELIVERY_STATUS_CONFIG[order.deliveryStatus]?.cls?.includes('yellow') ? '#fef9c3' : DELIVERY_STATUS_CONFIG[order.deliveryStatus]?.cls?.includes('green') ? '#dcfce7' : DELIVERY_STATUS_CONFIG[order.deliveryStatus]?.cls?.includes('purple') ? '#f3e8ff' : '#dbeafe', color: DELIVERY_STATUS_CONFIG[order.deliveryStatus]?.cls?.includes('yellow') ? '#854d0e' : DELIVERY_STATUS_CONFIG[order.deliveryStatus]?.cls?.includes('green') ? '#166534' : DELIVERY_STATUS_CONFIG[order.deliveryStatus]?.cls?.includes('purple') ? '#6b21a8' : '#1e40af' }}>
                          {t(`temple_delivery_${order.deliveryStatus}`) || order.deliveryStatus}
                        </span>
                      )}
                      {order.trackingId && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{t('temple_delivery_tracking')}{order.trackingId}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── CHADAVA MODAL ─────────────────────────────── */}
      {chadavaModal && (
        <Modal onClose={() => setChadavaModal(null)} title={t('temple_chadava_modal_title', { name: chadavaModal.name })}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400e', fontWeight: 600 }}>
              {t('temple_wallet_balance')}{walletBalance.toLocaleString('en-IN')}
            </div>

            <div>
              <label style={labelStyle}>{t('temple_select_amount')}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {(chadavaModal.chadavaPresets || [51, 101, 251, 501, 1001]).map(amt => (
                  <button key={amt} onClick={() => { setChadavaAmount(amt); setCustomAmount(''); }}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: '2px solid', cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'all 0.15s',
                      borderColor: chadavaAmount === amt && !customAmount ? '#b5451b' : '#e5e7eb',
                      background: chadavaAmount === amt && !customAmount ? '#b5451b' : '#fff',
                      color: chadavaAmount === amt && !customAmount ? '#fff' : '#374151',
                    }}>₹{amt}</button>
                ))}
              </div>
              <input type="number" min={11} placeholder={t('temple_custom_amount_placeholder')}
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setChadavaAmount(0); }}
                style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>{t('temple_dedicated_to_label')}</label>
              <input type="text" placeholder={t('temple_dedicated_to_placeholder')}
                value={dedicatedTo} onChange={e => setDedicatedTo(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#374151', fontWeight: 600 }}>{t('temple_chadava_amount_summary')}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#b5451b' }}>₹{(customAmount || chadavaAmount || 0).toLocaleString('en-IN')}</span>
            </div>

            <button onClick={handleChadava} disabled={chadavaLoading}
              style={{ width: '100%', padding: '14px', background: chadavaLoading ? '#9ca3af' : '#b5451b', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: chadavaLoading ? 'not-allowed' : 'pointer' }}>
              {chadavaLoading ? t('rev_submitting') : t('temple_offer_chadava_btn')}
            </button>
          </div>
        </Modal>
      )}

      {/* ─── PRASAD MODAL ─────────────────────────────── */}
      {prasadModal && (
        <Modal onClose={() => setPrasadModal(null)} title={t('temple_order_prasad_modal_title', { name: prasadModal.name })}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: 14 }}>{prasadModal.prasadItem?.name}</div>
              <div style={{ color: '#374151', fontSize: 13 }}>₹{prasadModal.prasadItem?.price} · {t('temple_order_prasad_est_days', { days: prasadModal.prasadItem?.deliveryDays })}</div>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{t('temple_wallet_balance')}{walletBalance.toLocaleString('en-IN')}</div>
            </div>

            {[
              { label: t('temple_form_name'), key: 'name', placeholder: t('temple_form_name_placeholder'), type: 'text' },
              { label: t('temple_form_address'), key: 'address', placeholder: t('temple_form_address_placeholder'), type: 'text' },
              { label: t('temple_form_city'), key: 'city', placeholder: t('temple_form_city_placeholder'), type: 'text' },
              { label: t('temple_form_pincode'), key: 'pincode', placeholder: t('temple_form_pincode_placeholder'), type: 'text', maxLength: 6 },
              { label: t('temple_form_phone'), key: 'phone', placeholder: t('temple_form_phone_placeholder'), type: 'tel' },
            ].map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} maxLength={f.maxLength}
                  value={prasadForm[f.key]}
                  onChange={e => setPrasadForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={inputStyle} />
              </div>
            ))}

            <button onClick={handlePrasad} disabled={prasadLoading}
              style={{ width: '100%', padding: '14px', background: prasadLoading ? '#9ca3af' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: prasadLoading ? 'not-allowed' : 'pointer' }}>
              {prasadLoading ? t('rev_submitting') : t('temple_order_prasad_btn', { price: prasadModal.prasadItem?.price })}
            </button>
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function TempleCard({ temple, actionLabel, actionColor, onAction, badge, subLabel }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: `2px solid ${hovered ? actionColor : '#e5e7eb'}`, boxShadow: hovered ? `0 8px 24px rgba(0,0,0,0.1)` : '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}>
      <div style={{ position: 'relative', height: 180, background: '#f3f4f6', overflow: 'hidden' }}>
        <img src={resolveTempleImage(temple)} alt={temple.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s' }}
          onError={e => { e.target.src = '/pictures/temples/sai_baba.jpg'; }} />
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
          {temple.state}
        </div>
        {badge && (
          <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(29,78,216,0.85)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
            {badge}
          </div>
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: '0 0 2px', fontFamily: "'Georgia', serif" }}>{temple.name}</h3>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{temple.deity} · {temple.location}</div>
        {subLabel && <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{subLabel}</div>}
        {temple.description && <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{temple.description}</p>}
        <button onClick={onAction}
          style={{ width: '100%', padding: '10px', background: actionColor, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function Modal({ onClose, title, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1f2937' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '2px solid #e5e7eb' }}>
          <div style={{ height: 180, background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          <div style={{ padding: 16 }}>
            <div style={{ height: 16, background: '#f3f4f6', borderRadius: 6, marginBottom: 8, width: '70%' }} />
            <div style={{ height: 12, background: '#f3f4f6', borderRadius: 6, marginBottom: 6, width: '50%' }} />
            <div style={{ height: 12, background: '#f3f4f6', borderRadius: 6, marginBottom: 16, width: '60%' }} />
            <div style={{ height: 38, background: '#f3f4f6', borderRadius: 8 }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #fee2e2' }}>
      <div style={{ fontSize: 40, marginBottom: 12, color: '#dc2626' }}>&#9888;</div>
      <p style={{ color: '#991b1b', fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>Could not load temples</p>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 20px' }}>The server may be waking up. Please try again in a moment.</p>
      <button onClick={onRetry}
        style={{ padding: '10px 28px', background: '#b5451b', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
        Try Again
      </button>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb' }}>
      <p style={{ color: '#6b7280', fontWeight: 600 }}>{message}</p>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 5 };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#1f2937', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fafafa' };
