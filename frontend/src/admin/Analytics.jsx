import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import AdminDashboardLayout from './AdminDashboard';
import { Users, MessageSquare, BookOpen, CreditCard, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalPandits: 0, totalDevotees: 0, totalMessages: 0 });

  useEffect(() => {
    if (!token || user?.role !== 'admin') { navigate('/admin/login'); return; }
    api.get('/admin/stats').then(res => setStats(res.data.data)).catch(console.error);
  }, [token]);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={28} />, color: 'blue' },
    { label: 'Total Pandits', value: stats.totalPandits, icon: <Users size={28} />, color: 'orange' },
    { label: 'Total Devotees', value: stats.totalDevotees, icon: <Users size={28} />, color: 'green' },
    { label: 'Total Messages', value: stats.totalMessages, icon: <MessageSquare size={28} />, color: 'purple' },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  };

  return (
    <AdminDashboardLayout activeTab="/admin/analytics">
      <div className="p-8 overflow-y-auto flex-1">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Platform Analytics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {cards.map(card => (
            <div key={card.label} className={`bg-white rounded-2xl p-6 border ${colorMap[card.color].border} shadow-sm`}>
              <div className={`w-14 h-14 ${colorMap[card.color].bg} ${colorMap[card.color].text} rounded-2xl flex items-center justify-center mb-4`}>
                {card.icon}
              </div>
              <p className="text-gray-500 text-sm font-medium">{card.label}</p>
              <p className="text-4xl font-bold text-gray-800 mt-1">{card.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
          <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">Advanced charts and analytics are coming soon.</p>
          <p className="text-sm text-gray-400 mt-1">Connect a tool like Chart.js or Recharts to visualize booking trends over time.</p>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default Analytics;
