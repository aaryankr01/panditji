import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import AdminDashboardLayout from './AdminDashboard';
import { Search } from 'lucide-react';

const ManageDevotees = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [devotees, setDevotees] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'admin') { navigate('/admin/login'); return; }
    api.get('/admin/users?role=devotee').then(res => setDevotees(res.data.data)).catch(console.error);
  }, [token]);

  const filtered = devotees.filter(d =>
    `${d.firstName} ${d.lastName} ${d.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminDashboardLayout activeTab="/admin/devotees">
      <div className="p-8 overflow-y-auto flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Devotees</h2>
          <div className="relative">
            <input type="text" placeholder="Search devotees..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">City</th>
                <th className="p-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                  <td className="p-4 font-medium text-gray-800">{d.firstName} {d.lastName}</td>
                  <td className="p-4 text-gray-600">{d.email}</td>
                  <td className="p-4 text-gray-600">{d.phone || '—'}</td>
                  <td className="p-4 text-gray-600">{d.city || '—'}</td>
                  <td className="p-4 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-gray-400">No devotees found.</div>}
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default ManageDevotees;
