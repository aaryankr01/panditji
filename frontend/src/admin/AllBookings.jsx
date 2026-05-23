import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import AdminDashboardLayout from './AdminDashboard';
import { Search, ChevronDown, ChevronUp, Video, MapPin, Clock, IndianRupee, User, X } from 'lucide-react';

const statusConfig = {
  pending:    { label: 'Pending',     cls: 'bg-yellow-100 text-yellow-700' },
  confirmed:  { label: 'Confirmed',   cls: 'bg-green-100 text-green-700' },
  'in-progress': { label: 'In Progress', cls: 'bg-blue-100 text-blue-700' },
  completed:  { label: 'Completed',   cls: 'bg-indigo-100 text-indigo-700' },
  cancelled:  { label: 'Cancelled',   cls: 'bg-gray-100 text-gray-600' },
  rejected:   { label: 'Rejected',    cls: 'bg-red-100 text-red-700' },
};

const paymentConfig = {
  pending:  'bg-yellow-100 text-yellow-700',
  paid:     'bg-green-100 text-green-700',
  refunded: 'bg-purple-100 text-purple-700',
};

const AllBookings = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (!token || user?.role !== 'admin') { navigate('/admin/login'); return; }
    api.get('/admin/bookings').then(res => setBookings(res.data.data || [])).catch(console.error);
  }, [token]);

  const handleApproveCancellation = async (bookingId, reason) => {
    if (!window.confirm('Are you sure you want to approve this cancellation and refund the devotee (with 10% deduction)?')) return;
    try {
      const res = await api.patch(`/admin/bookings/${bookingId}/cancel-approve`, { reason });
      alert(`Cancellation approved successfully. Refund of ₹${res.data.refundedAmount.toFixed(2)} processed to the devotee.`);
      const bookingsRes = await api.get('/admin/bookings');
      setBookings(bookingsRes.data.data || []);
      setSelectedBooking(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve cancellation');
    }
  };

  const handleRejectCancellation = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this cancellation request and keep the booking active?')) return;
    try {
      await api.patch(`/admin/bookings/${bookingId}/cancel-reject`, {});
      alert('Cancellation request declined. Booking status restored to confirmed.');
      const bookingsRes = await api.get('/admin/bookings');
      setBookings(bookingsRes.data.data || []);
      setSelectedBooking(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline cancellation request');
    }
  };

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchesSearch = `${b.devotee?.firstName} ${b.devotee?.lastName} ${b.pandit?.firstName} ${b.pandit?.lastName} ${b.pujaType} ${b.city}`.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesMode = modeFilter === 'all' || b.pujaMode === modeFilter;
    return matchesSearch && matchesStatus && matchesMode;
  });

  // Stats
  const total = bookings.length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.fee || 0), 0);

  return (
    <AdminDashboardLayout activeTab="/admin/bookings">
      <div className="p-8 overflow-y-auto flex-1">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Bookings</h2>

        {/* Stats Strip */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', value: total, color: 'bg-gray-50 text-gray-700 border-gray-200' },
            { label: 'Pending', value: pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            { label: 'Confirmed', value: confirmed, color: 'bg-green-50 text-green-700 border-green-200' },
            { label: 'Completed', value: completed, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'bg-orange-50 text-orange-700 border-orange-200' },
          ].map(s => (
            <div key={s.label} className={`${s.color} border rounded-2xl p-4 text-center`}>
              <p className="text-xs font-semibold opacity-70 mb-1">{s.label}</p>
              <p className="text-2xl font-extrabold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text" placeholder="Search devotee, pandit, puja, city..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 w-72"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400">
            <option value="all">All Statuses</option>
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={modeFilter} onChange={e => setModeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400">
            <option value="all">All Modes</option>
            <option value="in-person">In-Person</option>
            <option value="online">Online</option>
          </select>
          <span className="ml-auto text-sm text-gray-500 self-center">{filtered.length} bookings</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
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
                <tr key={b._id} className="border-b border-gray-50 hover:bg-orange-50/30 cursor-pointer transition-colors text-sm"
                    onClick={() => setSelectedBooking(b)}>
                  <td className="p-4 font-medium text-gray-800">{b.devotee?.firstName} {b.devotee?.lastName}</td>
                  <td className="p-4 text-gray-600">{b.pandit ? `Pt. ${b.pandit.firstName} ${b.pandit.lastName}` : <span className="text-gray-400 italic">Unassigned</span>}</td>
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

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedBooking.pujaType}</h3>
                  <p className="text-orange-100 text-sm mt-1">Booking ID: {selectedBooking._id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white capitalize`}>
                    {(statusConfig[selectedBooking.status] || { label: selectedBooking.status }).label}
                  </span>
                  <button onClick={() => setSelectedBooking(null)} className="text-white/70 hover:text-white text-3xl leading-none font-light">&times;</button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* People */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1"><User size={12} /> Devotee (Booked By)</p>
                  <p className="font-bold text-gray-800">{selectedBooking.devotee?.firstName} {selectedBooking.devotee?.lastName}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.devotee?.email}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.devotee?.phone || '—'}</p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1"><User size={12} /> Pandit (Accepted By)</p>
                  {selectedBooking.pandit ? (
                    <>
                      <p className="font-bold text-gray-800">Pt. {selectedBooking.pandit.firstName} {selectedBooking.pandit.lastName}</p>
                      <p className="text-sm text-gray-500">{selectedBooking.pandit.email}</p>
                      <p className="text-sm text-gray-500">{selectedBooking.pandit.phone || '—'}</p>
                    </>
                  ) : (
                    <p className="text-gray-400 italic text-sm">Not yet assigned</p>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Booking Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                    <Clock size={16} className="text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Scheduled</p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {selectedBooking.scheduledDate ? new Date(selectedBooking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                      </p>
                      <p className="text-xs text-gray-500">{selectedBooking.scheduledTime || ''}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                    <IndianRupee size={16} className="text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Fee & Payment</p>
                      <p className="font-bold text-green-700 text-sm">₹{(selectedBooking.fee || 0).toLocaleString()}</p>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full capitalize ${paymentConfig[selectedBooking.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {selectedBooking.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                    {selectedBooking.pujaMode === 'online' ? <Video size={16} className="text-purple-600 mt-0.5 shrink-0" /> : <MapPin size={16} className="text-orange-500 mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-xs text-gray-400">Mode</p>
                      <p className="font-semibold text-gray-800 text-sm capitalize">{selectedBooking.pujaMode || 'in-person'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                    <MapPin size={16} className="text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">City</p>
                      <p className="font-semibold text-gray-800 text-sm">{selectedBooking.city || '—'}</p>
                    </div>
                  </div>
                  <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Address</p>
                    <p className="font-semibold text-gray-700 text-sm">{selectedBooking.address || '—'}</p>
                  </div>
                  {selectedBooking.notes && (
                    <div className="col-span-2 bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Notes from Devotee</p>
                      <p className="text-sm text-gray-700">{selectedBooking.notes}</p>
                    </div>
                  )}
                  {selectedBooking.videoLink && (
                    <div className="col-span-2 bg-purple-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Video Meeting Link</p>
                      <a href={selectedBooking.videoLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline text-sm font-medium break-all">{selectedBooking.videoLink}</a>
                    </div>
                  )}
                  {selectedBooking.cancellationReason && (
                    <div className="col-span-2 bg-red-50 rounded-xl p-3">
                      <p className="text-xs text-red-400 font-bold mb-1 uppercase tracking-wider">Cancellation Reason</p>
                      <p className="text-sm text-gray-700">{selectedBooking.cancellationReason}</p>
                      {selectedBooking.cancelledBy && <p className="text-xs text-red-500 mt-1">Cancelled by: <span className="font-bold capitalize">{selectedBooking.cancelledBy}</span></p>}
                    </div>
                  )}
                  {selectedBooking.status === 'cancellation_requested' && (
                    <div className="col-span-2 flex gap-3 mt-2">
                      <button
                        onClick={() => handleApproveCancellation(selectedBooking._id)}
                        className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors text-xs text-center cursor-pointer font-sans"
                      >
                        Approve Cancellation
                      </button>
                      <button
                        onClick={() => handleRejectCancellation(selectedBooking._id)}
                        className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-xs text-center cursor-pointer font-sans"
                      >
                        Decline Cancellation
                      </button>
                    </div>
                  )}
                  {selectedBooking.completedAt && (
                    <div className="col-span-2 bg-indigo-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Completed At</p>
                      <p className="text-sm font-semibold text-indigo-700">{new Date(selectedBooking.completedAt).toLocaleString('en-IN')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                <span>Created: {new Date(selectedBooking.createdAt).toLocaleString('en-IN')}</span>
                <span>Updated: {new Date(selectedBooking.updatedAt).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
};

export default AllBookings;
