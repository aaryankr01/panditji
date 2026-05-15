import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { BrandWordmark } from './BrandLogo';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath =
    user?.role === 'pandit' ? '/pandit-dashboard' :
    user?.role === 'admin'  ? '/admin/dashboard'  :
    '/devotee-dashboard';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Brand */}
          <Link to="/" className="flex-shrink-0">
            <BrandWordmark />
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/pujas"   className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors">Book a Puja</Link>
            <Link to="/pandits" className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors">Find Pandits</Link>
            <a href="/#about" className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors">About Us</a>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                  Log in
                </Link>
                <Link to="/register" className="text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to={dashboardPath} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold">
                    {user?.firstName?.charAt(0) || <UserIcon size={14} />}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-gray-800 leading-none">{user?.firstName}</p>
                    <p className="text-xs text-gray-500 capitalize leading-none mt-0.5">{user?.role}</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
