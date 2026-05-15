import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import AdminDashboardLayout from './AdminDashboard';
import { Users, Search, Trash2 } from 'lucide-react';

const ManagePandits = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [pandits, setPandits] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'admin') { navigate('/admin/login'); return; }
    api.get('/admin/users?role=pandit').then(res => setPandits(res.data.data)).catch(console.error);
  }, [token]);

  const filtered = pandits.filter(p => 
    `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminDashboardLayout activeTab="/admin/pandits">
      <div className="p-8 overflow-y-auto flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Pandits</h2>
          <div className="relative">
            <input type="text" placeholder="Search pandits..." value={search} onChange={e => setSearch(e.target.value)}
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
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                  <td className="p-4 font-medium text-gray-800">Pt. {p.firstName} {p.lastName}</td>
                  <td className="p-4 text-gray-600">{p.email}</td>
                  <td className="p-4 text-gray-600">{p.phone || '—'}</td>
                  <td className="p-4 text-gray-600">{p.city || '—'}</td>
                  <td className="p-4 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-gray-400">No pandits found.</div>}
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default ManagePandits;
