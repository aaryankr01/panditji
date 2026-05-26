import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'hi', label: 'हिन्दी',  flag: '🇮🇳', short: 'HI' },
];

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  // Clean language code to 2 letters (e.g. "en-US" -> "en")
  const currentLang = i18n.language ? i18n.language.substring(0, 2) : 'en';
  const current = LANGS.find(l => l.code === currentLang) || LANGS[0];

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
              onClick={() => { i18n.changeLanguage(l.code); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 16px',
                background: currentLang === l.code ? '#FFF3E8' : 'transparent',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif", fontWeight: currentLang === l.code ? 800 : 600,
                fontSize: 13, color: currentLang === l.code ? '#7B1D0E' : '#6B4C3B',
                textAlign: 'left', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (currentLang !== l.code) e.currentTarget.style.background = '#FAF7F2'; }}
              onMouseLeave={e => { if (currentLang !== l.code) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 18 }}>{l.flag}</span>
              <span>{l.label}</span>
              {currentLang === l.code && <span style={{ marginLeft: 'auto', color: '#E8710A', fontSize: 16 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
