import { create } from 'zustand';

// iOS Safari in Private Browsing mode throws a SecurityError on localStorage access.
// This safe wrapper silently falls back to an in-memory map so the app always loads.
const safeStorage = (() => {
  try {
    localStorage.setItem('__test__', '1');
    localStorage.removeItem('__test__');
    return {
      get: (k) => localStorage.getItem(k),
      set: (k, v) => localStorage.setItem(k, v),
    };
  } catch {
    const mem = {};
    return {
      get: (k) => mem[k] ?? null,
      set: (k, v) => { mem[k] = v; },
    };
  }
})();

const useLanguageStore = create((set) => ({
  lang: safeStorage.get('panditji_lang') || 'en', // 'en' | 'hi'
  setLang: (lang) => {
    safeStorage.set('panditji_lang', lang);
    set({ lang });
  },
}));

export default useLanguageStore;
