import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useLanguageStore from '../../store/useLanguageStore';
import useT from '../../hooks/useT';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { BrandWordmark } from './BrandLogo';

// ── Language Toggle Component ─────────────────────────────────────────────────
const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'hi', label: 'हिन्दी',  flag: '🇮🇳', short: 'HI' },
];

const LanguageToggle = () => {
  const { lang, setLang } = useLanguageStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find(l => l.code === lang) || LANGS[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 10,
          border: '1.5px solid #EAD9CC',
          background: open ? '#FFF3E8' : '#fff',
          cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
          fontWeight: 700, fontSize: 13, color: '#7B1D0E',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: 16 }}>{current.flag}</span>
        <span>{current.short}</span>
        <ChevronDown size={13} style={{ color: '#A07060', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: '#fff', borderRadius: 12, border: '1.5px solid #EAD9CC',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
          minWidth: 140, zIndex: 999,
        }}>
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 16px',
                background: lang === l.code ? '#FFF3E8' : 'transparent',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif", fontWeight: lang === l.code ? 800 : 600,
                fontSize: 13, color: lang === l.code ? '#7B1D0E' : '#6B4C3B',
                textAlign: 'left', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.background = '#FAF7F2'; }}
              onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 18 }}>{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && <span style={{ marginLeft: 'auto', color: '#E8710A', fontSize: 16 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
                  <div className="w-8 h-8 rounded-full bg-saffron text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {user?.firstName?.charAt(0) || <UserIcon size={14} />}
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
