import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import AdminDashboardLayout from './AdminDashboard';

const Payments = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!token || user?.role !== 'admin') { navigate('/admin/login'); return; }
    api.get('/admin/payments').then(res => setPayments(res.data.data || [])).catch(console.error);
  }, [token]);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <AdminDashboardLayout activeTab="/admin/payments">
      <div className="p-8 overflow-y-auto flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-green-700 font-bold">
            Total Revenue: ₹{totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-semibold">Transaction ID</th>
                <th className="p-4 font-semibold">Devotee</th>
                <th className="p-4 font-semibold">Pandit</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Method</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                  <td className="p-4 font-mono text-xs text-gray-500">{p.transactionId}</td>
                  <td className="p-4 text-gray-800">{p.devotee?.firstName} {p.devotee?.lastName}</td>
                  <td className="p-4 text-gray-600">Pt. {p.pandit?.firstName} {p.pandit?.lastName}</td>
                  <td className="p-4 font-bold text-gray-800">₹{p.amount?.toLocaleString()}</td>
                  <td className="p-4 text-gray-600 capitalize">{p.paymentMethod}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <div className="p-8 text-center text-gray-400">No payment records yet.</div>}
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default Payments;
