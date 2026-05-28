import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useLanguageStore from '../../store/useLanguageStore';
import useT from '../../hooks/useT';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { BrandWordmark } from './BrandLogo';

import LanguageToggle from './LanguageToggle';

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath =
    user?.role === 'pandit' ? '/pandit-dashboard' :
    user?.role === 'admin'  ? '/admin/dashboard'  :
    '/devotee-dashboard';

  return (
    <nav className="bg-white border-b border-brandborder sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Brand */}
          <Link to="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
            <BrandWordmark />
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/pujas"   className="text-sm font-bold text-textMid hover:text-saffron transition-colors">{t('nav_book_puja')}</Link>
            <Link to="/pandits" className="text-sm font-bold text-textMid hover:text-saffron transition-colors">{t('nav_find_pandits')}</Link>
            <Link to="/e-puja"  className="text-sm font-bold text-textMid hover:text-saffron transition-colors">{t('nav_e_puja')}</Link>
            <a href="/#about"   className="text-sm font-bold text-textMid hover:text-saffron transition-colors">{t('nav_about')}</a>
          </div>

          {/* Right: Language Toggle + Auth */}
          <div className="flex items-center gap-3">

            {/* 🌐 Language toggle */}
            <LanguageToggle />

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-sm font-bold text-maroon hover:text-saffron transition-colors px-3 py-2 rounded-lg hover:bg-saffron-light">
                  {t('nav_login')}
                </Link>
                <Link to="/register" className="text-sm font-bold bg-saffron hover:bg-saffron-dark text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-saffron/20 hover:-translate-y-0.5">
                  {t('nav_get_started')}
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to={dashboardPath} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface border border-transparent hover:border-brandborder transition-all group">
                  <div className="w-8 h-8 rounded-full bg-saffron text-white flex items-center justify-center text-sm font-bold shadow-sm overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.firstName?.charAt(0) || <UserIcon size={14} />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-maroon leading-none group-hover:text-saffron transition-colors">{user?.firstName}</p>
                    <p className="text-xs text-textMuted capitalize leading-none mt-0.5">{user?.role}</p>
                  </div>
                  <ChevronDown size={14} className="text-textMuted hidden sm:block group-hover:text-saffron transition-colors" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-textMuted hover:text-maroon hover:bg-maroon-light rounded-xl transition-colors"
                  title={t('nav_sign_out')}
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
