import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import axios from 'axios';
import { Users, MessageSquare, LayoutDashboard, LogOut, Headphones, RefreshCw, Inbox, CheckCircle, Clock, XCircle, Send, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalPandits: 0, totalDevotees: 0, totalMessages: 0, totalRevenue: 0, totalCompanyEarnings: 0 });
  const [usersList, setUsersList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({ search: '', role: '' });
  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    const fetchData = async () => {
      try {
        const statsRes = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data.data);

        const usersRes = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsersList(usersRes.data.data);

        const paymentsRes = await axios.get('http://localhost:5000/api/admin/payments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPaymentsList(paymentsRes.data.data);

        const ticketsRes = await axios.get('http://localhost:5000/api/admin/support', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(ticketsRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchTickets = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/support', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data.data);
      } catch (err) { console.error(err); }
    };
    window._adminFetchTickets = fetchTickets;
    fetchData();
  }, [token, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await axios.patch(`http://localhost:5000/api/admin/support/${ticketId}`,
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
      const res = await axios.patch(`http://localhost:5000/api/admin/support/${ticketId}`,
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
      await axios.delete(`http://localhost:5000/api/admin/support/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(prev => prev.filter(t => t._id !== ticketId));
      if (selectedTicket?._id === ticketId) setSelectedTicket(null);
    } catch { alert('Failed to delete ticket'); }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = !filters.role || u.role === filters.role;
    return matchesSearch && matchesRole;
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
            onClick={() => setActiveTab('overview')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Users size={20} />
            Users
          </button>
          <button 
            onClick={() => setActiveTab('financials')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'financials' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Financials
          </button>
          <button onClick={() => navigate('/admin/chats')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-colors">
            <MessageSquare size={20} />
            Chat Tracker
          </button>
          <button
            onClick={() => setActiveTab('support')}
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
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'users' && 'Manage Users'}
            {activeTab === 'financials' && 'Financial Records'}
            {activeTab === 'support' && 'Support Tickets'}
          </h2>
          {activeTab === 'users' && (
            <div className="flex gap-4">
               <input 
                 type="text" 
                 placeholder="Search users..." 
                 className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none w-64"
                 value={filters.search}
                 onChange={(e) => setFilters({...filters, search: e.target.value})}
               />
               <select 
                 className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                 value={filters.role}
                 onChange={(e) => setFilters({...filters, role: e.target.value})}
               >
                 <option value="">All Roles</option>
                 <option value="pandit">Pandits</option>
                 <option value="devotee">Devotees</option>
               </select>
            </div>
          )}
        </div>
        
        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <StatCard title="Total Users" value={stats.totalUsers} icon={<Users size={24} />} color="blue" />
              <StatCard title="Pandits" value={stats.totalPandits} icon={<Users size={24} />} color="orange" />
              <StatCard title="Messages" value={stats.totalMessages} icon={<MessageSquare size={24} />} color="purple" />
              <StatCard title="Volume (INR)" value={`₹${(stats.totalRevenue / 100).toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} color="gray" />
              <StatCard title="Earnings (INR)" value={`₹${(stats.totalCompanyEarnings / 100).toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} color="green" />
            </div>

            {/* Users Table Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.role === 'pandit' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
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
                  <th className="p-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-800">{u.firstName} {u.lastName}</td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        u.role === 'pandit' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{u.city}</td>
                    <td className="p-4 text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
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
                  {['all','open','in_progress','resolved','closed'].map(s => (
                    <button key={s} onClick={() => setTicketFilter(s)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors capitalize ${
                        ticketFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                        className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${
                          selectedTicket?._id === ticket._id ? 'bg-orange-50 border-l-4 border-l-orange-500' : 'hover:bg-gray-50'
                        }`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-gray-800 text-sm line-clamp-1">{ticket.subject}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 capitalize ${statusColors[ticket.status]}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ticket.userRole === 'pandit' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
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
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            selectedTicket.userRole === 'pandit' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
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
      </div>
    </div>
  );
};

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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
