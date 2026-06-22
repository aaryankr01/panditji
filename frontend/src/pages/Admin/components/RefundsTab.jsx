import React, { useState } from 'react';
import { Search, ChevronDown, Check, X, Clock, AlertCircle, RefreshCw, Calendar, User } from 'lucide-react';

const RefundsTab = ({ bookingsList, onSelectBooking, onApproveCancellation, onRejectCancellation }) => {
  const [search, setSearch] = useState('');
  const [subTab, setSubTab] = useState('pending'); // 'pending' or 'history'

  // Filter lists based on status
  const pendingRequests = bookingsList.filter(b => b.status === 'cancellation_requested');
  const refundedHistory = bookingsList.filter(b => b.status === 'cancelled' && b.paymentStatus === 'refunded');

  const currentList = subTab === 'pending' ? pendingRequests : refundedHistory;

  const filtered = currentList.filter(b => {
    const q = search.toLowerCase();
    const devoteeName = `${b.devotee?.firstName || ''} ${b.devotee?.lastName || ''}`.toLowerCase();
    const panditName = b.pandit ? `${b.pandit?.firstName || ''} ${b.pandit?.lastName || ''}`.toLowerCase() : 'unassigned';
    return (
      devoteeName.includes(q) ||
      panditName.includes(q) ||
      (b.pujaType || '').toLowerCase().includes(q) ||
      (b.cancellationReason || '').toLowerCase().includes(q)
    );
  });

  // Stats
  const pendingCount = pendingRequests.length;
  const pendingAmount = pendingRequests.reduce((sum, b) => sum + (b.fee || 0), 0);
  const historyCount = refundedHistory.length;
  const refundedAmount = refundedHistory.reduce((sum, b) => sum + (b.fee || 0) * 0.9, 0);

  const handleApprove = async (e, booking) => {
    e.stopPropagation(); // Avoid triggering row click to open booking details modal
    const reason = prompt(
      'Enter approval notes (optional):',
      'Cancellation approved and processed by Admin'
    );
    if (reason === null) return;
    await onApproveCancellation(booking._id, reason);
  };

  const handleReject = async (e, booking) => {
    e.stopPropagation(); // Avoid triggering row click to open booking details modal
    await onRejectCancellation(booking._id);
  };

  return (
    <div className="space-y-6">
      {/* Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-xs font-semibold text-amber-800 opacity-80 mb-1">Pending Requests</p>
          <p className="text-2xl font-extrabold text-amber-900">{pendingCount}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-xs font-semibold text-orange-800 opacity-80 mb-1">Pending Refund Value</p>
          <p className="text-2xl font-extrabold text-orange-900">₹{(pendingAmount * 0.9).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-xs font-semibold text-green-800 opacity-80 mb-1">Processed Refunds</p>
          <p className="text-2xl font-extrabold text-green-900">{historyCount}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-xs font-semibold text-purple-800 opacity-80 mb-1">Total Refunded (Lifetime)</p>
          <p className="text-2xl font-extrabold text-purple-900">₹{refundedAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Sub tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Toggle buttons */}
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('pending')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              subTab === 'pending'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Pending Requests ({pendingCount})
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              subTab === 'history'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Refund History ({historyCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search devotee, pandit, puja..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-400 w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Devotee</th>
              <th className="p-4 font-semibold">Pandit</th>
              <th className="p-4 font-semibold">Puja Type</th>
              <th className="p-4 font-semibold">Fee</th>
              <th className="p-4 font-semibold">Est. Refund (90%)</th>
              <th className="p-4 font-semibold">Reason</th>
              <th className="p-4 font-semibold">Requested On</th>
              <th className="p-4 font-semibold">Actions / Status</th>
              <th className="p-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr
                key={b._id}
                className="border-b border-gray-50 hover:bg-orange-50/30 cursor-pointer transition-colors text-xs"
                onClick={() => onSelectBooking(b)}
              >
                <td className="p-4 font-medium text-gray-800">
                  <div>{b.devotee?.firstName} {b.devotee?.lastName}</div>
                  <div className="text-[10px] text-gray-400">{b.devotee?.email}</div>
                </td>
                <td className="p-4 text-gray-600">
                  {b.pandit ? (
                    <>
                      <div>Pt. {b.pandit.firstName} {b.pandit.lastName}</div>
                      <div className="text-[10px] text-gray-400">{b.pandit.email}</div>
                    </>
                  ) : (
                    <span className="text-gray-400 italic text-[11px]">Unassigned</span>
                  )}
                </td>
                <td className="p-4 text-gray-700 font-medium">{b.pujaType}</td>
                <td className="p-4 font-bold text-gray-800">₹{(b.fee || 0).toLocaleString('en-IN')}</td>
                <td className="p-4 font-bold text-green-700">₹{((b.fee || 0) * 0.9).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                <td className="p-4 text-gray-500 max-w-[200px] truncate" title={b.cancellationReason}>
                  {b.cancellationReason || <span className="text-gray-300 italic">No reason provided</span>}
                </td>
                <td className="p-4 text-gray-500">
                  <div>{new Date(b.updatedAt || b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div className="text-[10px] text-gray-400">{new Date(b.updatedAt || b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td className="p-4" onClick={e => e.stopPropagation()}>
                  {subTab === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={e => handleApprove(e, b)}
                        className="flex items-center gap-1 py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-[10px]"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={e => handleReject(e, b)}
                        className="flex items-center gap-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-[10px]"
                      >
                        <X size={12} /> Decline
                      </button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                      ✓ Refunded
                    </span>
                  )}
                </td>
                <td className="p-4 text-gray-400">
                  <ChevronDown size={14} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-xs">
            No refund records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundsTab;
