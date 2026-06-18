import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import api from '../../utils/api';
import { Users, MessageSquare, LayoutDashboard, LogOut, Headphones, RefreshCw, Inbox, CheckCircle, Clock, XCircle, Send, Trash2, Eye, Megaphone, Banknote, BookOpen, Building, Sparkles } from 'lucide-react';
import BookingsTab from './components/BookingsTab';
import ChatTrackerTab from './components/ChatTrackerTab';

const AdminDashboard = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ totalUsers: 0, totalPandits: 0, totalDevotees: 0, totalMessages: 0, totalRevenue: 0, totalCompanyEarnings: 0 });
  const [usersList, setUsersList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefundRunning, setAutoRefundRunning] = useState(false);
  const [autoRefundResult, setAutoRefundResult] = useState(null);

  // Temple states
  const [templesList, setTemplesList] = useState([]);
  const [templeOrdersList, setTempleOrdersList] = useState([]);
  const [templeSubTab, setTempleSubTab] = useState('list'); // 'list' | 'orders'
  const [templeSearchQuery, setTempleSearchQuery] = useState('');
  const [templeOrderSearchQuery, setTempleOrderSearchQuery] = useState('');
  const [templeOrderTypeFilter, setTempleOrderTypeFilter] = useState('all');
  const [templeOrderStatusFilter, setTempleOrderStatusFilter] = useState('all');
  
  const [isTempleModalOpen, setIsTempleModalOpen] = useState(false);
  const [editingTemple, setEditingTemple] = useState(null);
  const [templeForm, setTempleForm] = useState({
    name: '',
    deity: '',
    location: '',
    state: '',
    image: '',
    description: '',
    chadavaEnabled: true,
    prasadEnabled: true,
    chadavaPresets: '51, 101, 251, 501, 1001',
    prasadItemName: 'Prasad',
    prasadItemPrice: 151,
    prasadDeliveryDays: 7
  });
  const [isSubmittingTemple, setIsSubmittingTemple] = useState(false);

  useEffect(() => {
    if (location.pathname === '/admin/chats') {
      setActiveTab('chats');
    } else if (location.pathname === '/admin/bookings') {
      setActiveTab('bookings');
    } else {
      const dashboardTabs = ['overview', 'users', 'financials', 'support', 'broadcast', 'payouts', 'templeManagement'];
      if (!dashboardTabs.includes(activeTab)) {
        setActiveTab('overview');
      }
    }
  }, [location.pathname]);

  const handleTabClick = (tab) => {
    if (tab === 'chats') {
      navigate('/admin/chats');
    } else if (tab === 'bookings') {
      navigate('/admin/bookings');
    } else {
      setActiveTab(tab);
      if (location.pathname !== '/admin/dashboard') {
        navigate('/admin/dashboard');
      }
    }
  };
  const [filters, setFilters] = useState({ search: '', role: '', verification: 'all' });
  const [selectedUserModal, setSelectedUserModal] = useState(null);
  const [bookingsList, setBookingsList] = useState([]);
  const [selectedBookingModal, setSelectedBookingModal] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [payoutsList, setPayoutsList] = useState([]);
  const [payoutTabFilter, setPayoutTabFilter] = useState('pending');
  const [processingPayoutId, setProcessingPayoutId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const statsRes = await api.get('/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data.data);

      const usersRes = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsersList(usersRes.data.data);

      const paymentsRes = await api.get('/admin/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentsList(paymentsRes.data.data);

      const ticketsRes = await api.get('/admin/support', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(ticketsRes.data.data);

      const bookingsRes = await api.get('/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookingsList(bookingsRes.data.data || []);

      const payoutsRes = await api.get('/admin/payouts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayoutsList(payoutsRes.data.data || []);

      const templesRes = await api.get('/admin/temples', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplesList(templesRes.data.data || []);

      const templeOrdersRes = await api.get('/admin/temple-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTempleOrdersList(templeOrdersRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        const res = await api.get('/admin/support', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data.data);
      } catch (err) { console.error(err); }
    };
    window._adminFetchTickets = fetchTickets;
    fetchData();
  }, [token, user, navigate, fetchData]);

  const handleDeleteTemple = async (templeId) => {
    if (!window.confirm('Are you sure you want to deactivate this temple?')) return;
    try {
      await api.delete(`/admin/temples/${templeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Temple deactivated successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate temple');
    }
  };

  const handleTempleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingTemple(true);
    try {
      const presets = templeForm.chadavaPresets
        .split(',')
        .map(p => Number(p.trim()))
        .filter(p => !isNaN(p) && p > 0);

      const payload = {
        name: templeForm.name,
        deity: templeForm.deity,
        location: templeForm.location,
        state: templeForm.state,
        image: templeForm.image,
        description: templeForm.description,
        chadavaEnabled: templeForm.chadavaEnabled,
        prasadEnabled: templeForm.prasadEnabled,
        chadavaPresets: presets,
        prasadItem: {
          name: templeForm.prasadItemName,
          price: Number(templeForm.prasadItemPrice),
          deliveryDays: Number(templeForm.prasadDeliveryDays)
        }
      };

      if (editingTemple) {
        await api.put(`/admin/temples/${editingTemple._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Temple updated successfully');
      } else {
        await api.post('/admin/temples', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Temple added successfully');
      }
      setIsTempleModalOpen(false);
      setEditingTemple(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save temple');
    } finally {
      setIsSubmittingTemple(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, updates) => {
    try {
      await api.patch(`/admin/temple-orders/${orderId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Order status updated successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setBroadcastLoading(true);
    try {
      await api.post('/admin/broadcast', {
        title: broadcastTitle,
        message: broadcastMessage,
        target: broadcastTarget
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBroadcastHistory(prev => [
        { title: broadcastTitle, message: broadcastMessage, target: broadcastTarget, date: new Date().toISOString() },
        ...prev
      ]);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastTarget('all');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleProcessPayout = async (paymentId) => {
    if (!window.confirm('Are you sure you want to release this payout to Pandit Ji?')) return;
    setProcessingPayoutId(paymentId);
    try {
      await api.post(`/admin/payouts/${paymentId}/pay`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Payout processed successfully!');
      
      const payoutsRes = await api.get('/admin/payouts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayoutsList(payoutsRes.data.data || []);
      
      const statsRes = await api.get('/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process payout');
    } finally {
      setProcessingPayoutId(null);
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await api.patch(`/admin/support/${ticketId}`,
        { adminReply: replyText, status: 'resolved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets(prev => prev.map(t => t._id === ticketId ? res.data.data : t));
      setSelectedTicket(res.data.data);
      setReplyText('');
    } catch { alert('Failed to send reply'); }
    finally { setReplyLoading(false); }
  };

  const handleStatusChange = async (ticketId, status) => {
    try {
      const res = await api.patch(`/admin/support/${ticketId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets(prev => prev.map(t => t._id === ticketId ? res.data.data : t));
      if (selectedTicket?._id === ticketId) setSelectedTicket(res.data.data);
    } catch { alert('Failed to update status'); }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to permanently delete this ticket?')) return;
    try {
      await api.delete(`/admin/support/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(prev => prev.filter(t => t._id !== ticketId));
      if (selectedTicket?._id === ticketId) setSelectedTicket(null);
    } catch { alert('Failed to delete ticket'); }
  };

  const handleApprovePandit = async (id) => {
    if (!window.confirm('Approve this Pandit?')) return;
    try {
      await api.patch(`/admin/users/${id}/approve-pandit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersRes = await api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsersList(usersRes.data.data);
    } catch (err) { alert('Failed to approve'); }
  };

  const handleRejectPandit = async (id) => {
    if (!window.confirm('Reject this Pandit?')) return;
    try {
      await api.patch(`/admin/users/${id}/reject-pandit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersRes = await api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsersList(usersRes.data.data);
    } catch (err) { alert('Failed to reject'); }
  };

  const handleApproveCancellation = async (bookingId, reason) => {
    if (!window.confirm('Are you sure you want to approve this cancellation and refund the devotee (with 10% deduction)?')) return false;
    try {
      const res = await api.patch(`/admin/bookings/${bookingId}/cancel-approve`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Cancellation approved successfully. Refund of ₹${res.data.refundedAmount.toFixed(2)} processed to the devotee.`);
      const bookingsRes = await api.get('/admin/bookings', { headers: { Authorization: `Bearer ${token}` } });
      setBookingsList(bookingsRes.data.data || []);
      setSelectedBookingModal(null);
      const statsRes = await api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      setStats(statsRes.data.data);
      const paymentsRes = await api.get('/admin/payments', { headers: { Authorization: `Bearer ${token}` } });
      setPaymentsList(paymentsRes.data.data);
      if (window._adminFetchTickets) window._adminFetchTickets();
      return true;
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve cancellation');
      return false;
    }
  };

  const handleRejectCancellation = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this cancellation request and keep the booking active?')) return false;
    try {
      await api.patch(`/admin/bookings/${bookingId}/cancel-reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Cancellation request declined. Booking status restored to confirmed.');
      const bookingsRes = await api.get('/admin/bookings', { headers: { Authorization: `Bearer ${token}` } });
      setBookingsList(bookingsRes.data.data || []);
      setSelectedBookingModal(null);
      if (window._adminFetchTickets) window._adminFetchTickets();
      return true;
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline cancellation request');
      return false;
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = !filters.role || u.role === filters.role;
    let matchesVerification = true;
    if (filters.verification !== 'all' && u.role === 'pandit') {
      if (filters.verification === 'verified') matchesVerification = !!u.panditProfile?.isApproved;
      else if (filters.verification === 'pending') matchesVerification = !u.panditProfile?.isApproved && (u.panditProfile?.documents?.length > 0);
      else if (filters.verification === 'unverified') matchesVerification = !u.panditProfile?.isApproved && !(u.panditProfile?.documents?.length > 0);
    } else if (filters.verification !== 'all' && u.role !== 'pandit') {
      matchesVerification = false;
    }
    return matchesSearch && matchesRole && matchesVerification;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
            <ShieldIcon /> Admin
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => handleTabClick('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            Overview
          </button>
          <button
            onClick={() => handleTabClick('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Users size={20} />
            Users
          </button>
          <button
            onClick={() => handleTabClick('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'bookings' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <BookOpen size={20} />
            Bookings
          </button>
          <button
            onClick={() => handleTabClick('financials')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'financials' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Financials
          </button>
          <button
            onClick={() => handleTabClick('chats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'chats' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <MessageSquare size={20} />
            Chat Tracker
          </button>
          <button
            onClick={() => handleTabClick('support')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'support' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Headphones size={20} />
            Support
            {tickets.filter(t => t.status === 'open').length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {tickets.filter(t => t.status === 'open').length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabClick('broadcast')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'broadcast' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Megaphone size={20} />
            Broadcast
          </button>
          <button
            onClick={() => handleTabClick('payouts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'payouts' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Banknote size={20} />
            Payouts
            {payoutsList.filter(p => p.isEligible && p.payoutStatus === 'pending').length > 0 && (
              <span className="ml-auto bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {payoutsList.filter(p => p.isEligible && p.payoutStatus === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabClick('templeManagement')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'templeManagement' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Building size={20} />
            Temple Management
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chats' ? (
          <ChatTrackerTab />
        ) : (
          <div className="flex-1 overflow-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'users' && 'Manage Users'}
                {activeTab === 'bookings' && 'All Bookings'}
                {activeTab === 'financials' && 'Financial Records'}
                {activeTab === 'support' && 'Support Tickets'}
                {activeTab === 'broadcast' && '📢 Broadcast Notifications'}
                {activeTab === 'payouts' && 'Pandit Payouts (15-day Hold)'}
                {activeTab === 'templeManagement' && '🛕 Temple Seva Management'}
              </h2>
          {activeTab === 'templeManagement' && (
            <div className="flex gap-3 flex-wrap items-center">
              {/* Sub-tab switcher */}
              <div className="bg-gray-100 p-1 rounded-xl flex gap-1 border border-gray-200">
                <button
                  onClick={() => setTempleSubTab('list')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${templeSubTab === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  🏫 Temples ({templesList.length})
                </button>
                <button
                  onClick={() => setTempleSubTab('orders')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${templeSubTab === 'orders' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  📦 Orders & Chadava ({templeOrdersList.length})
                </button>
              </div>

              {templeSubTab === 'list' ? (
                <>
                  <input
                    type="text"
                    placeholder="Search temples..."
                    className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none w-48"
                    value={templeSearchQuery}
                    onChange={(e) => setTempleSearchQuery(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      setEditingTemple(null);
                      setTempleForm({
                        name: '',
                        deity: '',
                        location: '',
                        state: '',
                        image: '',
                        description: '',
                        chadavaEnabled: true,
                        prasadEnabled: true,
                        chadavaPresets: '51, 101, 251, 501, 1001',
                        prasadItemName: 'Prasad',
                        prasadItemPrice: 151,
                        prasadDeliveryDays: 7
                      });
                      setIsTempleModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm animate-pulse"
                  >
                    <Sparkles size={14} /> Add Temple
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none w-48"
                    value={templeOrderSearchQuery}
                    onChange={(e) => setTempleOrderSearchQuery(e.target.value)}
                  />
                  <select
                    className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    value={templeOrderTypeFilter}
                    onChange={(e) => setTempleOrderTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="chadava">🪙 Chadava (Donation)</option>
                    <option value="prasad">📦 Prasad Order</option>
                  </select>
                  <select
                    className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    value={templeOrderStatusFilter}
                    onChange={(e) => setTempleOrderStatusFilter(e.target.value)}
                  >
                    <option value="all">All Deliveries</option>
                    <option value="placed">Placed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </>
              )}
            </div>
          )}
          {activeTab === 'users' && (
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Search users..."
                className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none w-56"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <select
                className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value, verification: 'all' })}
              >
                <option value="">All Roles</option>
                <option value="pandit">Pandits</option>
                <option value="devotee">Devotees</option>
              </select>
              {(filters.role === 'pandit' || filters.role === '') && (
                <select
                  className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  value={filters.verification}
                  onChange={(e) => setFilters({ ...filters, verification: e.target.value })}
                >
                  <option value="all">All Status</option>
                  <option value="verified">✅ Verified</option>
                  <option value="pending">🟡 Pending</option>
                  <option value="unverified">🔴 Unverified</option>
                </select>
              )}
            </div>
          )}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Auto-Refund Quick Action Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 text-xl">💰</div>
                <div>
                  <div className="font-bold text-green-800 text-sm">Auto-Refund Job</div>
                  <div className="text-green-600 text-xs">Refunds paid bookings where OTP was never shared within 5 days of scheduled date → refunds to devotee's UPI Lite Wallet</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {autoRefundResult && (
                  <div className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg">
                    ✅ {autoRefundResult.processed} refunded{autoRefundResult.errors > 0 ? `, ⚠️ ${autoRefundResult.errors} errors` : ''}
                  </div>
                )}
                <button
                  onClick={async () => {
                    if (!window.confirm('Run auto-refund job now? This will process all eligible stale bookings.')) return;
                    setAutoRefundRunning(true);
                    setAutoRefundResult(null);
                    try {
                      const res = await api.post('/admin/run-auto-refund', {}, { headers: { Authorization: `Bearer ${token}` } });
                      setAutoRefundResult({ processed: res.data.processed || 0, errors: res.data.errors || 0 });
                      await fetchData(); // Refresh all stats/listings
                    } catch (err) {
                      alert('Error: ' + (err.response?.data?.message || err.message));
                    } finally {
                      setAutoRefundRunning(false);
                    }
                  }}
                  disabled={autoRefundRunning}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {autoRefundRunning ? (
                    <><RefreshCw size={14} className="animate-spin" /> Running...</>
                  ) : (
                    <><RefreshCw size={14} /> Run Now</>
                  )}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <StatCard title="Total Users" value={stats.totalUsers} icon={<Users size={24} />} color="blue" />
              <StatCard title="Pandits" value={stats.totalPandits} icon={<Users size={24} />} color="orange" />
              <StatCard title="Messages" value={stats.totalMessages} icon={<MessageSquare size={24} />} color="purple" />
              <StatCard title="Volume (INR)" value={`₹${(stats.totalRevenue / 100).toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} color="gray" />
              <StatCard title="Earnings (INR)" value={`₹${(stats.totalCompanyEarnings / 100).toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} color="green" />
            </div>

            {/* Users Table Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Recent Registrations</h3>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">City</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.slice(0, 5).map((u) => (
                    <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-800">{u.firstName} {u.lastName}</td>
                      <td className="p-4 text-gray-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'pandit' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{u.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
                <button onClick={() => navigate('/admin/bookings')} className="text-sm text-orange-600 font-semibold hover:underline">View All →</button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Devotee</th>
                    <th className="p-4 font-semibold">Pandit (Accepted By)</th>
                    <th className="p-4 font-semibold">Puja Type</th>
                    <th className="p-4 font-semibold">Scheduled</th>
                    <th className="p-4 font-semibold">Fee</th>
                    <th className="p-4 font-semibold">Mode</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsList.slice(0, 8).map((b) => {
                    const statusConfig = {
                      pending: 'bg-yellow-100 text-yellow-700',
                      confirmed: 'bg-green-100 text-green-700',
                      'in-progress': 'bg-blue-100 text-blue-700',
                      completed: 'bg-indigo-100 text-indigo-700',
                      cancelled: 'bg-gray-100 text-gray-600',
                      rejected: 'bg-red-100 text-red-700',
                    };
                    return (
                      <tr key={b._id} onClick={() => setSelectedBookingModal(b)}
                        className="border-b border-gray-50 hover:bg-orange-50/30 cursor-pointer transition-colors text-sm">
                        <td className="p-4 font-medium text-gray-800">{b.devotee?.firstName} {b.devotee?.lastName}</td>
                        <td className="p-4 text-gray-600">
                          {b.pandit ? `Pt. ${b.pandit.firstName} ${b.pandit.lastName}` : <span className="text-gray-400 italic text-xs">Awaiting acceptance</span>}
                        </td>
                        <td className="p-4 text-gray-700">{b.pujaType}</td>
                        <td className="p-4 text-gray-500 text-xs">
                          {b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          {b.scheduledTime && <span className="block text-gray-400">{b.scheduledTime}</span>}
                        </td>
                        <td className="p-4 font-bold text-gray-800">₹{(b.fee || 0).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${b.pujaMode === 'online' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {b.pujaMode === 'online' ? '🎥 Online' : '🏠 In-Person'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${statusConfig[b.status] || 'bg-gray-100 text-gray-600'}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {bookingsList.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No bookings yet.</div>}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">User Management</h3>
              <span className="text-sm text-gray-500">{filteredUsers.length} users found</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">City</th>
                  <th className="p-4 font-semibold">Verification</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} onClick={() => setSelectedUserModal(u)} className="border-b border-gray-50 hover:bg-orange-50/40 cursor-pointer transition-colors text-sm">
                    <td className="p-4 font-medium text-gray-800">{u.firstName} {u.lastName}</td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'pandit' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{u.city}</td>
                    <td className="p-4">
                      {u.role === 'pandit' ? (
                        u.panditProfile?.isApproved ? (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Verified</span>
                        ) : u.panditProfile?.documents?.length > 0 ? (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Pending</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Unverified</span>
                        )
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {u.role === 'pandit' && (
                        <div className="flex gap-2">
                          {u.panditProfile?.documents?.length > 0 && (
                            <a href={u.panditProfile.documents[0]} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="View Document">
                              <Eye size={16} />
                            </a>
                          )}
                          {!u.panditProfile?.isApproved && u.panditProfile?.documents?.length > 0 && (
                            <>
                              <button onClick={() => handleApprovePandit(u._id)} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Approve">
                                <CheckCircle size={16} />
                              </button>
                              <button onClick={() => handleRejectPandit(u._id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Reject">
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Devotee</th>
                  <th className="p-4 font-semibold">Pandit</th>
                  <th className="p-4 font-semibold">Volume</th>
                  <th className="p-4 font-semibold">Pandit Share</th>
                  <th className="p-4 font-semibold">Company Cut</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentsList.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4 text-gray-600 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-medium text-gray-800">{p.devotee?.firstName} {p.devotee?.lastName}</td>
                    <td className="p-4 font-medium text-gray-800">Pt. {p.pandit?.firstName} {p.pandit?.lastName}</td>
                    <td className="p-4 font-bold text-gray-800">₹{(p.amount / 100).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-orange-600">₹{((p.panditEarnings || 0) / 100).toLocaleString()}</td>
                    <td className="p-4 font-bold text-green-600">₹{((p.companyEarnings || 0) / 100).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="flex gap-6 h-[calc(100vh-160px)]">
            {/* Ticket List */}
            <div className="w-2/5 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
                    <button key={s} onClick={() => setTicketFilter(s)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors capitalize ${ticketFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                      {s === 'all' ? 'All' : s.replace('_', ' ')}
                      {s !== 'all' && ` (${tickets.filter(t => t.status === s).length})`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {tickets
                  .filter(t => ticketFilter === 'all' || t.status === ticketFilter)
                  .map(ticket => {
                    const statusColors = { open: 'bg-yellow-100 text-yellow-700', in_progress: 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-600' };
                    return (
                      <div key={ticket._id} onClick={() => { setSelectedTicket(ticket); setReplyText(ticket.adminReply || ''); }}
                        className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${selectedTicket?._id === ticket._id ? 'bg-orange-50 border-l-4 border-l-orange-500' : 'hover:bg-gray-50'
                          }`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-gray-800 text-sm line-clamp-1">{ticket.subject}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 capitalize ${statusColors[ticket.status]}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.userRole === 'pandit' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                            }`}>{ticket.userRole?.toUpperCase()}</span>
                          <span className="text-xs text-gray-500">{ticket.user?.firstName} {ticket.user?.lastName}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    );
                  })}
                {tickets.filter(t => ticketFilter === 'all' || t.status === ticketFilter).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Inbox size={32} className="text-gray-300 mb-3" />
                    <p className="text-gray-400 text-sm">No tickets found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Detail */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
              {!selectedTicket ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                    <Headphones size={28} className="text-orange-300" />
                  </div>
                  <p className="text-gray-500 font-medium">Select a ticket to view details</p>
                  <p className="text-gray-400 text-sm mt-1">Click any ticket from the list on the left</p>
                </div>
              ) : (
                <>
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{selectedTicket.subject}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedTicket.userRole === 'pandit' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                            }`}>{selectedTicket.userRole?.toUpperCase()}</span>
                          <span className="text-xs text-gray-600 font-medium">{selectedTicket.user?.firstName} {selectedTicket.user?.lastName}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{selectedTicket.user?.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={selectedTicket.status}
                          onChange={e => handleStatusChange(selectedTicket._id, e.target.value)}
                          className="text-xs font-bold border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50">
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTicket(selectedTicket._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Ticket"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full">{selectedTicket.category}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {new Date(selectedTicket.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* User Message */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 mb-2">USER MESSAGE</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
                    </div>

                    {/* Associated Booking Details */}
                    {selectedTicket.booking && (
                      <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200 space-y-3">
                        <p className="text-xs font-bold text-amber-800 flex items-center gap-1">📿 ASSOCIATED BOOKING</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-400">Puja & Mode</p>
                            <p className="font-semibold text-gray-800 capitalize">{selectedTicket.booking.pujaType} ({selectedTicket.booking.pujaMode})</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Booking Fee & Status</p>
                            <p className="font-semibold text-gray-800">
                              ₹{(selectedTicket.booking.fee || 0).toLocaleString()} · <span className="text-green-700 capitalize font-bold">{selectedTicket.booking.paymentStatus}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Scheduled Time</p>
                            <p className="font-semibold text-gray-800">
                              {selectedTicket.booking.scheduledDate ? new Date(selectedTicket.booking.scheduledDate).toLocaleDateString('en-IN') : ''} · {selectedTicket.booking.scheduledTime || '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Booking Status</p>
                            <p className="font-semibold text-gray-800 capitalize">{selectedTicket.booking.status.replace('_', ' ')}</p>
                          </div>
                          {selectedTicket.booking.devotee && (
                            <div>
                              <p className="text-xs text-gray-400">Devotee</p>
                              <p className="font-semibold text-gray-800">
                                {selectedTicket.booking.devotee.firstName} {selectedTicket.booking.devotee.lastName}
                              </p>
                            </div>
                          )}
                          {selectedTicket.booking.pandit && (
                            <div>
                              <p className="text-xs text-gray-400">Pandit</p>
                              <p className="font-semibold text-gray-800">
                                Pt. {selectedTicket.booking.pandit.firstName} {selectedTicket.booking.pandit.lastName}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Cancellation Action Buttons */}
                        {selectedTicket.booking.status === 'cancellation_requested' && selectedTicket.booking.paymentStatus === 'paid' && (
                          <div className="flex gap-3 pt-2 border-t border-amber-200">
                            <button
                              onClick={async () => {
                                const reason = prompt('Enter approval notes / reply (optional):', 'Cancellation approved and processed by Admin');
                                if (reason === null) return;
                                const success = await handleApproveCancellation(selectedTicket.booking._id, reason);
                                if (success) {
                                  try {
                                    const ticketRes = await api.patch(`/admin/support/${selectedTicket._id}`,
                                      { adminReply: `Cancellation approved. 90% refund has been processed. Notes: ${reason}`, status: 'resolved' },
                                      { headers: { Authorization: `Bearer ${token}` } }
                                    );
                                    setTickets(prev => prev.map(t => t._id === selectedTicket._id ? ticketRes.data.data : t));
                                    setSelectedTicket(ticketRes.data.data);
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }
                              }}
                              className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors text-xs text-center cursor-pointer"
                            >
                              Approve Cancellation & Refund 90%
                            </button>
                            <button
                              onClick={async () => {
                                const success = await handleRejectCancellation(selectedTicket.booking._id);
                                if (success) {
                                  try {
                                    const ticketRes = await api.patch(`/admin/support/${selectedTicket._id}`,
                                      { adminReply: `Cancellation request declined. The booking remains active. Please contact support for further queries.`, status: 'resolved' },
                                      { headers: { Authorization: `Bearer ${token}` } }
                                    );
                                    setTickets(prev => prev.map(t => t._id === selectedTicket._id ? ticketRes.data.data : t));
                                    setSelectedTicket(ticketRes.data.data);
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }
                              }}
                              className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-xs text-center cursor-pointer"
                            >
                              Decline Cancellation
                            </button>
                          </div>
                        )}

                        {selectedTicket.booking.status === 'cancelled' && (
                          <div className="bg-gray-100 text-gray-700 p-2.5 rounded-xl text-xs font-semibold text-center">
                            ✓ This booking is cancelled and refunded (90% refunded, 10% retained).
                          </div>
                        )}
                      </div>
                    )}

                    {/* Existing admin reply */}
                    {selectedTicket.adminReply && (
                      <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                        <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1"><Headphones size={12} /> YOUR REPLY</p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedTicket.adminReply}</p>
                        {selectedTicket.repliedAt && (
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Clock size={10} /> {new Date(selectedTicket.repliedAt).toLocaleString('en-IN')}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reply Box */}
                  <div className="p-5 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 mb-2">{selectedTicket.adminReply ? 'UPDATE REPLY' : 'WRITE REPLY'}</p>
                    <textarea rows={3} value={replyText} onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply to the user..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none resize-none" />
                    <div className="flex justify-end mt-3">
                      <button onClick={() => handleReply(selectedTicket._id)} disabled={replyLoading || !replyText.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm">
                        {replyLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={15} />}
                        {replyLoading ? 'Sending...' : 'Send Reply & Mark Resolved'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="space-y-6">
            {/* Broadcast Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Megaphone size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Send Broadcast Notification</h3>
                    <p className="text-white/80 text-sm">This will instantly notify all active devotees and pandits</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Target Audience Selector */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Target Audience</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'all', label: '👥 All Users', color: 'bg-gray-900 text-white', inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
                      { value: 'pandit', label: '🙏 Pandits Only', color: 'bg-orange-600 text-white', inactive: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
                      { value: 'devotee', label: '🙏🏻 Devotees Only', color: 'bg-blue-600 text-white', inactive: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setBroadcastTarget(opt.value)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${broadcastTarget === opt.value ? opt.color + ' shadow-md scale-105' : opt.inactive}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Notification Title</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Platform Update, Festival Announcement..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Message</label>
                  <textarea
                    rows={4}
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    placeholder="Write your announcement message here..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{broadcastMessage.length}/500</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Sends to {broadcastTarget === 'all' ? 'all connected users' : broadcastTarget === 'pandit' ? 'pandits only' : 'devotees only'} in real-time
                  </div>
                  <button
                    onClick={handleSendBroadcast}
                    disabled={broadcastLoading || !broadcastTitle.trim() || !broadcastMessage.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {broadcastLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Megaphone size={16} />
                    )}
                    {broadcastLoading ? 'Broadcasting...' : 'Send Broadcast'}
                  </button>
                </div>
              </div>
            </div>

            {/* Broadcast History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Broadcast History</h3>
                <span className="text-sm text-gray-400">{broadcastHistory.length} sent this session</span>
              </div>
              {broadcastHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Megaphone size={28} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-medium">No broadcasts sent yet</p>
                  <p className="text-gray-300 text-sm mt-1">Your sent announcements will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {broadcastHistory.map((b, i) => (
                    <div key={i} className="p-5 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-red-500">📢</span>
                            <h4 className="font-bold text-gray-800 text-sm">{b.title}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.target === 'pandit' ? 'bg-orange-100 text-orange-700' : b.target === 'devotee' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                              {b.target === 'pandit' ? 'Pandits' : b.target === 'devotee' ? 'Devotees' : 'Everyone'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{b.message}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400">{new Date(b.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-xs text-gray-300">{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 text-sm font-medium">Total Pending Payouts</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                  ₹{(payoutsList.filter(p => p.payoutStatus === 'pending').reduce((sum, p) => sum + p.panditEarnings, 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 text-sm font-medium">Eligible Payouts (Ready)</p>
                <h3 className="text-2xl font-bold text-green-600 mt-2">
                  ₹{(payoutsList.filter(p => p.isEligible).reduce((sum, p) => sum + p.panditEarnings, 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 text-sm font-medium">Total Paid Out</p>
                <h3 className="text-2xl font-bold text-blue-600 mt-2">
                  ₹{(payoutsList.filter(p => p.payoutStatus === 'paid').reduce((sum, p) => sum + p.panditEarnings, 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`py-3 px-6 font-semibold border-b-2 transition-all ${payoutTabFilter === 'pending' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                onClick={() => setPayoutTabFilter('pending')}
              >
                Pending Payouts ({payoutsList.filter(p => p.payoutStatus === 'pending').length})
              </button>
              <button
                className={`py-3 px-6 font-semibold border-b-2 transition-all ${payoutTabFilter === 'paid' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                onClick={() => setPayoutTabFilter('paid')}
              >
                Paid History ({payoutsList.filter(p => p.payoutStatus === 'paid').length})
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600 text-sm">Pandit Name & Details</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Booking Details</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Puja Amount</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Pandit Earnings (90%)</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Commission (10%)</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Status / Lock</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutsList.filter(p => p.payoutStatus === payoutTabFilter).length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400">
                        No payout records found in this category.
                      </td>
                    </tr>
                  ) : (
                    payoutsList.filter(p => p.payoutStatus === payoutTabFilter).map(p => (
                      <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-gray-800">
                            Pt. {p.pandit?.firstName} {p.pandit?.lastName}
                          </div>
                          <div className="text-xs text-gray-400">{p.pandit?.email}</div>
                          <div className="text-xs text-gray-400">{p.pandit?.phone}</div>
                          {p.pandit?.panditProfile?.bankDetails && (p.pandit.panditProfile.bankDetails.accountNumber || p.pandit.panditProfile.bankDetails.upiId) ? (
                            <div className="mt-2 p-2 bg-gray-50 border border-gray-100 rounded-lg text-[11px] text-gray-600 space-y-0.5">
                              <div className="font-bold text-gray-700">Bank Details:</div>
                              {p.pandit.panditProfile.bankDetails.bankName && <div><strong>Bank:</strong> {p.pandit.panditProfile.bankDetails.bankName}</div>}
                              {p.pandit.panditProfile.bankDetails.accountHolderName && <div><strong>Name:</strong> {p.pandit.panditProfile.bankDetails.accountHolderName}</div>}
                              {p.pandit.panditProfile.bankDetails.accountNumber && <div><strong>A/C:</strong> {p.pandit.panditProfile.bankDetails.accountNumber}</div>}
                              {p.pandit.panditProfile.bankDetails.ifscCode && <div><strong>IFSC:</strong> {p.pandit.panditProfile.bankDetails.ifscCode}</div>}
                              {p.pandit.panditProfile.bankDetails.upiId && <div><strong>UPI:</strong> {p.pandit.panditProfile.bankDetails.upiId}</div>}
                            </div>
                          ) : (
                            <div className="mt-2 text-[10px] text-red-500 italic font-semibold">⚠️ Bank details not provided yet</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-700">{p.booking?.pujaType || 'Puja'}</div>
                          <div className="text-xs text-gray-400">
                            Completed: {p.booking?.completedAt ? new Date(p.booking.completedAt).toLocaleDateString('en-IN') : 'N/A'}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-800">₹{(p.amount / 100).toLocaleString('en-IN')}</td>
                        <td className="p-4 font-semibold text-gray-800">₹{(p.panditEarnings / 100).toLocaleString('en-IN')}</td>
                        <td className="p-4 text-gray-500">₹{(p.companyEarnings / 100).toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          {p.payoutStatus === 'paid' ? (
                            <div>
                              <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                ✓ Paid
                              </span>
                              <div className="text-[10px] text-gray-400 mt-1">Txn: {p.payoutTransactionId}</div>
                              <div className="text-[10px] text-gray-400">{new Date(p.payoutDate).toLocaleDateString()}</div>
                            </div>
                          ) : p.isEligible ? (
                            <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
                              Eligible (Ready)
                            </span>
                          ) : (
                            <div>
                              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full">
                                Locked
                              </span>
                              <div className="text-[10px] text-gray-400 mt-1">{p.daysRemaining} days remaining</div>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {p.payoutStatus === 'pending' && (
                            <button
                              disabled={!p.isEligible || processingPayoutId === p._id}
                              onClick={() => handleProcessPayout(p._id)}
                              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${p.isEligible ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                              {processingPayoutId === p._id ? 'Processing...' : 'Pay Pandit'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'templeManagement' && (
          <div className="space-y-6">
            {templeSubTab === 'list' ? (
              <>
                {/* Temples Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {templesList
                    .filter(t => !templeSearchQuery || t.name.toLowerCase().includes(templeSearchQuery.toLowerCase()) || t.deity.toLowerCase().includes(templeSearchQuery.toLowerCase()) || t.location.toLowerCase().includes(templeSearchQuery.toLowerCase()))
                    .map(temple => (
                      <div key={temple._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${!temple.isActive ? 'opacity-60 border-red-200' : 'border-gray-100'}`}>
                        {/* Temple Image */}
                        <div className="relative h-36 bg-orange-50 overflow-hidden">
                          {temple.image ? (
                            <img src={temple.image} alt={temple.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">🛕</div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1">
                            {!temple.isActive && (
                              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Inactive</span>
                            )}
                            {temple.chadavaEnabled && (
                              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🪙 Chadava</span>
                            )}
                            {temple.prasadEnabled && (
                              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">📦 Prasad</span>
                            )}
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-4">
                          <h3 className="font-bold text-gray-800 text-base">{temple.name}</h3>
                          <p className="text-xs text-orange-600 font-semibold">{temple.deity}</p>
                          <p className="text-xs text-gray-400 mt-0.5">📍 {temple.location}, {temple.state}</p>
                          {temple.description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{temple.description}</p>
                          )}
                          {/* Chadava Presets */}
                          {temple.chadavaEnabled && temple.chadavaPresets?.length > 0 && (
                            <div className="mt-3">
                              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Chadava Presets</p>
                              <div className="flex flex-wrap gap-1">
                                {temple.chadavaPresets.map((p, i) => (
                                  <span key={i} className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">₹{p}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Prasad */}
                          {temple.prasadEnabled && temple.prasadItem && (
                            <div className="mt-2 bg-orange-50 rounded-xl p-2">
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Prasad</p>
                              <p className="text-xs font-semibold text-gray-700">{temple.prasadItem.name}</p>
                              <p className="text-[10px] text-gray-500">₹{temple.prasadItem.price} · {temple.prasadItem.deliveryDays} days delivery</p>
                            </div>
                          )}
                          {/* Actions */}
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => {
                                setEditingTemple(temple);
                                setTempleForm({
                                  name: temple.name,
                                  deity: temple.deity,
                                  location: temple.location,
                                  state: temple.state,
                                  image: temple.image || '',
                                  description: temple.description || '',
                                  chadavaEnabled: temple.chadavaEnabled,
                                  prasadEnabled: temple.prasadEnabled,
                                  chadavaPresets: (temple.chadavaPresets || []).join(', '),
                                  prasadItemName: temple.prasadItem?.name || 'Prasad',
                                  prasadItemPrice: temple.prasadItem?.price || 151,
                                  prasadDeliveryDays: temple.prasadItem?.deliveryDays || 7
                                });
                                setIsTempleModalOpen(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-xs rounded-xl transition-colors"
                            >
                              ✏️ Edit
                            </button>
                            {temple.isActive && (
                              <button
                                onClick={() => handleDeleteTemple(temple._id)}
                                className="flex items-center justify-center gap-1 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors"
                              >
                                <Trash2 size={12} /> Deactivate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {templesList.filter(t => !templeSearchQuery || t.name.toLowerCase().includes(templeSearchQuery.toLowerCase())).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
                    <div className="text-5xl mb-3">🛕</div>
                    <p className="text-gray-500 font-medium">No temples found</p>
                    <p className="text-gray-400 text-sm">Add your first temple using the button above</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Orders & Chadava Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-4 font-semibold text-gray-600 text-sm">Devotee</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm">Temple & Type</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm">Amount</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm">Delivery Status</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {templeOrdersList
                        .filter(o => {
                          const q = templeOrderSearchQuery.toLowerCase();
                          const matchSearch = !q || (o.devotee?.firstName + ' ' + o.devotee?.lastName).toLowerCase().includes(q) || (o.templeName || '').toLowerCase().includes(q);
                          const matchType = templeOrderTypeFilter === 'all' || o.orderType === templeOrderTypeFilter;
                          const matchStatus = templeOrderStatusFilter === 'all' || o.deliveryStatus === templeOrderStatusFilter;
                          return matchSearch && matchType && matchStatus;
                        })
                        .map(order => (
                          <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <p className="font-semibold text-gray-800 text-sm">{order.devotee?.firstName} {order.devotee?.lastName}</p>
                              <p className="text-xs text-gray-400">{order.devotee?.email}</p>
                              <p className="text-xs text-gray-400">{order.devotee?.phone || '—'}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-gray-700 text-sm">{order.templeName}</p>
                              {order.orderType === 'chadava' ? (
                                <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">🪙 Chadava (Donation)</span>
                              ) : (
                                <div>
                                  <span className="inline-block bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">📦 Prasad</span>
                                  {order.prasadItem && <p className="text-xs text-gray-500 mt-0.5">{order.prasadItem}</p>}
                                </div>
                              )}
                              {order.dedicatedTo && (
                                <p className="text-[10px] text-gray-400 mt-1">👤 For: {order.dedicatedTo}</p>
                              )}
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-green-700">₹{order.amount?.toLocaleString('en-IN')}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">TXN: {order.transactionId}</p>
                            </td>
                            <td className="p-4 text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="p-4">
                              {order.orderType === 'chadava' ? (
                                <span className="text-[10px] text-gray-400 italic">N/A — Monetary</span>
                              ) : (
                                <div>
                                  {(() => {
                                    const colorMap = { placed: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700' };
                                    return (
                                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${colorMap[order.deliveryStatus] || 'bg-gray-100 text-gray-600'}`}>
                                        {order.deliveryStatus || 'placed'}
                                      </span>
                                    );
                                  })()}
                                  {order.trackingId && <p className="text-[10px] text-gray-400 mt-0.5">Tracking: {order.trackingId}</p>}
                                  {order.orderType === 'prasad' && (
                                    <div className="mt-1.5 text-[10px] text-gray-400 space-y-0.5">
                                      <p className="font-semibold text-gray-500">Delivery To:</p>
                                      <p>{order.deliveryName}</p>
                                      <p>{order.deliveryAddress}, {order.deliveryCity} - {order.deliveryPincode}</p>
                                      <p>📞 {order.deliveryPhone}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              {order.orderType === 'prasad' && (
                                <div className="space-y-1.5">
                                  <select
                                    defaultValue={order.deliveryStatus || 'placed'}
                                    onChange={e => handleUpdateOrderStatus(order._id, { deliveryStatus: e.target.value })}
                                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 w-full"
                                  >
                                    <option value="placed">Placed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                  </select>
                                  <input
                                    type="text"
                                    placeholder="Tracking ID..."
                                    defaultValue={order.trackingId || ''}
                                    onBlur={e => {
                                      if (e.target.value !== (order.trackingId || '')) {
                                        handleUpdateOrderStatus(order._id, { trackingId: e.target.value });
                                      }
                                    }}
                                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 w-full"
                                  />
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {templeOrdersList.filter(o => {
                    const q = templeOrderSearchQuery.toLowerCase();
                    const matchSearch = !q || (o.devotee?.firstName + ' ' + o.devotee?.lastName).toLowerCase().includes(q);
                    const matchType = templeOrderTypeFilter === 'all' || o.orderType === templeOrderTypeFilter;
                    const matchStatus = templeOrderStatusFilter === 'all' || o.deliveryStatus === templeOrderStatusFilter;
                    return matchSearch && matchType && matchStatus;
                  }).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-4xl mb-2">📦</div>
                      <p className="text-gray-400 text-sm">No orders found matching your filters</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <BookingsTab bookingsList={bookingsList} onSelectBooking={setSelectedBookingModal} />
        )}
      </div>
        )}
      </div>

      {/* Add / Edit Temple Modal */}
      {isTempleModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setIsTempleModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-t-2xl flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{editingTemple ? '✏️ Edit Temple' : '🛕 Add New Temple'}</h3>
                <p className="text-orange-100 text-sm mt-0.5">{editingTemple ? `Editing: ${editingTemple.name}` : 'Fill in temple details below'}</p>
              </div>
              <button onClick={() => setIsTempleModalOpen(false)} className="text-white/70 hover:text-white text-3xl leading-none font-light">&times;</button>
            </div>

            <form onSubmit={handleTempleFormSubmit} className="p-6 space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Temple Name *</label>
                  <input required value={templeForm.name} onChange={e => setTempleForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="e.g. Tirupati Balaji" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Deity *</label>
                  <input required value={templeForm.deity} onChange={e => setTempleForm(f => ({ ...f, deity: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="e.g. Lord Venkateswara" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location *</label>
                  <input required value={templeForm.location} onChange={e => setTempleForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="e.g. Tirumala" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">State *</label>
                  <input required value={templeForm.state} onChange={e => setTempleForm(f => ({ ...f, state: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="e.g. Andhra Pradesh" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Image URL</label>
                  <input value={templeForm.image} onChange={e => setTempleForm(f => ({ ...f, image: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea rows={2} value={templeForm.description} onChange={e => setTempleForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none resize-none"
                    placeholder="Brief description of this temple..." />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Chadava Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">🪙 Chadava (Donations)</p>
                    <p className="text-xs text-gray-400">Allow devotees to make monetary offerings</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={templeForm.chadavaEnabled} onChange={e => setTempleForm(f => ({ ...f, chadavaEnabled: e.target.checked }))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                {templeForm.chadavaEnabled && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Quick-Select Preset Amounts (₹, comma-separated)</label>
                    <input value={templeForm.chadavaPresets} onChange={e => setTempleForm(f => ({ ...f, chadavaPresets: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                      placeholder="51, 101, 251, 501, 1001" />
                    <p className="text-[10px] text-gray-400 mt-1">These will appear as preset buttons for devotees on the temple page</p>
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Prasad Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-700 text-sm">📦 Prasad Delivery</p>
                    <p className="text-xs text-gray-400">Allow devotees to order prasad from this temple</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={templeForm.prasadEnabled} onChange={e => setTempleForm(f => ({ ...f, prasadEnabled: e.target.checked }))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                {templeForm.prasadEnabled && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 md:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Prasad Item Name</label>
                      <input value={templeForm.prasadItemName} onChange={e => setTempleForm(f => ({ ...f, prasadItemName: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                        placeholder="e.g. Ladoo Box" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price (₹)</label>
                      <input type="number" min="1" value={templeForm.prasadItemPrice} onChange={e => setTempleForm(f => ({ ...f, prasadItemPrice: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Delivery Days</label>
                      <input type="number" min="1" value={templeForm.prasadDeliveryDays} onChange={e => setTempleForm(f => ({ ...f, prasadDeliveryDays: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none" />
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setIsTempleModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingTemple}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-60 text-sm">
                  {isSubmittingTemple ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><Sparkles size={15} /> {editingTemple ? 'Save Changes' : 'Add Temple'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUserModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className={`p-6 rounded-t-2xl ${selectedUserModal.role === 'pandit' ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedUserModal.firstName?.charAt(0)}{selectedUserModal.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedUserModal.role === 'pandit' ? 'Pt. ' : ''}{selectedUserModal.firstName} {selectedUserModal.lastName}</h3>
                    <p className="text-white/80 text-sm">{selectedUserModal.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${selectedUserModal.role === 'pandit' ? 'bg-orange-900/40 text-orange-100' : 'bg-blue-900/40 text-blue-100'}`}>
                      {selectedUserModal.role.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedUserModal(null)} className="text-white/70 hover:text-white transition-colors text-3xl leading-none font-light">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Phone</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedUserModal.phone || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">City</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedUserModal.city || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Joined</p>
                    <p className="font-semibold text-gray-800 text-sm">{new Date(selectedUserModal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Account Status</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${selectedUserModal.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedUserModal.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedUserModal.role === 'pandit' && selectedUserModal.panditProfile && (
                <>
                  <hr className="border-gray-100" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Professional Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Experience</p>
                        <p className="font-bold text-orange-700 text-sm">{selectedUserModal.panditProfile.experience || 0} Years</p>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Fee Per Puja</p>
                        <p className="font-bold text-green-700 text-sm">₹{selectedUserModal.panditProfile.feePerPuja || 0}</p>
                      </div>
                      {selectedUserModal.panditProfile.specializations?.length > 0 && (
                        <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-2">Specializations</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedUserModal.panditProfile.specializations.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedUserModal.panditProfile.bio && (
                        <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-1">Bio</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{selectedUserModal.panditProfile.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-100" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Aadhar Verification</h4>
                    {selectedUserModal.panditProfile.isApproved ? (
                      <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-xl font-semibold text-sm">
                        <CheckCircle size={18} /> Verified &amp; Approved
                      </div>
                    ) : selectedUserModal.panditProfile.documents?.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 p-3 rounded-xl font-semibold text-sm">
                          <Clock size={18} /> Pending Admin Review
                        </div>
                        {selectedUserModal.panditProfile.aadharNumber && (
                          <p className="text-sm text-gray-600 px-1"><span className="font-semibold">Aadhar:</span> XXXX XXXX {selectedUserModal.panditProfile.aadharNumber.slice(-4)}</p>
                        )}
                        <a href={selectedUserModal.panditProfile.documents[0]} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium px-1">
                          <Eye size={16} /> View Uploaded Aadhar Document
                        </a>
                        <div className="flex gap-3 pt-1">
                          <button onClick={() => { handleApprovePandit(selectedUserModal._id); setSelectedUserModal(null); }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors text-sm">
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button onClick={() => { handleRejectPandit(selectedUserModal._id); setSelectedUserModal(null); }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors text-sm">
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-xl font-semibold text-sm">
                        <XCircle size={18} /> No Document Uploaded Yet
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBookingModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedBookingModal.pujaType}</h3>
                  <p className="text-orange-100 text-xs mt-1">ID: {selectedBookingModal._id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white capitalize">{selectedBookingModal.status}</span>
                  <button onClick={() => setSelectedBookingModal(null)} className="text-white/70 hover:text-white text-3xl leading-none font-light">&times;</button>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Devotee (Booked By)</p>
                  <p className="font-bold text-gray-800">{selectedBookingModal.devotee?.firstName} {selectedBookingModal.devotee?.lastName}</p>
                  <p className="text-sm text-gray-500">{selectedBookingModal.devotee?.email}</p>
                  <p className="text-sm text-gray-500">{selectedBookingModal.devotee?.phone || '—'}</p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Pandit (Accepted By)</p>
                  {selectedBookingModal.pandit ? (
                    <>
                      <p className="font-bold text-gray-800">Pt. {selectedBookingModal.pandit.firstName} {selectedBookingModal.pandit.lastName}</p>
                      <p className="text-sm text-gray-500">{selectedBookingModal.pandit.email}</p>
                      <p className="text-sm text-gray-500">{selectedBookingModal.pandit.phone || '—'}</p>
                    </>
                  ) : <p className="text-gray-400 italic text-sm">Not yet assigned</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Scheduled</p>
                  <p className="font-semibold text-gray-800 text-sm">{selectedBookingModal.scheduledDate ? new Date(selectedBookingModal.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p>
                  <p className="text-xs text-gray-500">{selectedBookingModal.scheduledTime || ''}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Fee & Payment</p>
                  <p className="font-bold text-green-700 text-sm">₹{(selectedBookingModal.fee || 0).toLocaleString()}</p>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full capitalize ${
                    selectedBookingModal.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                    selectedBookingModal.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{selectedBookingModal.paymentStatus}</span>
                </div>
                {selectedBookingModal.paymentStatus === 'paid' &&
                 ['confirmed', 'in-progress'].includes(selectedBookingModal.status) &&
                 !selectedBookingModal.completionOtp &&
                 selectedBookingModal.scheduledDate &&
                 (new Date() - new Date(selectedBookingModal.scheduledDate)) / (1000 * 60 * 60 * 24) >= 5 && (
                  <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase">
                      <span>⚠️ Stale booking (Overdue 5+ Days)</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      This booking has been paid but not completed or verified via OTP for more than 5 days. It is eligible for the auto-refund job, which will refund the booking fee to the devotee's UPI Lite Wallet.
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Mode</p>
                  <p className="font-semibold text-gray-800 text-sm capitalize">{selectedBookingModal.pujaMode || 'in-person'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">City</p>
                  <p className="font-semibold text-gray-800 text-sm">{selectedBookingModal.city || '—'}</p>
                </div>
                <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Address</p>
                  <p className="font-semibold text-gray-700 text-sm">{selectedBookingModal.address || '—'}</p>
                </div>
                {selectedBookingModal.notes && (
                  <div className="col-span-2 bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{selectedBookingModal.notes}</p>
                  </div>
                )}
                {selectedBookingModal.videoLink && (
                  <div className="col-span-2 bg-purple-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Video Link</p>
                    <a href={selectedBookingModal.videoLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline text-sm break-all">{selectedBookingModal.videoLink}</a>
                  </div>
                )}
                {selectedBookingModal.cancellationReason && (
                  <div className="col-span-2 bg-red-50 rounded-xl p-3">
                    <p className="text-xs text-red-400 font-bold mb-1 uppercase">Cancellation Reason</p>
                    <p className="text-sm text-gray-700">{selectedBookingModal.cancellationReason}</p>
                    {selectedBookingModal.cancelledBy && <p className="text-xs text-red-500 mt-1">Cancelled by: <span className="font-bold capitalize">{selectedBookingModal.cancelledBy}</span></p>}
                  </div>
                )}
                {selectedBookingModal.status === 'cancellation_requested' && (
                  <div className="col-span-2 flex gap-3 mt-2">
                    <button
                      onClick={() => handleApproveCancellation(selectedBookingModal._id)}
                      className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors text-xs text-center cursor-pointer"
                    >
                      Approve Cancellation
                    </button>
                    <button
                      onClick={() => handleRejectCancellation(selectedBookingModal._id)}
                      className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-xs text-center cursor-pointer"
                    >
                      Decline Cancellation
                    </button>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                <span>Created: {new Date(selectedBookingModal.createdAt).toLocaleString('en-IN')}</span>
                <span>Updated: {new Date(selectedBookingModal.updatedAt).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    gray: 'bg-gray-100 text-gray-700',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-gray-500 text-sm font-medium">{title}</div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
