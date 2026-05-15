import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Users, MessageSquare, LayoutDashboard, LogOut, CreditCard, BookOpen, TrendingUp, BarChart2 } from 'lucide-react';
import { BrandWordmark } from '../components/common/BrandLogo';

const AdminDashboardLayout = ({ activeTab, children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/admin/dashboard' },
    { label: 'Manage Pandits', icon: <Users size={18} />, path: '/admin/pandits' },
    { label: 'Manage Devotees', icon: <Users size={18} />, path: '/admin/devotees' },
    { label: 'All Bookings', icon: <BookOpen size={18} />, path: '/admin/bookings' },
    { label: 'Payments', icon: <CreditCard size={18} />, path: '/admin/payments' },
    { label: 'Chat Tracker', icon: <MessageSquare size={18} />, path: '/admin/chats' },
    { label: 'Analytics', icon: <BarChart2 size={18} />, path: '/admin/analytics' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <div className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <BrandWordmark logoSize={28} textClass="text-base" />
          <p className="text-xs text-orange-400 font-semibold mt-1 ml-10">Admin Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link 
              key={item.path}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                activeTab === item.path ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.name || 'Admin'}</p>
              <p className="text-gray-500 text-xs">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
