import React, { useState } from 'react';
import { Search, ChevronDown, Video, MapPin, Clock, IndianRupee, User } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', cls: 'bg-green-100 text-green-700' },
  'in-progress': { label: 'In Progress', cls: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', cls: 'bg-indigo-100 text-indigo-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-600' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
};

const paymentConfig = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  refunded: 'bg-purple-100 text-purple-700',
};

const BookingsTab = ({ bookingsList, onSelectBooking }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const filtered = bookingsList.filter(b => {
    const q = search.toLowerCase();
    const devoteeName = `${b.devotee?.firstName || ''} ${b.devotee?.lastName || ''}`.toLowerCase();
    const panditName = `${b.pandit?.firstName || ''} ${b.pandit?.lastName || ''}`.toLowerCase();
    const matchesSearch = 
      devoteeName.includes(q) || 
      panditName.includes(q) || 
      (b.pujaType || '').toLowerCase().includes(q) || 
      (b.city || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesMode = modeFilter === 'all' || b.pujaMode === modeFilter;
    const matchesPayment = paymentFilter === 'all' || b.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesMode && matchesPayment;
  });

  // Stats
  const total = bookingsList.length;
  const pending = bookingsList.filter(b => b.status === 'pending').length;
  const confirmed = bookingsList.filter(b => b.status === 'confirmed').length;
  const completed = bookingsList.filter(b => b.status === 'completed').length;
  const totalRevenue = bookingsList.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.fee || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Bookings', value: total, color: 'bg-gray-50 text-gray-700 border-gray-200' },
          { label: 'Pending', value: pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          { label: 'Confirmed', value: confirmed, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'Completed', value: completed, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'bg-orange-50 text-orange-700 border-orange-200' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-4 text-center shadow-sm`}>
            <p className="text-xs font-semibold opacity-70 mb-1">{s.label}</p>
            <p className="text-2xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={15} className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text" 
            placeholder="Search devotee, pandit, puja, city..."
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 w-full"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="all">All Statuses</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select 
          value={modeFilter} 
          onChange={e => setModeFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="all">All Modes</option>
          <option value="in-person">In-Person</option>
          <option value="online">Online</option>
        </select>
        <select 
          value={paymentFilter} 
          onChange={e => setPaymentFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="all">All Payment Statuses</option>
          <option value="pending">Pending (Unpaid)</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
        <span className="text-sm text-gray-500 self-center ml-auto font-medium">{filtered.length} bookings found</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Devotee</th>
              <th className="p-4 font-semibold">Pandit</th>
              <th className="p-4 font-semibold">Puja Type</th>
              <th className="p-4 font-semibold">Scheduled</th>
              <th className="p-4 font-semibold">City</th>
              <th className="p-4 font-semibold">Mode</th>
              <th className="p-4 font-semibold">Fee</th>
              <th className="p-4 font-semibold">Payment</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr 
                key={b._id} 
                className="border-b border-gray-50 hover:bg-orange-50/30 cursor-pointer transition-colors text-sm"
                onClick={() => onSelectBooking(b)}
              >
                <td className="p-4 font-medium text-gray-800">{b.devotee?.firstName} {b.devotee?.lastName}</td>
                <td className="p-4 text-gray-600">
                  {b.pandit ? `Pt. ${b.pandit.firstName} ${b.pandit.lastName}` : <span className="text-gray-400 italic">Unassigned</span>}
                </td>
                <td className="p-4 text-gray-700 font-medium">{b.pujaType}</td>
                <td className="p-4 text-gray-500">
                  <div>{b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div>
                  <div className="text-xs text-gray-400">{b.scheduledTime || ''}</div>
                </td>
                <td className="p-4 text-gray-600">{b.city || '—'}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${b.pujaMode === 'online' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                    {b.pujaMode === 'online' ? '🎥 Online' : '🏠 In-Person'}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-800">₹{(b.fee || 0).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${paymentConfig[b.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                    {b.paymentStatus}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${(statusConfig[b.status] || statusConfig.pending).cls}`}>
                    {(statusConfig[b.status] || { label: b.status }).label}
                  </span>
                </td>
                <td className="p-4 text-gray-400">
                  <ChevronDown size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-12 text-center text-gray-400">No bookings found.</div>}
      </div>
    </div>
  );
};

export default BookingsTab;
