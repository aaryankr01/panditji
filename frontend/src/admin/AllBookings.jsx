import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import AdminDashboardLayout from './AdminDashboard';

const AllBookings = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!token || user?.role !== 'admin') { navigate('/admin/login'); return; }
    api.get('/admin/bookings').then(res => setBookings(res.data.data || [])).catch(console.error);
  }, [token]);

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  return (
    <AdminDashboardLayout activeTab="/admin/bookings">
      <div className="p-8 overflow-y-auto flex-1">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Bookings</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-semibold">Devotee</th>
                <th className="p-4 font-semibold">Pandit</th>
                <th className="p-4 font-semibold">Puja Type</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                  <td className="p-4 text-gray-800 font-medium">{b.devotee?.firstName} {b.devotee?.lastName}</td>
                  <td className="p-4 text-gray-600">Pt. {b.pandit?.firstName} {b.pandit?.lastName}</td>
                  <td className="p-4 text-gray-600">{b.pujaType}</td>
                  <td className="p-4 text-gray-500">{new Date(b.date).toLocaleDateString()} at {b.time}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${statusColor[b.status] || 'bg-gray-100 text-gray-600'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <div className="p-8 text-center text-gray-400">No bookings yet.</div>}
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AllBookings;
